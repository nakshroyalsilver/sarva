import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { supabase } from "../../../supabase"; 
import { categories as staticCategories } from "@/data/products";

interface LiveCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}

const CategoryShowcase = () => {
  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchLiveCategories() {
      try {
        // Fetch ALL categories, ignoring the is_visible toggle
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, is_visible, products ( image_url )')
          .order('name', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedCategories: LiveCategory[] = data.map((cat: any) => {
            let coverImage = cat.products?.[0]?.image_url || "https://placehold.co/400x600/f8f8f8/999999?text=Collection";
            return { id: cat.id, name: cat.name, slug: cat.slug, image: coverImage };
          });
          setCategories(formattedCategories);
        } else {
          setCategories(staticCategories as unknown as LiveCategory[]);
        }
      } catch (error) {
        setCategories(staticCategories as unknown as LiveCategory[]);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveCategories();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Scroll by roughly 2 cards at a time
      const scrollAmount = clientWidth * 0.75; 
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header - Simple & Clean */}
        <div className="text-center mb-10 md:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[0.3em] text-rose-500 uppercase mb-2 block"
          >
            Our Collections
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-2xl md:text-4xl text-gray-900 tracking-tight"
          >
            Shop by Category
          </motion.h2>
        </div>

        <div className="relative group">
          {/* --- Navigation Arrows - Positioned over the cards --- */}
          <button 
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 p-2 bg-white/80 backdrop-blur-md border border-stone-200 rounded-full shadow-lg text-stone-800 hover:bg-stone-900 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 p-2 bg-white/80 backdrop-blur-md border border-stone-200 rounded-full shadow-lg text-stone-800 hover:bg-stone-900 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight size={24} />
          </button>

          {/* --- Slider Container --- */}
          {loading ? (
            <div className="flex gap-6 overflow-hidden">
               {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="min-w-[220px] md:min-w-[260px] aspect-[3/4] bg-gray-50 animate-pulse rounded-sm"></div>
                ))}
            </div>
          ) : (
            <div 
              ref={scrollRef}
              className="flex gap-5 md:gap-7 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  className="flex-shrink-0 w-[220px] md:w-[260px] lg:w-[280px] snap-start"
                >
                  <Link to={`/category/${cat.slug}`} className="group flex flex-col w-full">
                    
                    {/* Compact Image Card */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-50 mb-5 border border-stone-100 shadow-sm transition-all duration-500 group-hover:shadow-xl">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="absolute inset-x-0 bottom-4 px-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex justify-center">
                        <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest shadow-md flex items-center gap-2 hover:bg-rose-600 hover:text-white transition-colors w-full justify-center">
                          Explore <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>

                    {/* Minimal Category Title */}
                    <div className="text-center px-2">
                      <h3 className="font-serif text-lg md:text-xl text-gray-900 group-hover:text-rose-600 transition-colors duration-300 truncate">
                        {cat.name}
                      </h3>
                      <div className="mt-3 flex justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="h-[1px] w-6 bg-stone-300 group-hover:w-12 group-hover:bg-rose-400 transition-all duration-500"></span>
                      </div>
                    </div>

                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default CategoryShowcase;