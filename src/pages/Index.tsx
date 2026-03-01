import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";

import NewArrivals from "@/components/home/NewArrivals";
import GiftingSection from "@/components/home/GiftingSection";

import WhyChooseUs from "@/components/home/WhyChooseUs";
import ShopByPrice from "@/components/home/ShopByPrice";
import Testimonials from "@/components/home/Testimonials";
import StylingCarousel from "@/components/home/StylingCarousel";

const Index = () => {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://sarvaa.com";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sarvaa",
    alternateName: "Sarvaar",
    url: "https://sarvaa.com",
    logo: "https://sarvaa.com/logo.png",
    description: "Premium handcrafted 925 sterling silver jewelry with free shipping.",
    sameAs: [
      "https://www.facebook.com/sarvaa",
      "https://www.instagram.com/sarvaa",
      "https://twitter.com/sarvaa"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@sarvaa.com"
    }
  };

  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Premium Silver Jewelry – Rings, Necklaces, Earrings | Sarvaa",
    description: "Discover handcrafted 925 sterling silver jewelry. Shop certified authentic rings, necklaces, earrings, and bracelets with free shipping.",
    url: currentUrl,
    mainEntity: organizationSchema
  };

  return (
    <>
      <Helmet>
        <title>Premium Silver Jewelry – Rings, Necklaces, Earrings | Sarvaa</title>
        <meta name="description" content="Discover handcrafted 925 sterling silver jewelry. Shop certified authentic rings, necklaces, earrings, and bracelets with free shipping." />
        <meta name="keywords" content="silver jewelry, sterling silver, silver rings, silver necklace, earrings, bracelets, handmade jewelry" />
        <link rel="canonical" href="https://sarvaa.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Premium Silver Jewelry – Rings, Necklaces, Earrings | Sarvaa" />
        <meta property="og:description" content="Discover handcrafted 925 sterling silver jewelry. Free shipping on orders." />
        <meta property="og:url" content="https://sarvaa.com/" />
        <meta property="og:image" content="https://sarvaa.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium Silver Jewelry – Rings, Necklaces, Earrings | Sarvaa" />
        <meta name="twitter:description" content="Discover handcrafted 925 sterling silver jewelry. Free shipping on orders." />
        <meta name="twitter:image" content="https://sarvaa.com/og-image.jpg" />

        {/* Mobile */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="white" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">{JSON.stringify(webpageSchema)}</script>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <WhyChooseUs />
          <CategoryShowcase />

          <StylingCarousel />
          <NewArrivals />
          <ShopByPrice />
          <GiftingSection />
          <Testimonials />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
