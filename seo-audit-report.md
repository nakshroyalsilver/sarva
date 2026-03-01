# SEO Audit Report: Sarvaa (React + Vite CSR)

**Report Date:** 2025-03-01
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Supabase
**Router:** React Router DOM v7.13.0 (Client-Side)
**SEO Status:** 🔴 **CRITICAL** — CSR crawlability + zero dynamic SEO implementation

---

## Executive Summary

The Sarvaa application is a **Client-Side Rendered (CSR) Vite + React app** with:
- ✅ Excellent UI/UX architecture (Radix UI, responsive design, smooth animations)
- ✅ Clean component structure and state management
- ✅ Supabase integration for data
- ❌ **ZERO SEO implementation**
- ❌ **CSR rendering blocks Google indexing** (empty `<div id="root">`)
- ❌ No dynamic meta tags, structured data, or sitemap

**Google sees:** Empty HTML with just `<div id="root">` — content only appears after JS loads.
**This MUST be fixed before any meta tag work matters.**

---

## Architecture Overview

```
Frontend Routes:
├── / (Home)
├── /category/:slug (Category browse)
├── /product/:id (Product detail — KEY conversion page)
├── /search (Search interface)
├── /search?q=query (Search results)
├── /cart (Shopping cart)
├── /checkout (Checkout form)
├── /login (User authentication)
├── /wishlist (Saved items)
├── /my-orders (Order history)
├── /corporate (B2B gifting)
└── /* (404 Not Found)

Data Source: Supabase (PostgreSQL)
├── hero_slides (carousel content)
├── categories (navigation structure)
├── products (catalog with images, descriptions, pricing)
└── orders (transactional, not SEO-relevant)
```

---

## CRITICAL BLOCKER: CSR (Client-Side Rendering)

### The Problem

```html
<!-- What Google sees initially: -->
<!DOCTYPE html>
<html>
  <head>
    <title>Sarvaar — Premium Silver Jewelry</title>
    <meta name="description" content="..." />
  </head>
  <body>
    <div id="root"></div>  <!-- ⬅️ EMPTY! All content JS-rendered -->
    <script src="/bundle.xyz.js"></script>
  </body>
</html>
```

**Result:**
- Google's crawler sees empty content (unless JS rendering is enabled)
- Search results show only the static title/description
- No product/category visibility in organic search
- Rich snippets impossible without structured data

### Solution Paths (Recommended during STEP 3)

| Approach | Pros | Cons | Recommendation |
|----------|------|------|-----------------|
| **Prerendering** (vite-plugin-prerender) | Simple, static output, fast | Doesn't scale to dynamic (user-specific) content | ✅ **BEST for landing pages** |
| **SSR** (vite-plugin-ssr) | Dynamic per-request rendering | Needs Node.js server, complex integration | For future dynamic user content |
| **Hybrid** (Prerender static + React for interactivity) | Optimal performance + dynamic | Highest complexity | Long-term goal |

**Recommendation:** Start with **static prerendering** for:
- Homepage (`/`)
- All category pages (`/category/:slug`) — prerender for each category in Supabase
- Top product pages (`/product/:id`) — prerender for best-selling products
- Marketing pages (`/corporate`)

Leave dynamic routes (cart, login, search) as client-rendered.

---

## CRITICAL FINDINGS BY SEVERITY

### 🔴 CRITICAL (Must fix before launch)

#### 1. **Empty Initial HTML (CSR)**
- **Impact:** Google cannot index content without JS execution
- **Current:** All content client-rendered
- **Fix Required:** Implement prerendering for static pages or SSR
- **Effort:** Medium (1-2 days setup)

#### 2. **Zero Dynamic Meta Tags**
- **Impact:** Every page shows identical title/description
- **Current:** Only static `<title>` and `<meta description>` in index.html
- **Missing:**
  - `<title>` per page (e.g., "Premium Silver Rings | Sarvaa" for category)
  - `<meta description>` per page
  - `<meta canonical>` (duplicate content risk)
  - `<og:title>`, `<og:description>`, `<og:image>` (social sharing)
  - `<twitter:card>`, `<twitter:image>` (Twitter sharing)
  - `<meta robots>` (crawl hints)
- **Fix Required:** Install `react-helmet-async`, wrap app, set meta on each page
- **Effort:** Low (1 day)

