# CLAUDE.md — Sarvaa Frontend Project Guide

**Last Updated:** 2025-03-01
**Project:** Sarvaa - Premium Silver Jewelry E-Commerce Platform
**Version:** bin-landing branch
**Audience:** AI agents (Claude, future developers)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (Vite on :8080)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Preview production build
npm run preview
```

**Frontend URL (local):** http://localhost:8080
**Backend:** Supabase (PostgreSQL) via `supabase.ts`

---

## Project Stack

### Frameworks & Tools
- **React 18.3.1** - UI Framework
- **Vite** - Build tool (extremely fast)
- **TypeScript** - Type safety
- **React Router DOM v7.13.0** - Client-side routing (currently CSR only)
- **Tailwind CSS v3.4.17** - Utility-first CSS
- **shadcn/ui (Radix UI)** - 50+ accessible UI components

### State & Data
- **Supabase** - PostgreSQL backend for products, categories, orders
- **CartContext** - Local cart + wishlist state (localStorage-persisted)
- **React Query @tanstack 5.83.0** - Configured but minimally used; ready for cache setup

### UI & Animations
- **Framer Motion** - Component animations
- **Sonner** - Toast notifications
- **next-themes** - Theme switching (currently unused for i18n)

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation for forms
- **Recharts** - Data visualization (if needed)

### Services
- **Emailjs** - Email notifications for orders
- **Supabase Auth** - User authentication

### Testing
- **Vitest** - Unit/integration tests
- **React Testing Library** - Component testing

---

## Project Structure

```
sarvaa/
├── /src
│   ├── /pages              # Route-level components (11 total)
│   │   ├── Index.tsx       (/)
│   │   ├── CategoryPage.tsx (/category/:slug)
│   │   ├── ProductDetailPage.tsx (/product/:id) ⭐ KEY CONVERSION PAGE
│   │   ├── SearchPage.tsx (/search)
│   │   ├── SearchResultsPage.tsx (/search?q=)
│   │   ├── CartPage.tsx (/cart)
│   │   ├── CheckoutPage.tsx (/checkout)
│   │   ├── LoginPage.tsx (/login)
│   │   ├── WishlistPage.tsx (/wishlist)
│   │   ├── MyOrders.tsx (/my-orders)
│   │   ├── CorporatePage.tsx (/corporate)
│   │   └── NotFound.tsx (/* fallback)
│   │
│   ├── /components         # Reusable components
│   │   ├── /layout
│   │   │   ├── Navbar.tsx      (Header + category dropdown + search)
│   │   │   └── Footer.tsx      (Footer + links + FAQ)
│   │   ├── /home              (Home page sections)
│   │   │   ├── HeroSection.tsx      (Carousel - Supabase-driven)
│   │   │   ├── CategoryShowcase.tsx (Category cards)
│   │   │   ├── NewArrivals.tsx      (New products)
│   │   │   ├── ShopByPrice.tsx      (Price filtering)
│   │   │   ├── GiftingSection.tsx   (Gifting features)
│   │   │   ├── Testimonials.tsx     (Customer reviews)
│   │   │   ├── WhyChooseUs.tsx      (USP section)
│   │   │   ├── StylingCarousel.tsx  (Styling tips)
│   │   │   ├── TrustSection.tsx     (Security/assurance)
│   │   │   └── PincodeModal.tsx     (Delivery checker)
│   │   ├── ProductCard.tsx    (Reusable product grid item)
│   │   ├── NavLink.tsx        (Navigation utility)
│   │   └── /ui/              (Radix UI wrapper components - 50+ items)
│   │
│   ├── /context
│   │   └── CartContext.tsx    (Cart + Wishlist - localStorage sync)
│   │
│   ├── /hooks
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   │
│   ├── /data
│   │   └── products.ts        (Static fallback data for offline mode)
│   │
│   ├── /lib
│   │   └── utils.ts           (Utility functions)
│   │
│   ├── App.tsx                (Routes setup)
│   ├── main.tsx               (Entry point)
│   └── index.css              (Global styles)
│
├── /public
│   └── robots.txt             ✅ Allows all crawlers
│                              ❌ MISSING: sitemap.xml, favicon, manifest.json
│
├── supabase.ts                (Supabase client config - SENSITIVE: uses env vars)
├── vite.config.ts             (Vite configuration)
├── tsconfig.json              (TypeScript config)
├── tailwind.config.ts         (Tailwind customization)
├── vitest.config.ts           (Test configuration)
├── package.json
├── index.html                 (Main HTML - CURRENTLY STATIC SEO TAGS ONLY)
├── seo-audit-report.md        (This project's SEO audit findings) 📋
└── CLAUDE.md                  (This file - Agent guide)
```

---

## Routes & Data Flow

### Route Map

```typescript
// From App.tsx
<Routes>
  <Route path="/" element={<Index />} />                    // Home
  <Route path="/category/:slug" element={<CategoryPage />} /> // Browse
  <Route path="/product/:id" element={<ProductDetailPage />} /> // Detail
  <Route path="/search" element={<SearchPage />} />         // Search interface
  <Route path="/search?q=:query" element={<SearchResultsPage />} /> // Results
  <Route path="/cart" element={<CartPage />} />             // Cart
  <Route path="/checkout" element={<CheckoutPage />} />     // Checkout
  <Route path="/login" element={<LoginPage />} />           // Auth
  <Route path="/wishlist" element={<WishlistPage />} />     // Saved items
  <Route path="/my-orders" element={<MyOrders />} />        // Order history
  <Route path="/corporate" element={<CorporatePage />} />   // B2B gifting
  <Route path="*" element={<NotFound />} />                 // 404
</Routes>
```

### Key Data Queries

| Component | Query | Purpose | SEO Impact |
|-----------|-------|---------|-----------|
| **HeroSection** | `SELECT * FROM hero_slides` | Carousel content | HIGH - Homepage visibility |
| **Navbar** | `SELECT * FROM categories` | Navigation | HIGH - Crawlability |
| **CategoryPage** | `SELECT * FROM products WHERE category_id = ?` | Browse products | HIGH - Category indexing |
| **ProductDetailPage** | `SELECT * FROM products WHERE id = ?` | Single product | CRITICAL - Conversion |
| **SearchResults** | Client-side filter (NO backend) | Search | MEDIUM - No backend search yet |

**⚠️ Important:** Search is currently client-side only. No backend querying. This limits SEO.

---

## Supabase Schema (Relevant for SEO)

```sql
-- hero_slides (carousel on home)
CREATE TABLE hero_slides (
  id TEXT PRIMARY KEY,
  image_url TEXT,
  heading TEXT,
  subheading TEXT,
  button_text TEXT,
  button_link TEXT,
  display_order INT,
  created_at TIMESTAMP
);

-- categories (navigation + browse)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  slug TEXT UNIQUE,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

-- products (catalog)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT,
  price INT,
  image_url TEXT,
  image_urls TEXT[],
  category_id TEXT FOREIGN KEY,
  short_description TEXT,
  description TEXT,
  detail_description TEXT,
  weight_in_grams INT,
  making_charge INT,
  video_url TEXT,
  type TEXT,
  is_new_arrival BOOLEAN,
  created_at TIMESTAMP
);

-- orders (user orders)
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  items JSONB[],
  total INT,
  status TEXT,
  created_at TIMESTAMP
);
```

**SEO Note:** `short_description`, `description`, and `detail_description` exist but are NOT currently used for meta tags. They will be integrated in STEP 3 (meta implementation).

---

## SEO Status & Goals

### Current Status (As of 2025-03-01)
- 🔴 **SEO Score: 0/100** - Zero SEO implementation
- ⚠️ **Blocker: CSR (Client-Side Rendering)** - Google sees empty HTML
- ❌ No dynamic meta tags, no structured data, no sitemap
- ❌ No image optimization, no canonical tags
- ❌ No open graph / social sharing preview

### CRITICAL ISSUES TO FIX (STEP 3)

**Phase 1: Blockers (Must fix before SEO matters)**
1. ✅ Audit complete (This file + seo-audit-report.md)
2. ⏳ **Prerendering** - Render static pages at build time (vite-plugin-prerender)
3. ⏳ **React Helmet** - Add dynamic meta tags per page
4. ⏳ **Structured Data** - Add JSON-LD (Product, Organization, BreadcrumbList)
5. ⏳ **Sitemap** - Generate `/public/sitemap.xml`

**Phase 2: High Impact**
6. Image alt text audit and improvement
7. Open Graph images for social sharing
8. Canonical tags on all pages
9. Backend search (Supabase full-text or Algolia)
10. WCAG 2.1 accessibility fixes (ARIA attributes)

**Phase 3: Polish**
11. React Query caching setup
12. Review schema + AggregateRating
13. Favicon + manifest.json
14. Performance optimization (Core Web Vitals)

---

## Critical Components for SEO Agents

### Components That Need SEO Work

| Component | Location | SEO Gap | Priority |
|-----------|----------|---------|----------|
| **ProductDetailPage** | `/src/pages/ProductDetailPage.tsx` | No schema, no meta tags, no canonical | 🔴 CRITICAL |
| **CategoryPage** | `/src/pages/CategoryPage.tsx` | No dynamic title/desc, no breadcrumb schema | 🔴 CRITICAL |
| **Index (Home)** | `/src/pages/Index.tsx` | Static meta tags, needs h1 SEO audit | 🔴 CRITICAL |
| **HeroSection** | `/src/components/home/HeroSection.tsx` | No alt text, no accessibility ARIA | 🟠 HIGH |
| **ProductCard** | `/src/components/ProductCard.tsx` | Missing alt text, generic description | 🟠 HIGH |
| **Navbar** | `/src/components/layout/Navbar.tsx` | Search input not semantic | 🟠 HIGH |
| **Footer** | `/src/components/layout/Footer.tsx` | Links not in semantic `<nav>`, FAQ needs dl | 🟠 HIGH |
| **SearchResultsPage** | `/src/pages/SearchResultsPage.tsx` | Not crawlable (client-side search) | 🟠 HIGH |

---

## Development Rules for SEO Work

### ✅ DO:
1. **Add semantic HTML** - Use `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>` correctly
2. **Always test with prerendering in mind** - Your code will be server-rendered eventually
3. **Keep Supabase integration intact** - Don't break existing data flows
4. **Add ARIA attributes** - Every interactive element needs `aria-label`, `aria-expanded`, etc.
5. **Test with React Helmet** - Mocking meta tag injection in components
6. **Use alt text strategically** - Include product name, price, key attributes
7. **Preserve existing component structure** - Don't refactor unrelated code
8. **Test image lazy loading** - Components may be prerendered, images must load optimally
9. **Add schema safely** - Use `react-json-ld` or manual `<script>` in Helmet
10. **Document Supabase-dependent pages** - Note where data impacts SEO (meta descriptions, titles)

### ❌ DON'T:
1. **Don't break ClientSideRouting** - React Router must continue working
2. **Don't refactor components beyond SEO** - Scope creep kills projects
3. **Don't add missing features** - Only fix SEO gaps identified in seo-audit-report.md
4. **Don't change CartContext structure** - It's working; only add SEO to it if needed
5. **Don't modify Supabase schema** - Frontend-only changes
6. **Don't add unnecessary packages** - Use what's already installed if possible
7. **Don't hardcode Supabase data in components** - Keep dynamic fetching intact
8. **Don't ignore mobile SEO** - Test all changes on mobile-first perspective
9. **Don't rely on `next` package features** - This is Vite, not Next.js
10. **Don't skip testing** - Run `npm test` and `npm run build` before pushing

---

## Git Workflow for SEO Implementation

### Branch Name
```bash
git checkout -b feature/seo-implementation
```

### Commit Message Format
```
type: message

Detailed explanation

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New SEO feature (e.g., "feat: add react-helmet for dynamic meta tags")
- `fix:` - Bug fix in SEO (e.g., "fix: correct product alt text")
- `refactor:` - Restructure for SEO (e.g., "refactor: add semantic HTML to ProductDetail")
- `docs:` - Documentation (e.g., "docs: update CLAUDE.md with meta tag guidelines")
- `test:` - Tests added (e.g., "test: add snapshot tests for meta tag rendering")

### Example Commits
```
feat: add react-helmet-async for dynamic meta tags

Wrap app with HelmetProvider and configure dynamic title/meta on each page route.

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
fix: improve product image alt text semantics

Update alt attributes to include product name and price for better SEO and accessibility.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### PR Checklist
- [ ] All changes isolated to SEO features (no unrelated refactoring)
- [ ] Components still render correctly
- [ ] No Supabase integration broken
- [ ] Alt text audit completed
- [ ] Meta tags tested in dev tools
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors or warnings
- [ ] Commit messages are clear
- [ ] CLAUDE.md updated if adding new practices

---

## Environment Variables

### Required .env.local (for development)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ IMPORTANT:**
- Never commit `.env.local` to git
- These are Supabase public credentials (anon key); they're safe to expose
- Check `.gitignore` includes `.env.local`

---

## Build & Deployment

### Development
```bash
npm run dev
# Server: http://localhost:8080
# Hot reload enabled
# No minification
```

### Production Build
```bash
npm run build
# Output: /dist/
# Vite generates optimized chunks
# TypeScript compiled to JavaScript
```

### Preview Production Locally
```bash
npm run preview
# Simulates production bundle locally
# Useful for testing SEO prerendering
```

### Deployment (bin-landing branch)
- Hosting platform: (Specify: Vercel, Netlify, GitHub Pages?)
- Build command: `npm run build`
- Output directory: `dist/`
- Environment variables: Set VITE_SUPABASE_* in platform settings

---

## Testing Strategy

### Unit Tests
```bash
npm run test
# Runs Vitest
# Tests components, utilities, hooks
```

### Integration Tests
- Test Supabase data fetching
- Test CartContext state management
- Test routing navigation

### Test File Location
```
/src/**/*.test.ts
/src/**/*.spec.ts
```

### Key Components to Test for SEO
1. **Meta tag rendering** - Mock Helmet, verify `<head>` tags
2. **Schema output** - Check JSON-LD structure validity
3. **Image alt text** - Snapshot tests for ProductCard
4. **Breadcrumb rendering** - Test hierarchy correctness
5. **Canonical tag generation** - Assert correct URL per route

---

## Performance Considerations

### Current Metrics (Baseline - needs audit)
- ⏳ **LCP (Largest Contentful Paint):** Unknown (target <2.5s)
- ⏳ **FID (First Input Delay):** Unknown (target <100ms)
- ⏳ **CLS (Cumulative Layout Shift):** Unknown (target <0.1)

### Optimization Opportunities
1. **Code splitting** - Vite does this automatically
2. **Image optimization** - Currently not optimized (use Sharp or Tinypng)
3. **React Query caching** - Configured but unused; wrap API calls
4. **Lazy loading components** - Use React's `lazy()` + `Suspense`
5. **Prerendering** - Will significantly improve FCP (First Contentful Paint)

### Core Web Vitals Tools
- Google PageSpeed Insights
- Google Search Console
- Lighthouse CLI: `npm run build && npx lighthouse https://localhost:3000`

---

## Supabase Connection Details

### Client Config
```typescript
// supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Usage Pattern
```typescript
// Example from CategoryPage.tsx
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId)
```

### ⚠️ SEO Note:
- Supabase queries run client-side (exposed to browser)
- This is OK for e-commerce (products are public)
- For STEP 3 prerendering, we'll need to build sitemap from Supabase data at build time

---

## Common Tasks for AI Agents

### Task: Add meta tags to a new page

1. Locate the page component (e.g., `/src/pages/MyNewPage.tsx`)
2. Import Helmet (once react-helmet-async is installed)
3. Inside component, add:
```typescript
import { Helmet } from 'react-helmet-async'

