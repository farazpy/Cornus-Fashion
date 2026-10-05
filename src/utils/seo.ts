import { Product } from '../types';

export interface PageSEO {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: string;
  image?: string;
  schema?: Record<string, any>;
}

const BASE_URL = 'https://www.cornusfashion.com';

export const updatePageSEO = (seo: PageSEO) => {
  const fullCanonicalUrl = `${BASE_URL}${seo.canonicalPath.startsWith('/') ? seo.canonicalPath : `/${seo.canonicalPath}`}`;

  // 1. Update Document Title
  document.title = seo.title;

  // 2. Helper to set or create meta tag
  const setMetaTag = (attribute: 'name' | 'property', value: string, content: string) => {
    let element = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, value);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 3. Meta Description & Socials
  setMetaTag('name', 'description', seo.description);
  setMetaTag('property', 'og:title', seo.title);
  setMetaTag('property', 'og:description', seo.description);
  setMetaTag('property', 'og:url', fullCanonicalUrl);
  setMetaTag('property', 'og:type', seo.ogType || 'website');
  setMetaTag('property', 'og:site_name', 'CORNUS');

  if (seo.image) {
    setMetaTag('property', 'og:image', seo.image);
    setMetaTag('name', 'twitter:image', seo.image);
  }

  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', seo.title);
  setMetaTag('name', 'twitter:description', seo.description);

  // 4. Update Canonical Link tag
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullCanonicalUrl);

  // 5. Update Schema.org JSON-LD Structured Data
  let schemaScript = document.getElementById('cornus-seo-schema') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'cornus-seo-schema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const defaultOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'CORNUS',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Contemporary luxury fashion house producing architectural silhouettes, pure Italian wool tailoring, and Japanese selvedge denim.',
    telephone: '+919022246164',
    email: 'business@cornus.io',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tathawade',
      addressLocality: 'Pimpri Chinchwad',
      addressRegion: 'Pune',
      postalCode: '411033',
      addressCountry: 'IN'
    },
    sameAs: [
      'https://www.instagram.com/cornusfashion/'
    ]
  };

  schemaScript.textContent = JSON.stringify(seo.schema || defaultOrganizationSchema);
};

export const getProductSEO = (product: Product): PageSEO => {
  const canonicalPath = `/product/${product.slug || product.id}`;
  const title = `${product.name} — Luxury ${product.category} | CORNUS`;
  const description = `${product.name}. ${product.description.slice(0, 140)}... Shop online at CORNUS with complimentary shipping over INR 2,500.`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'CORNUS'
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}${canonicalPath}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'CORNUS'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 12
    }
  };

  return {
    title,
    description,
    canonicalPath,
    ogType: 'product',
    image: product.images[0],
    schema: productSchema
  };
};