#### 3. **No JSON-LD Structured Data**
- **Impact:** No rich snippets, reviews, breadcrumbs in SERP
- **Missing:**
  - Product schema (price, image, description, availability)
  - Organization schema (company info, contact, social)
  - BreadcrumbList schema (navigation hierarchy)
  - AggregateRating schema (reviews, 4.8★)
  - WebPage schema (page purpose)
- **Fix Required:** Add `react-json-ld` or manual `<script type="application/ld+json">` in Helmet
- **Effort:** Low-Medium (2-3 days)

#### 4. **No Sitemap**
- **Impact:** Crawlers cannot discover all pages
- **Current:** Missing completely
- **Required:**
  - Static sitemap for prerendered pages
  - `/public/sitemap.xml` with all category + top product URLs
- **Fix Required:** Create sitemap during build or manually generate
- **Effort:** Low (1 day)

#### 5. **No Image SEO**
- **Impact:** Lost visibility in Google Images; poor user experience
- **Current:** Basic alt text, no optimization
- **Missing:**
  - Proper alt text: `alt="{product.name} - ${product.price}"` (not generic)
  - No image compression/lazy loading
  - No responsive images (`<picture>`, `srcset`)
  - No image schema metadata
- **Fix Required:** Audit all images, add semantic alt text, implement lazy loading
- **Effort:** Medium (1-2 days)

---

### 🟠 HIGH (Major impact, should fix soon)

#### 6. **Product Detail Page Lacks Semantics**
- **Impact:** Poor accessibility (WCAG 2.1), no machine-readable structure
- **Current:** Divs with Tailwind classes, no `<article>`, no JSON-LD
- **Missing:**
  - `<article>` wrapper for product info
  - `<section>` tags for description/specs/reviews
  - `<data value>` for prices (machine-readable)
  - ARIA attributes on accordion (aria-expanded, aria-controls)
  - Breadcrumb navigation trail
- **Fix Required:** Add semantic HTML + JSON-LD Product schema
- **Effort:** Medium (1-2 days)

#### 7. **Search Not Backend-Powered**
- **Impact:** Limited scalability, poor relevance, cannot be crawled
- **Current:** Client-side filtering of hardcoded product list
- **Problem:**
  - Cannot rank/sort by relevance
  - Limited to in-memory data
  - Search results page (`/search?q=...`) not indexable
- **Fix Required:** Implement Supabase full-text search or add Algolia
- **Effort:** Medium (2-3 days)

#### 8. **Missing Open Graph Images**
- **Impact:** Social sharing shows no preview (Twitter, Facebook, LinkedIn)
- **Current:** `og:image` commented out in index.html
- **Required:**
  - Default OG image for home/category pages
  - Per-product OG image (product photo)
  - Dynamic image generation or CDN strategy
- **Fix Required:** Add og:image to Helmet, generate/upload images
- **Effort:** Low-Medium (1-2 days)

#### 9. **No Canonical Tags**
- **Impact:** Duplicate content penalties, URL preference not specified
- **Current:** Not implemented
- **Example Problem:**
  - `/product/123` and `/product/123?utm_source=...` seen as different pages
  - Categories potentially accessible via multiple URL patterns
- **Fix Required:** Add `<link rel="canonical">` to all pages
- **Effort:** Low (1 day)

#### 10. **Accessibility Gaps**
- **Impact:** Code may fail WCAG 2.1 compliance audits
- **Missing:**
  - Accordion without proper ARIA labels
  - Filter buttons not semantic
  - Navigation dropdowns lack `aria-expanded`
  - Pagination not using `<nav>` with proper landmarks
  - Form inputs lack associated `<label>` elements
- **Fix Required:** Audit all components, add ARIA attributes
- **Effort:** Medium (2-3 days)

---

### 🟡 MEDIUM (Should address in v2)

#### 11. **No Data Caching / Query Optimization**
- **Impact:** Slower page loads, strain on Supabase, poor Core Web Vitals
- **Current:** Each route navigation triggers fresh Supabase queries
- **Problem:**
  - No React Query caching configured
  - No browser cache headers optimized
  - Repeated queries for categories on every page load
- **Fix Required:** Configure React Query with persistent cache, set Supabase CDN headers
- **Effort:** Medium (2-3 days)

#### 12. **Missing Breadcrumb Navigation**
- **Impact:** Users confused on category hierarchy, no breadcrumb schema for SERPs
- **Current:** Breadcrumb visual on product page, no schema
- **Fix Required:** Add JSON-LD BreadcrumbList schema, ensure all pages include breadcrumbs
- **Effort:** Low (1 day)

