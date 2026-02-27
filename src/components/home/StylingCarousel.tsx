import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase";
import { bestSellers } from "@/data/products";

// Fallback static slides used when no featured products exist in Supabase yet
const staticSlides = [
  {
    id: "static-1",
    title: "Everyday Elegance",
    description: "Minimalist pieces for daily wear",
    media: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    productName: "Dainty Chain Pendant",
    slug: null,
  },
  {
    id: "static-2",
    title: "Bridal Collection",
    description: "Exquisite pieces for your special day",
    media: "https://images.unsplash.com/photo-1515562141589-67f0d569b03e?w=800&q=80",
    productName: "Pearl Drop Necklace",
    slug: null,
  },
  {
    id: "static-3",
    title: "Statement Jewelry",
    description: "Bold designs that stand out",
    media: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
    productName: "Silver Hoop Earrings",
    slug: null,
  },
  {
    id: "static-4",
    title: "Office Chic",
    description: "Professional elegance",
    media: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    productName: "Charm Bangle Set",
    slug: null,
  },
  {
    id: "static-5",
    title: "Party Ready",
    description: "Glamorous evening wear",
    media: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    productName: "Twisted Silver Band",
    slug: null,
  },
];

type Slide = {
  id: string;
  title: string;
  description: string;
  media: string;
  productName: string;
  slug: string | null; // product id for the link; null = no link (static fallback)
};

const StylingCarousel = () => {
  const [slides, setSlides] = useState<Slide[]>(staticSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, title, description, image_url, image_urls, categories(name, slug)")
          .eq("is_featured", true)
          .limit(8);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Slide[] = data.map((p) => ({
            id: String(p.id),
            title: p.title,
            description: p.description
              ? p.description.slice(0, 60) + (p.description.length > 60 ? "…" : "")
              : `925 Sterling Silver · ${(p.categories as any)?.name || "Jewelry"}`,
            media:
              p.image_urls && p.image_urls.length > 0
                ? p.image_urls[0]
                : p.image_url || staticSlides[0].media,
            productName: p.title,
            slug: String(p.id),
          }));
          setSlides(mapped);
          setCurrentIndex(0);
        }
        // If no featured products, staticSlides stays as-is (already set above)
      } catch {
        // Keep staticSlides on error
      }
    }

    fetchFeatured();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) return (prev + 1) % slides.length;
      return prev === 0 ? slides.length - 1 : prev - 1;
    });
  };

  const current = slides[currentIndex];

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-rose-50/20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-1.5">
            Style Inspiration
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
            Styling Guide
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative h-[500px] md:h-[600px] flex items-center justify-center perspective-1000">

          {/* Navigation Buttons */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 md:left-8 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          <button
            onClick={() => paginate(1)}
            className="absolute right-4 md:right-8 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>

          {/* Cards Stack */}
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.6 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) paginate(1);
                  else if (swipe > swipeConfidenceThreshold) paginate(-1);
                }}
                className="absolute w-full max-w-2xl"
              >
                {/* Main Card */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white">
                  <div className="relative h-[400px] md:h-[500px]">
                    <img
                      src={current.media}
                      alt={current.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                      <h3 className="font-serif text-3xl md:text-4xl mb-2">{current.title}</h3>
                      <p className="text-sm md:text-base text-white/90 mb-4">{current.description}</p>

                      {/* Product Tag */}
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
                        <div
                          className="w-10 h-10 rounded-full bg-cover bg-center bg-white/30 flex-shrink-0"
                          style={current.slug ? { backgroundImage: `url(${current.media})` } : {}}
                        />
                        <div>
                          <p className="text-xs font-medium">{current.productName}</p>
                          {current.slug ? (
                            <Link
                              to={`/product/${current.slug}`}
                              className="text-xs text-white/80 hover:text-white flex items-center gap-1"
                            >
                              View Product →
                            </Link>
                          ) : (
                            <span className="text-xs text-white/80">View Product →</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                      {current.slug ? "FEATURED" : "STYLING"}
                    </div>
                  </div>
                </div>

                {/* Background Cards (stacked effect) */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 bg-gray-200 rounded-2xl transform translate-x-4 translate-y-4 opacity-30"></div>
                  <div className="absolute inset-0 bg-gray-300 rounded-2xl transform translate-x-8 translate-y-8 opacity-20"></div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StylingCarousel;
