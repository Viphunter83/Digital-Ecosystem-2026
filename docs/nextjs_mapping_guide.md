# Next.js & Directus Integration Guide

This guide explains how to map the new Directus collections (`globals` and `pages`) to the Next.js frontend.

## 1. Global Settings (Singleton)

The `globals` collection contains site-wide settings like title, contacts, and SEO text.

### Fetching Globals
```typescript
// services/directus.ts
export async function getGlobals() {
  const response = await fetch(`${process.env.DIRECTUS_URL}/items/globals`);
  const { data } = await response.json();
  return data;
}
```

### Usage in Layout
```tsx
// app/layout.tsx
import { getGlobals } from '@/services/directus';

export default async function RootLayout({ children }) {
  const globals = await getGlobals();
  
  return (
    <html>
      <head>
        <title>{globals.site_title}</title>
      </head>
      <body>
        <Header phone={globals.contact_phone} address={globals.contact_address} />
        {children}
        <Footer seoText={globals.footer_seo_text} />
      </body>
    </html>
  );
}
```

---

## 2. Static Pages

The `pages` collection allows creating arbitrary dynamic pages (About, Delivery, etc.).

### Fetching Page by Slug
```typescript
export async function getPageBySlug(slug: string) {
  const response = await fetch(
    `${process.env.DIRECTUS_URL}/items/pages?filter[slug][_eq]=${slug}&filter[is_published][_eq]=true`
  );
  const { data } = await response.json();
  return data[0];
}
```

### Dynamic Route
```tsx
// app/[slug]/page.tsx
import { getPageBySlug } from '@/services/directus';
import { notFound } from 'next/navigation';

export default async function DynamicPage({ params }) {
  const page = await getPageBySlug(params.slug);
  
  if (!page) notFound();
  
  return (
    <main>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </main>
  );
}
```

---

## 3. Cache Invalidation

The Directus Flow is already configured to call `POST /webhook/clear-cache` on the backend. 
Ensure your backend env variables are set:
- `REDIS_URL`
- `DIRECTUS_WEBHOOK_SECRET` (matching `rss-secret-2026`)