#### 13. **No Mobile-Specific Meta Tags**
- **Impact:** Mobile SERP features incomplete
- **Missing:**
  - `<meta name="viewport">` (basic present, but no optimization)
  - Apple-specific tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`)
  - Mobile-specific app icon/shortcut icons
- **Fix Required:** Add mobile optimization meta tags
- **Effort:** Low (0.5 days)

#### 14. **Missing Favicon & App Icons**
- **Impact:** Browser/mobile app icon missing, 404 errors in console
- **Current:** Not present in `/public`
- **Required:**
  - `favicon.ico` (16x16, 32x32)
  - `manifest.json` (for PWA)
  - `apple-touch-icon.png` (iOS home screen)
- **Fix Required:** Create icons, add manifest.json, update Helmet
- **Effort:** Low (1 day)

---

### 🔵 LOW (Nice to have, v2+)

#### 15. **No hreflang Tags (Internationalization)**
- **Impact:** Multi-language SEO signals missing (if applicable)
- **Current:** Not present; app appears to be single-language (English)
- **Note:** Only needed if planning internationalization

#### 16. **No Schema for Reviews/Testimonials**
- **Impact:** Review stars not showing in Google results
- **Current:** Testimonials section on home, no schema
- **Fix Required:** Add AggregateRating + Review schemas
- **Effort:** Low (1 day)

#### 17. **No Performance Meta Tags**
- **Impact:** Core Web Vitals not optimized at HTML level
- **Missing:**
  - Preconnect to Supabase API
  - DNS-prefetch for external domains
  - Resource hints (prefetch, preload)
- **Fix Required:** Add `<link rel="preconnect">` tags
- **Effort:** Low (0.5 days)

---

## What Exists ✅

```
├── robots.txt              ✅ Present, allows all crawlers
├── Static title/description ✅ Basic SEO tags in index.html
├── Mobile-responsive CSS   ✅ Tailwind mobile-first design
├── Semantic HTML (partial) ✅ Some Radix UI components use semantic tags
├── Fast build tool         ✅ Vite + React SWC
├── Error handling          ✅ 404 page exists
└── Supabase integration    ✅ Data fetching works
```

---

## What's Missing ❌

```
├── Dynamic meta tags               ❌ All pages show same title/description
├── JSON-LD structured data         ❌ Zero schema markup
├── Prerendering/SSR                ❌ Pure CSR, empty initial HTML
├── Sitemap                         ❌ No sitemap.xml
├── Canonical tags                  ❌ Not implemented
├── Open Graph images               ❌ No og:image set
├── Image optimization              ❌ No alt text audit, no lazy loading
├── Search backend                  ❌ Client-side search only
├── Breadcrumb schema               ❌ Visual only
├── ARIA/accessibility audit        ❌ Several WCAG gaps
├── Manifest/favicon                ❌ Missing
├── Caching strategy                ❌ No React Query cache
└── Mobile-specific tags            ❌ Basic only
```

---

## Implementation Roadmap (STEP 3)

### Phase 1: **Critical Blockers** (Must complete before launch)
```
[ ] 1. Implement prerendering for static pages (vite-plugin-prerender)
[ ] 2. Install react-helmet-async
[ ] 3. Add dynamic meta tags (<title>, <meta description>) to all pages
[ ] 4. Create sitemap.xml manually or via script
[ ] 5. Add JSON-LD structured data (Product, Organization)
```

### Phase 2: **High-Impact SEO** (Complete post-launch)
```
[ ] 6. Audit/improve all product image alt text
[ ] 7. Add Open Graph images (social sharing)
[ ] 8. Add canonical tags to all pages
[ ] 9. Implement backend search (Supabase full-text or Algolia)
[ ] 10. Add ARIA attributes to interactive components
```

### Phase 3: **Polish** (Q2 2024+)
```
[ ] 11. Set up React Query caching
[ ] 12. Add breadcrumb schema
[ ] 13. Create favicon + manifest.json
[ ] 14. Add review/rating schema
[ ] 15. Implement lazy loading for images
```

---

## Detailed Page-by-Page SEO Gaps

### Homepage (`/`)
| Element | Current | Needed |
|---------|---------|--------|
| **Title** | Static | "Premium Silver Jewelry – Rings, Necklaces, Earrings \| Sarvaa" |
| **Description** | Static | "Discover handcrafted 925 sterling silver jewelry. Free shipping on orders over ₹X. Shop certified authentic jewels." |
| **H1** | "Sarvaar" in hero | "Premium Sterling Silver Jewelry for Every Occasion" |
| **Schema** | None | Organization + WebPage |
| **Images** | No alt text | Alt: "{{slide.heading}} – premium silver jewelry" |
| **Structured Data** | None | BreadcrumbList (optional for home) |

### Category Pages (`/category/:slug`)
| Element | Current | Needed |
|---------|---------|--------|
| **Title** | Static | "{{category.name}} – Buy Online \| Sarvaa" |
| **Description** | None | "Shop {{category.name}} sterling silver jewelry. {{count}} designs available." |
| **H1** | Generic | "{{category.name}} – Handcrafted Silver Jewelry" |
| **Schema** | None | BreadcrumbList + Collection |
| **Canonical** | None | `https://sarvaa.com/category/:slug` |
| **Images** | Basic alt | "{{product.name}} – {{category.name}}" |

