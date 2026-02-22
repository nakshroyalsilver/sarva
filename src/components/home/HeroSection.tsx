import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=1600&h=900&fit=crop",
    overline: "New Collection",
    title: "Ethereal Silver",
    subtitle: "Hand-polished 925 Sterling Silver.",
    cta: "Shop Now",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1600&h=900&fit=crop",
    overline: "Best Sellers",
    title: "The Minimalist Edit",
    subtitle: "Understated elegance for every day.",
    cta: "Explore",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&h=900&fit=crop",
    overline: "Limited Edition",
    title: "Bridal & Occasion",
    subtitle: "Statement pieces for forever memories.",
    cta: "Discover",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const go = (dir: number) => {
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  };

  return (
    // CHANGE: Reduced height to h-[50vh] (mobile) and h-[60vh] (desktop)
    <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-gray-50">
      
      {/* 1. Background Image Layer */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={slides[current].id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="h-full w-full object-cover object-center"
          />
          {/* Soft gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* 2. Content Layer */}
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
              <span className="block text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-3">
                {slides[current].overline}
              </span>
              
              {/* CHANGE: Smaller font sizes to match reduced height */}
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-4">
                {slides[current].title}
              </h2>
              
              <p className="text-gray-600 text-base md:text-lg font-light mb-6">
                {slides[current].subtitle}
              </p>

              <button className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors">
                {slides[current].cta}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Minimal Navigation (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={() => go(-1)}
          className="p-2 bg-white/80 hover:bg-white text-gray-800 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-serif text-sm mx-2">
          {current + 1} / {slides.length}
        </span>
        <button
          onClick={() => go(1)}
          className="p-2 bg-white/80 hover:bg-white text-gray-800 transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;