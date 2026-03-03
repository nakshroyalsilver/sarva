import { Helmet } from "react-helmet-async"; // <-- ADDED SEO IMPORT
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";

import GiftingSection from "@/components/home/GiftingSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ShopByPrice from "@/components/home/ShopByPrice";
import Testimonials from "@/components/home/Testimonials";
import StylingCarousel from "@/components/home/StylingCarousel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      
      {/* --- ADDED SEO HELMET LOGIC --- */}
      <Helmet>
        <title>Sarvaa Fine Jewelry | Luxury Handcrafted Pieces</title>
        <meta name="description" content="Discover Sarvaa Fine Jewelry. Explore our exclusive collection of premium rings, necklaces, and earrings handcrafted in 925 Sterling Silver." />
        <link rel="canonical" href="https://sarvaajewelry.com" />
        
        {/* Open Graph / Social Media Tags */}
        <meta property="og:title" content="Sarvaa Fine Jewelry | Luxury Handcrafted Pieces" />
        <meta property="og:description" content="Explore our exclusive collection of premium rings, necklaces, and earrings handcrafted in 925 Sterling Silver." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sarvaajewelry.com" />
        <meta property="og:image" content="https://sarvaajewelry.com/default-share-image.jpg" />

        {/* JSON-LD Schema for Google (Tells Google this is a Brand/Company) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Sarvaa Fine Jewelry",
            "url": "https://sarvaajewelry.com",
            "logo": "https://sarvaajewelry.com/logo.png",
            "description": "Luxury handcrafted 925 Sterling Silver jewelry.",
            "sameAs": [
              "https://instagram.com/yourprofile", // Update these later with your real links!
              "https://facebook.com/yourprofile"
            ]
          })}
        </script>
      </Helmet>
      {/* --- END SEO HELMET LOGIC --- */}

      <Navbar />
      <main>
        <HeroSection />
        <WhyChooseUs />
        <CategoryShowcase />
       
        <StylingCarousel />
       
        <ShopByPrice />
        <GiftingSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;