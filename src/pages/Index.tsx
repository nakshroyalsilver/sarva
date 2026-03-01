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
