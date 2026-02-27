import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalPath?: string;
  jsonLd?: object | object[];
}

const BASE_DOMAIN = "https://sarvaajewelry.com";
const BRAND = "Sarvaa Jewelry";

export function useSEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalPath,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    // Title
    const fullTitle = title ? `${title} | ${BRAND}` : `${BRAND} — Handcrafted 925 Sterling Silver Jewelry`;
    document.title = fullTitle;

    // Helper to upsert a meta tag
    function setMeta(selector: string, value: string) {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const attr = selector.startsWith("meta[name") ? "name" : "property";
        const key = selector.match(/["']([^"']+)["']/)?.[1] || "";
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    }

    // Helper to upsert a link tag
    function setLink(rel: string, href: string) {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    }

    if (description) {
      setMeta(`meta[name="description"]`, description);
      setMeta(`meta[property="og:description"]`, ogDescription || description);
      setMeta(`meta[name="twitter:description"]`, ogDescription || description);
    }

    if (keywords) {
      setMeta(`meta[name="keywords"]`, keywords);
    }

    const resolvedOgTitle = ogTitle || fullTitle;
    setMeta(`meta[property="og:title"]`, resolvedOgTitle);
    setMeta(`meta[name="twitter:title"]`, resolvedOgTitle);

    if (ogImage) {
      setMeta(`meta[property="og:image"]`, ogImage);
      setMeta(`meta[name="twitter:image"]`, ogImage);
    }

    if (canonicalPath) {
      const canonicalUrl = `${BASE_DOMAIN}${canonicalPath}`;
      setLink("canonical", canonicalUrl);
      setMeta(`meta[property="og:url"]`, canonicalUrl);
    }

    // Inject or update JSON-LD structured data for this page
    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      // Remove any previously injected dynamic scripts
      document.querySelectorAll('script[data-sarvaa-seo]').forEach(el => el.remove());
      schemas.forEach((schema) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-sarvaa-seo", "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    // Cleanup dynamic scripts when component unmounts
    return () => {
      document.querySelectorAll('script[data-sarvaa-seo]').forEach(el => el.remove());
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalPath, jsonLd]);
}
