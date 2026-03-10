import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import GiftingSection from "@/components/home/GiftingSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ShopByPrice from "@/components/home/ShopByPrice";
import Testimonials from "@/components/home/Testimonials";
import StylingCarousel from "@/components/home/StylingCarousel";
import ScrollReveal from "../../src/components/ui/ScrollReveal"; 

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sarvaa Fine Jewelry | Luxury Handcrafted Pieces</title>
        <meta name="description" content="Discover Sarvaa Fine Jewelry. Explore our exclusive collection of premium rings, necklaces, and earrings handcrafted in 925 Sterling Silver." />
        <link rel="canonical" href="https://sarvaajewelry.com" />
        {/* ... (Rest of your Helmet logic remains exactly the same) */}
      </Helmet>

      <Navbar />
      <main>
        {/* 1. Hero loads immediately (No animation) */}
        <HeroSection />

        {/* 2. Why Choose Us fades in */}
        <ScrollReveal>
          <WhyChooseUs />
        </ScrollReveal>

        {/* 3. Category Showcase fades in */}
        <ScrollReveal>
          <CategoryShowcase />
        </ScrollReveal>
        
        {/* 4. Styling Carousel fades in with a slight delay */}
        <ScrollReveal delay={0.1}>
          <StylingCarousel />
        </ScrollReveal>
        
        {/* 5. Shop By Price fades in */}
        <ScrollReveal>
          <ShopByPrice />
        </ScrollReveal>

        {/* 6. Gifting Section fades in */}
        <ScrollReveal>
          <GiftingSection />
        </ScrollReveal>

        {/* 7. Testimonials fade in */}
        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Index;