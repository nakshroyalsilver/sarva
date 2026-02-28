import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../../supabase"
import { Link } from "react-router-dom";

interface HeroSlide {
  id: string;
  image_url: string;
  heading: string;
  subheading: string;
  button_text: string;
  button_link: string;
}

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live slides from Supabase
  useEffect(() => {
    async function getHeroSlides() {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setSlides(data);
        }
      } catch (err) {
        console.error("Error fetching hero slides:", err);
      } finally {
        setLoading(false);
      }
    }
    getHeroSlides();
  }, []);

  // 2. Auto-rotate timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const go = (dir: number) => {
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  };

  // Loading state (Empty height to prevent layout jump)
  if (loading || slides.length === 0) {
    return <section className="relative h-[50vh] md:h-[60vh] w-full bg-stone-50 animate-pulse" />;
  }

  const currentSlide = slides[current];

  return (
    <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-gray-50">
      
      {/* Background Image Layer */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          <img
            src={currentSlide.image_url}
            alt={currentSlide.heading}
            className="h-full w-full object-cover object-center"
          />
          {/* Only show overlay if there is text to read */}
          {(currentSlide.heading || currentSlide.subheading) && (
             <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex items-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Heading */}
              {currentSlide.heading && (
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-4">
                  {currentSlide.heading}
                </h2>
              )}
              
              {/* Subheading / Caption */}
              {currentSlide.subheading && (
                <p className="text-gray-600 text-base md:text-lg font-light mb-6">
                  {currentSlide.subheading}
                </p>
              )}

              {/* CTA Button */}
              {currentSlide.button_text && (
                <Link to={currentSlide.button_link || "/category/all"}>
                  <button className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors cursor-pointer">
                    {currentSlide.button_text}
                  </button>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows (Only show if more than 1 slide) */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            className="p-2 bg-white/80 hover:bg-white text-gray-800 transition-colors cursor-pointer border border-stone-100 shadow-sm"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-serif text-sm mx-2 text-stone-600">
            {current + 1} / {slides.length}
          </span>
          <button
            onClick={() => go(1)}
            className="p-2 bg-white/80 hover:bg-white text-gray-800 transition-colors cursor-pointer border border-stone-100 shadow-sm"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
};

export default HeroSection;