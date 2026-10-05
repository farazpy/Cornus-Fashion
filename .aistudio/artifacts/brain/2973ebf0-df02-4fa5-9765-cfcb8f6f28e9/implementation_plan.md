# Shopify & WooCommerce-Grade Admin Operations Suite

A comprehensive, enterprise-class Store & Admin Management Console for CORNUS, giving store owners complete control over branding, contact info, SMTP mailer configurations, product catalog, custom categories, customer CRM, and store settings.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements and architecture decisions have been confirmed for this implementation:

- **Store Settings & Branding Persistence**: Persisted in a new `store_settings` MySQL table. Changes to logo URL, phone, email, boutique address, currency, tax rate, and SMTP settings take effect immediately across the storefront and header.
- **Customer CRM & Intelligence**: View all registered clients, lifetime spend, order history, phone numbers, and account status (`Active` / `Suspended`).
- **Category Management Engine**: Full CRUD for boutique categories with custom cover image, subtitle, slug, and navigation menu sorting order.
- **Product Management Suite**: Modal and inline product editor for adding new products, editing existing SKUs, setting prices, managing inventory levels, toggling featured status, and deleting items.

---

## 1. Overview & Core Concept

**What It Does**:
Transforms the CORNUS Admin Console into a full-scale Shopify/WooCommerce alternative. Admins can manage the entire operational lifecycle:
1. **Store Identity & General Settings**: Logo, Store Name, Tagline, Concierge Phone/Email, Atelier Address, Currency, Tax Rates, and SMTP Email Gateway config (Host, Port, User, Encryption).
2. **Category Management**: Create, edit, re-order, and delete boutique collection categories with images and descriptions.
3. **Product Catalog**: Add new garments, edit attributes, update inventory levels, and delete products.
4. **Customer CRM**: Manage registered clients, view total orders, lifetime value (LTV), address history, and account actions.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Admin Authentication**: Enter master admin PIN (`0000`) or log in as an administrator.
2. **General Store Settings Tab**:
   * **Branding & Logo**: Update the high-res Header Logo URL and site favicon; instant header preview.
   * **Contact & Concierge**: Edit Customer Care Phone, Support Email, and Physical Atelier Address.
   * **Email / SMTP Configurations**: Set up SMTP Host (`smtp.gmail.com` / `smtp.resend.com`), Port (587/465), Username, Password, and TLS setting for automated order receipts.
   * **Localization & Taxes**: Select Default Currency (USD `$`, EUR `€`, INR `₹`, GBP `£`) and Tax percentage.
3. **Category Management Tab**:
   * View current categories (`Outerwear`, `Tops`, `Bottoms`, `Dresses`, `Leather`).
   * Modal to add a new category with Name, Slug, Image URL, Subtitle, and Menu Display Priority.
   * Edit existing categories or delete custom categories.
4. **Customer CRM Tab**:
   * Search clients by name or email.
   * Table displaying Client Name, Email, Phone, Joined Date, Total Orders, Lifetime Spend, and Account Status.
   * Action drawer to inspect order history or toggle account status.
5. **Product Catalog Tab**:
   * Add/Edit Product modal with fields for Title, Slug, Category, Price, Compare-at-Price, Stock Quantity, SKU, Features, and Image URLs.
   * Quick stock adjustment inputs and one-click item removal.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Persistence in MySQL (`store_settings` and `categories` tables)**
  - *Chosen Approach*: Store general site settings, SMTP configs, and categories directly in MySQL with Express REST APIs (`/api/admin/settings` and `/api/categories`).
  - *Why*: Ensures settings persist across server restarts and sync seamlessly between Admin and Storefront.

- **Decision 2: Global Store Context Integration**
  - *Chosen Approach*: Extend `ShopContext` to consume live `storeSettings` and `categories` from the API, updating header logo, footer contact information, and category navigation menus dynamically.
  - *Why*: Eliminates hardcoded site configurations and provides a true headless/CMS-driven experience.

---

## 4. Technical Architecture & System Layout

```
┌─────────────────────────────────────────────────────────────┐
│                      STOREFRONT FRONTEND                    │
│   Header (Dynamic Logo) │ Footer (Dynamic Contact & Address)│
│   Shop Page (Dynamic Categories) │ Cart & Checkout (Currency)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN CONSOLE (/admin)                     │
│  ┌────────────┬─────────────┬─────────────┬──────────────┐  │
│  │ General    │ Categories  │ Products    │ Customers    │  │
│  │ Settings & │ & Navigation│ & Inventory │ & Lifetime   │  │
│  │ SMTP Mail  │ Management  │ Catalog     │ Value (LTV)  │  │
│  └────────────┴─────────────┴─────────────┴──────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXPRESS REST API SERVER                     │
│  GET/POST /api/admin/settings    GET/POST /api/categories    │
│  GET/POST /api/admin/customers   GET/POST/DELETE /api/products│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    MYSQL DATABASE LAYER                     │
│  Tables: store_settings, categories, products, users, orders│
└──────────────────────────────┬──────────────────────────────┘
```

### Database Schema Updates

1. **`store_settings` Table**:
   * `id`: VARCHAR(36) PRIMARY KEY
   * `store_name`: VARCHAR(255)
   * `logo_url`: TEXT
   * `support_email`: VARCHAR(255)
   * `support_phone`: VARCHAR(255)
   * `atelier_address`: TEXT
   * `currency`: VARCHAR(10)
   * `tax_rate`: DECIMAL(5,2)
   * `smtp_host`: VARCHAR(255)
   * `smtp_port`: INT
   * `smtp_user`: VARCHAR(255)
   * `smtp_pass`: VARCHAR(255)
   * `smtp_encryption`: VARCHAR(20)

2. **`categories` Table**:
   * `id`: VARCHAR(36) PRIMARY KEY
   * `name`: VARCHAR(255)
   * `slug`: VARCHAR(255)
   * `subtitle`: VARCHAR(255)
   * `image_url`: TEXT
   * `display_order`: INT

---

## 5. Execution Steps

1. **Database Schema & Server Proxy Routes**:
   * Add `store_settings` and `categories` tables in `server.ts`.
   * Create `/api/admin/settings` (GET, POST/PUT) and `/api/categories` (GET, POST, PUT, DELETE) endpoints.
   * Create `/api/admin/customers` endpoint aggregating customer orders and total spend.
2. **Context & State Wiring**:
   * Update `ShopContext.tsx` and `types/index.ts` to expose `storeSettings`, `categories`, and `updateStoreSettings()`.
3. **Admin Console Redesign (`AdminPanel.tsx`)**:
   * Add new tab panels: **General Settings & SMTP**, **Category Management**, **Customer CRM**, and enhanced **Product Catalog Manager**.
   * Add modal forms for Category creation/editing and Store Settings saving with feedback notifications.
4. **Storefront Dynamic Integration**:
   * Update `Header.tsx` to display the dynamic logo URL from `storeSettings`.
   * Update `Footer.tsx` and `PolicyPage.tsx` to read dynamic phone, email, and address from `storeSettings`.
   * Update Navigation menus and Shop category filters to use dynamic categories.
5. **Validation & Version Increment**:
   * Run linter and build check.
   * Increment header version to **`v1.7.0`**.
