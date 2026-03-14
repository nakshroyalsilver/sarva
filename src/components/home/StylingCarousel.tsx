import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../../supabase"; // Adjust path if needed

const StylingCarousel = () => {
  const [stylingContent, setStylingContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // 1. Fetch Featured Products from Supabase
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            title,
            slug,
            description,
            image_url,
            is_active,
            categories ( name )
          `)
          // We use is_active to ensure we only show visible products
          .eq("is_active", true) 
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map((p: any) => ({
            id: p.id,
            slug: p.slug, // <-- We now grab the slug for the URL
            // Big Heading: Shows the Category Name (e.g., "Necklaces")
            categoryName: p.categories?.name || "Featured Style", 
            description: p.description || "Discover the craftsmanship of this featured piece.",
            media: p.image_url,
            // Small Pill: Shows the actual Product Name (e.g., "Silver Lotus Ring")
            productName: p.title, 
          }));
          setStylingContent(formatted);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  // 2. Auto-scroll effect
  useEffect(() => {
    if (stylingContent.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % stylingContent.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [stylingContent.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    if (stylingContent.length === 0) return;
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % stylingContent.length;
      } else {
        return prev === 0 ? stylingContent.length - 1 : prev - 1;
      }
    });
  };

  if (loading) return null; 
  if (stylingContent.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-stone-50 via-white to-stone-100 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] text-stone-400 uppercase mb-2 font-bold">
            Style Inspiration
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 tracking-tight lowercase">
            the styling guide
          </h2>
        </div>

        <div className="relative h-[450px] md:h-[550px] flex items-center justify-center perspective-1000">

          {stylingContent.length > 1 && (
            <>
              <button
                onClick={() => paginate(-1)}
                className="absolute left-4 md:left-8 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110 cursor-pointer border border-stone-100"
                aria-label="Previous"
              >
                <ChevronLeft size={24} className="text-stone-700" />
              </button>

              <button
                onClick={() => paginate(1)}
                className="absolute right-4 md:right-8 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110 cursor-pointer border border-stone-100"
                aria-label="Next"
              >
                <ChevronRight size={24} className="text-stone-700" />
              </button>
            </>
          )}

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
                  rotateY: { duration: 0.6 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute w-full max-w-xl cursor-grab active:cursor-grabbing px-4 md:px-0"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-stone-200/50">
                  <div className="relative h-[350px] md:h-[450px]">
                    <img
                      src={stylingContent[currentIndex].media}
                      alt={stylingContent[currentIndex].productName}
                      className="w-full h-full object-cover bg-stone-100"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                      <h3 className="font-serif text-3xl md:text-4xl mb-2 capitalize">
                        {stylingContent[currentIndex].categoryName}
                      </h3>
                      <p className="text-sm md:text-base text-white/80 mb-6 max-w-md font-light line-clamp-2">
                        {stylingContent[currentIndex].description}
                      </p>

                      {/* We now use .slug in the URL instead of .id */}
                      <Link to={`/product/${stylingContent[currentIndex].slug}`} className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full pr-6 pl-2 py-2 border border-white/20 hover:bg-white/20 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20 shrink-0">
                          <img src={stylingContent[currentIndex].media} className="w-full h-full object-cover" alt="thumbnail" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider line-clamp-1 text-white">
                            {stylingContent[currentIndex].productName}
                          </p>
                          <p className="text-[10px] text-white/70 group-hover:text-white transition-colors flex items-center gap-1 mt-0.5 uppercase tracking-widest">
                            Shop Piece <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                          </p>
                        </div>
                      </Link>
                    </div>

                    <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest border border-white/20">
                      FEATURED
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 -z-10 pointer-events-none">
                  <div className="absolute inset-0 bg-stone-200 rounded-2xl transform translate-x-4 translate-y-4 opacity-40"></div>
                  <div className="absolute inset-0 bg-stone-300 rounded-2xl transform translate-x-8 translate-y-8 opacity-20"></div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {stylingContent.length > 1 && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {stylingContent.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentIndex
                      ? "bg-stone-800 w-8"
                      : "bg-stone-300 w-2 hover:bg-stone-400"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StylingCarousel;