export default function MyNewPage() {
  return (
    <>
      <Helmet>
        <title>Unique Title | Sarvaa</title>
        <meta name="description" content="Unique description here" />
        <link rel="canonical" href="https://sarvaa.com/path" />
      </Helmet>
      {/* Your page content */}
    </>
  )
}
```

### Task: Generate sitemap

1. List all routes from App.tsx
2. Query Supabase for dynamic routes (categories, top products)
3. Generate `/public/sitemap.xml` with all URLs
4. Add `<link rel="sitemap" href="/sitemap.xml">` to index.html

### Task: Add JSON-LD schema

```typescript
import { Helmet } from 'react-helmet-async'

<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "price": product.price,
      "image": product.image_url,
      "description": product.description,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "INR"
      }
    })}
  </script>
</Helmet>
```

### Task: Improve image alt text

1. Find all `<img>` tags in components
2. Change generic alt text to semantic format:
   - ✅ Good: `alt="${product.name} - ₹${product.price}"`
   - ❌ Bad: `alt="product image"`
3. Test in browser DevTools accessibility audit

### Task: Add ARIA attributes to interactive components

```typescript
// Before
<button onClick={() => setOpen(!open)} className="...">
  {title}
</button>

// After
<button
  onClick={() => setOpen(!open)}
  aria-expanded={open}
  aria-controls={`accordion-${id}`}
  className="..."
