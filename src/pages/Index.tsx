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

const Index = () => {
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