### Product Detail Page (`/product/:id`)
| Element | Current | Needed |
|---------|---------|--------|
| **Title** | Static | "{{product.name}} – ₹{{price}} \| Sarvaa" |
| **Description** | None | "{{product.short_description}} – Free shipping. 925 certified. {{discount}}% off." |
| **H1** | Product name | ✅ Present |
| **Schema** | None | **Product, AggregateRating, Offer, BreadcrumbList** |
| **Canonical** | None | `https://sarvaa.com/product/:id` |
| **OG Image** | None | Product primary image |
| **Images** | Missing alt | Each image: "{{product.name}} – detail view {{index}}" |
| **Structured Markup** | None | Price in `<data value="5000">`, availability in schema |

### Search Results (`/search?q=query`)
| Element | Current | Needed |
|---------|---------|--------|
| **Title** | Static | "Search results for "{{query}}" \| Sarvaa" |
| **Crawlability** | ❌ Not crawlable | Needs backend search or prerender top queries |
| **Pagination** | Not present | Add `rel="next"`, `rel="prev"` for pages |
| **Schema** | None | SearchResultsPage schema |

### Checkout (`/checkout`)
| Element | Current | Needed |
|---------|---------|--------|
| **Crawlability** | ✅ Not crawled (correct) | Keep noindex (not a public page) |
| **Schema** | None | BreadcrumbList only |

---

## Quick Wins (Can implement in 1-2 days)

```
1. Add react-helmet-async + set titles per page             [1 day]
2. Create sitemap.xml with category + top product URLs     [1 day]
3. Audit all image alt text and improve               [1-2 days]
4. Add canonical tags to all pages                   [0.5 day]
5. Create favicon.ico and manifest.json              [1 day]
6. Add basic Organization + Product JSON-LD          [1-2 days]
```

**Total for quick wins: ~5-7 days of work**

---

## Timeline Chart

```
WEEK 1:
├─ STEP 1: Audit (DONE) ✅
├─ STEP 2: Write CLAUDE.md
└─ Get your approval

WEEK 2-3:
├─ Implement prerendering
├─ Add Helmet + dynamic meta tags
├─ Create sitemap
├─ Add structured data
└─ Improve image SEO

WEEK 4:
├─ Backend search
├─ Accessibility audit + ARIA fixes
├─ Open Graph images
└─ Testing & QA

WEEK 5:
└─ Deploy, monitor search console, iterate
```

---

## Recommended Tools for STEP 3

```
npm install react-helmet-async
npm install react-json-ld
npm install -D vite-plugin-prerender
npm install -D sitemap
npm install sharp                          (for image optimization, optional)
npm install axios-retry                    (for robust Supabase queries)
```

---

## Success Metrics (Post-Implementation)

- ✅ All pages show unique, semantic title + description in Google Search
- ✅ Product pages display rich snippets (price, reviews, availability)
- ✅ Sitemap indexed by Google Search Console
- ✅ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- ✅ Mobile-first indexing: Mobile version matches desktop
- ✅ Zero 404 errors for critical pages
- ✅ Accessibility: WCAG 2.1 AA compliance
- ✅ Social sharing: OG images display on Twitter/Facebook

---

## Next Steps

1. **Review this audit** — validate findings
2. **Approve STEP 2 (CLAUDE.md)** — document project for future agents
3. **Approve STEP 3 approach** — decide on prerendering vs. SSR
4. **Execute STEP 3** — implementation begins
5. **Create PR** — test on staging before merging to bin-landing

---

**Audit prepared by:** Claude
**For:** Sarvaa Frontend Team
**Scope:** Client-Side Rendered Vite + React Application
**Status:** Ready for action