>
  {title}
</button>
<div id={`accordion-${id}`} hidden={!open} role="region">
  {/* Content */}
</div>
```

---

## Troubleshooting

### Issue: Supabase queries fail
- Check `.env.local` has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Verify network tab shows requests going to Supabase
- Check Supabase dashboard for table permissions

### Issue: Components not rendering
- Check React Router path syntax (using `:param` correctly?)
- Verify Helmet imports are correct (after installation)
- Run `npm run build` to check TypeScript errors

### Issue: Prerendering fails to generate pages
- Ensure all dynamic routes are discoverable (routes list provided to prerender plugin)
- Check Supabase queries return data during build
- Verify image URLs are absolute (not relative)

### Issue: Meta tags not showing in page source
- React Helmet requires `<HelmetProvider>` wrapping app
- Check browser DevTools `<head>` section (should show tags)
- Verify Helmet is imported correctly

---

## References & Resources

### SEO Standards
- https://schema.org/Product - Product schema documentation
- https://schema.org/Organization - Organization schema
- https://developers.google.com/search/docs/beginner/seo-starter-guide - Google SEO guide

### Tools for Testing
- Lighthouse: Built into Chrome DevTools
- Google Search Console: Monitor indexing
- Structured Data Testing Tool: https://search.google.com/structured-data/testing-tool
- SEO Meta Tag Inspector: Chrome extension

### Relevant Packages
- `react-helmet-async` - Dynamic meta tags
- `react-json-ld` - Easier JSON-LD generation
- `vite-plugin-prerender` - Static prerendering
- `sitemap` - Sitemap generation
- `sharp` - Image optimization

### Docs
- React Helmet: https://github.com/nfl/react-helmet
- Vite Plugins: https://vitejs.dev/plugins/
- Supabase Client Docs: https://supabase.com/docs/reference/javascript

---

## Questions? Escalation Path

If implementing SEO changes:
1. **Blocked on Supabase?** → Check supabase.ts and env vars
2. **Blocked on routing?** → Review App.tsx for route structure
3. **Blocked on component?** → Check component location in /src/components or /src/pages
4. **Prerendering issues?** → Check seo-audit-report.md "CSR Blocker" section
5. **Not sure about approach?** → Review sections: "Development Rules" and "Common Tasks"

---

**Document Version:** 1.0
**Last Updated:** 2025-03-01
**Maintained By:** AI Agents working on Sarvaa SEO
**Next Review:** Post-STEP 3 implementation (after SEO work complete)
