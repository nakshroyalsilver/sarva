import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1515562141589-67f0d569b03e?w=1600&h=700&fit=crop",
    title: "New Collection",
    subtitle: "Timeless Silver Elegance",
    cta: "Shop Now",
  },
  {
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&h=700&fit=crop",
    title: "Best Sellers",
    subtitle: "Loved by thousands",
    cta: "Explore",
  },
  {
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=1600&h=700&fit=crop",
    title: "Sterling Silver",
    subtitle: "Crafted to perfection",
    cta: "Discover",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const go = (dir: number) => setCurrent((prev) => (prev + dir + slides.length) % slides.length);

  return (
    <section className="relative h-[50vh] md:h-[70vh] overflow-hidden bg-secondary">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-background/80 text-sm tracking-[0.3em] uppercase mb-3 font-light">
              {slides[current].subtitle}
            </p>
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-background tracking-wide mb-6">
              {slides[current].title}
            </h2>
            <button className="px-8 py-3 bg-background text-foreground text-sm tracking-wider hover:bg-background/90 transition-colors rounded-full">
              {slides[current].cta}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/20 hover:bg-background/40 text-background rounded-full backdrop-blur-sm transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/20 hover:bg-background/40 text-background rounded-full backdrop-blur-sm transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-background w-6" : "bg-background/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
