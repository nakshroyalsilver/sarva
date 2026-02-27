import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewArrivals from "@/components/home/NewArrivals";
import GiftingSection from "@/components/home/GiftingSection";
import ShopByOccasion from "@/components/home/ShopByOccasion";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ShopByPrice from "@/components/home/ShopByPrice";
import Testimonials from "@/components/home/Testimonials";
import StylingCarousel from "@/components/home/StylingCarousel";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Handcrafted 925 Sterling Silver Jewelry in India",
    description: "Sarvaa Jewelry — India's premium destination for handcrafted 925 Sterling Silver jewelry. Shop silver rings, necklaces, earrings, bracelets & anklets. BIS hallmarked, free shipping, 30-day returns.",
    keywords: "silver jewelry India, 925 sterling silver, handcrafted silver jewelry, silver rings, silver necklace, silver earrings, Sarvaa jewelry, buy silver jewelry online India",
    canonicalPath: "/",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <WhyChooseUs />
        <CategoryShowcase />
        <ShopByOccasion />
        <FeaturedProducts />
        <StylingCarousel />
        <NewArrivals />
        <ShopByPrice />
        <GiftingSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
