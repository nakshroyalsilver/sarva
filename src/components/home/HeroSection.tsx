import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../../supabase";
import { Link } from "react-router-dom";

interface HeroSlide {
  id: string;
  image_url: string;
  mobile_image_url?: string; // Giva-style mobile image support
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

  // 🚀 FIXED: Mobile height is now smaller (h-[55vh] / min-h-[400px]) to match Giva's 4:5 ratio.
  // Desktop remains at the previously fixed wide banner height (md:h-[50vh]).
  if (loading || slides.length === 0) {
    return <section className="relative h-[55vh] min-h-[400px] md:h-[50vh] md:min-h-[400px] w-full bg-stone-50 animate-pulse" />;
  }

  const currentSlide = slides[current];

  return (
    <section className="relative h-[55vh] min-h-[400px] md:h-[50vh] md:min-h-[400px] w-full overflow-hidden bg-stone-50">
      
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
          {/* The <picture> tag! */}
          <picture>
            {/* If screen is mobile (max-width: 768px), use the mobile image if it exists */}
            <source 
              media="(max-width: 768px)" 
              srcSet={currentSlide.mobile_image_url || currentSlide.image_url} 
            />
            {/* Otherwise, use the standard desktop image */}
            <img
              src={currentSlide.image_url}
              alt={currentSlide.heading || "Hero Image"}
              className="h-full w-full object-cover object-center"
              fetchPriority={current === 0 ? "high" : "auto"}
              loading={current === 0 ? "eager" : "lazy"}
              decoding={current === 0 ? "sync" : "async"}
            />
          </picture>
          
          {/* Smart Overlay */}
          {(currentSlide.heading || currentSlide.subheading) && (
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent md:bg-gradient-to-r md:from-white/90 md:via-white/40 md:to-transparent" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-10 md:pb-0 md:justify-center px-5 sm:px-8 md:px-12 max-w-7xl mx-auto w-full">
        <div className="w-full md:max-w-lg lg:max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {currentSlide.heading && (
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white md:text-gray-900 leading-[1.15] mb-2 md:mb-4 drop-shadow-md md:drop-shadow-none">
                  {currentSlide.heading}
                </h2>
              )}
              
              {currentSlide.subheading && (
                <p className="text-gray-100 md:text-gray-600 text-xs sm:text-sm md:text-lg font-medium md:font-light mb-4 md:mb-6 max-w-[95%] md:max-w-md drop-shadow-md md:drop-shadow-none">
                  {currentSlide.subheading}
                </p>
              )}

              {currentSlide.button_text && (
                <Link to={currentSlide.button_link || "/category/all"} className="inline-block w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-3 md:px-6 md:py-2.5 bg-white md:bg-gray-900 text-gray-900 md:text-white text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-gray-100 md:hover:bg-gray-800 transition-colors cursor-pointer shadow-lg md:shadow-none">
                    {currentSlide.button_text}
                  </button>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex items-center gap-2 md:gap-3">
          <button
            onClick={() => go(-1)}
            className="p-1.5 md:p-2 bg-white/20 md:bg-white/80 hover:bg-white text-white md:text-gray-800 transition-colors cursor-pointer border border-white/30 md:border-stone-100 shadow-sm rounded backdrop-blur-sm md:backdrop-blur-none"
            aria-label="Previous"
          >
            <ChevronLeft size={16} className="md:w-5 md:h-5" />
          </button>
          <span className="font-serif text-[10px] md:text-sm mx-1 md:mx-2 text-white md:text-stone-700 font-medium drop-shadow-md md:drop-shadow-none">
            {current + 1} / {slides.length}
          </span>
          <button
            onClick={() => go(1)}
            className="p-1.5 md:p-2 bg-white/20 md:bg-white/80 hover:bg-white text-white md:text-gray-800 transition-colors cursor-pointer border border-white/30 md:border-stone-100 shadow-sm rounded backdrop-blur-sm md:backdrop-blur-none"
            aria-label="Next"
          >
            <ChevronRight size={16} className="md:w-5 md:h-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default HeroSection;