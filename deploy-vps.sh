#!/usr/bin/env bash
# ==============================================================================
# CORNUS ATELIER - Production VPS Automated Installer & Deployment Script
# Repository: https://github.com/farazpy/Cornus-Fashion
# ==============================================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}"
echo "================================================================="
echo "   CORNUS FASHION ATELIER - VPS DEPLOYMENT & INSTALLATION"
echo "================================================================="
echo -e "${NC}"

# 1. Verify Node.js (>= 20.x required)
echo -e "${YELLOW}[1/6] Checking Node.js runtime...${NC}"
if ! command -v node >/dev/null 2>&1; then
  echo -e "${YELLOW}Node.js not detected. Installing Node.js 20 LTS (NodeSource)...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  NODE_VER=$(node -v)
  echo -e "${GREEN}✓ Node.js ${NODE_VER} detected.${NC}"
fi

# 2. Check & Install PM2 process manager
echo -e "${YELLOW}[2/6] Checking PM2 daemon manager...${NC}"
if ! command -v pm2 >/dev/null 2>&1; then
  echo -e "${YELLOW}Installing PM2 globally...${NC}"
  sudo npm install -g pm2
else
  echo -e "${GREEN}✓ PM2 is already installed.${NC}"
fi

# 3. Environment configuration
echo -e "${YELLOW}[3/6] Setting up environment variables (.env)...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env from .env.example.${NC}"
    echo -e "${YELLOW}Please remember to configure your MySQL credentials in .env!${NC}"
  else
    cat <<EOF > .env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=cornus_db
EOF
    echo -e "${GREEN}✓ Created default .env template.${NC}"
  fi
else
  echo -e "${GREEN}✓ Existing .env detected.${NC}"
fi

# 4. Install Dependencies
echo -e "${YELLOW}[4/6] Installing npm dependencies...${NC}"
npm install --production=false

# 5. Build Production Bundle
echo -e "${YELLOW}[5/6] Building production frontend with Vite...${NC}"
npm run build

# 6. PM2 Launch
echo -e "${YELLOW}[6/6] Launching CORNUS application with PM2...${NC}"
if pm2 list | grep -q "cornus-fashion"; then
  echo -e "${YELLOW}Reloading running PM2 process 'cornus-fashion'...${NC}"
  pm2 restart cornus-fashion --update-env
else
  echo -e "${GREEN}Starting new PM2 daemon 'cornus-fashion'...${NC}"
  pm2 start npm --name "cornus-fashion" -- run start
fi

# Persist PM2 across server restarts
pm2 save || true

echo -e "\n${BOLD}${GREEN}=================================================================${NC}"
echo -e "${BOLD}${GREEN} ✓ CORNUS FASHION SUCCESSFULLY INSTALLED & RUNNING ON PORT 3000! ${NC}"
echo -e "${BOLD}${GREEN}=================================================================${NC}\n"

echo -e "${BOLD}Useful Commands:${NC}"
echo -e " • Check logs:        ${BLUE}pm2 logs cornus-fashion${NC}"
echo -e " • Check status:      ${BLUE}pm2 status${NC}"
echo -e " • Restart server:    ${BLUE}pm2 restart cornus-fashion${NC}"
echo -e " • Stop server:       ${BLUE}pm2 stop cornus-fashion${NC}\n"

echo -e "${BOLD}Recommended Nginx Configuration (/etc/nginx/sites-available/cornus):${NC}"
cat <<'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
echo ""
