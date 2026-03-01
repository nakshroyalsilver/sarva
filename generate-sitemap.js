#!/usr/bin/env node

// Script to generate sitemap.xml at build time
// Run this before building: node generate-sitemap.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL of the site
const BASE_URL = 'https://sarvaa.com';

// Static routes (high priority)
const staticRoutes = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/corporate', priority: 0.7, changefreq: 'monthly' },
];

// Category routes (from Supabase - you would fetch these dynamically)
// For now, use these as placeholders
const categoryRoutes = [
  { url: '/category/rings', priority: 0.9, changefreq: 'weekly' },
  { url: '/category/earrings', priority: 0.9, changefreq: 'weekly' },
  { url: '/category/necklaces', priority: 0.9, changefreq: 'weekly' },
  { url: '/category/bracelets', priority: 0.9, changefreq: 'weekly' },
  { url: '/category/gift-sets', priority: 0.8, changefreq: 'weekly' },
  { url: '/category/bangles', priority: 0.8, changefreq: 'weekly' },
  { url: '/category/chains', priority: 0.8, changefreq: 'weekly' },
  { url: '/category/new', priority: 0.9, changefreq: 'daily' },
  { url: '/category/all', priority: 0.9, changefreq: 'weekly' },
];

// Top product routes (dynamic - should be populated from database)
// This is a sample - in production, fetch top-selling products from Supabase
const productRoutes = [
  // Add your top products here or leave empty if you want to populate dynamically
  // { url: '/product/r1', priority: 0.8, changefreq: 'weekly' },
];

// Combine all routes
const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes];

// Generate XML
function generateSitemap(routes) {
  const entries = routes
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

// Write sitemap to public folder
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
const sitemapContent = generateSitemap(allRoutes);

fs.mkdirSync(path.dirname(sitemapPath), { recursive: true });
fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

console.log(`✓ Sitemap generated at ${sitemapPath}`);
console.log(`✓ Total URLs: ${allRoutes.length}`);
