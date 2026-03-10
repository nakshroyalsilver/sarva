import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../../supabase"; 

interface LiveCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}

// --- SMART IMAGE DICTIONARY ---
const DEFAULT_THUMBNAILS: Record<string, string> = {
  'rings': 'https://images.unsplash.com/photo-1605100804763-247f66122c94?q=80&w=800&auto=format&fit=crop',
  'ring': 'https://images.unsplash.com/photo-1605100804763-247f66122c94?q=80&w=800&auto=format&fit=crop',
  'necklaces': 'https://images.unsplash.com/photo-1599643478514-4a73428e3626?q=80&w=800&auto=format&fit=crop',
  'necklace': 'https://images.unsplash.com/photo-1599643478514-4a73428e3626?q=80&w=800&auto=format&fit=crop',
  'earrings': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
  'earring': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
  'bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
  'bracelet': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
  'pendants': 'https://images.unsplash.com/photo-1602751584552-8ba73aad10ee?q=80&w=800&auto=format&fit=crop',
  'pendant': 'https://images.unsplash.com/photo-1602751584552-8ba73aad10ee?q=80&w=800&auto=format&fit=crop',
  'mangalsutras': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop'
};

const CategoryShowcase = () => {
  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchLiveCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          // 🚀 FIXED: Added nested filtering to ensure we ONLY grab images from non-archived products
          .select('id, name, slug, is_visible, products!inner ( image_url, is_archived )') 
          .eq('is_visible', true) 
          .eq('products.is_archived', false) // 🚀 This tells Supabase to ignore archived product images
          .order('name', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedCategories: LiveCategory[] = data.map((cat: any) => {
            const cleanSlug = cat.slug.toLowerCase().trim();
            const smartFallback = DEFAULT_THUMBNAILS[cleanSlug] || DEFAULT_THUMBNAILS['default'];
            
            // Priority: 1. First Non-Archived Product's Image -> 2. Smart Dictionary Image
            let coverImage = cat.products?.[0]?.image_url || smartFallback;
            
            return { id: cat.id, name: cat.name, slug: cat.slug, image: coverImage };
          });
          setCategories(formattedCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveCategories();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75; 
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="pt-12 pb-6 md:pt-20 md:pb-8 bg-white overflow-hidden border-b border-stone-100 relative">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-serif text-2xl md:text-4xl text-stone-900 tracking-tight"
          >
            Shop by Category
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="h-px w-16 bg-rose-300 mx-auto mt-4"
          ></motion.div>
        </div>

        <div className="relative group">
          <button 
            onClick={() => scroll("left")}
            className="absolute left-0 top-[40%] -translate-y-1/2 -ml-3 md:-ml-6 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-md border border-stone-200 rounded-full shadow-lg text-stone-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>

          <button 
            onClick={() => scroll("right")}
            className="absolute right-0 top-[40%] -translate-y-1/2 -mr-3 md:-mr-6 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-md border border-stone-200 rounded-full shadow-lg text-stone-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>

          {loading ? (
            <div className="flex gap-4 md:gap-6 overflow-hidden">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="min-w-[160px] md:min-w-[240px] lg:min-w-[280px] flex flex-col gap-4">
                   <div className="aspect-[4/5] bg-stone-100 animate-pulse rounded-xl"></div>
                   <div className="h-5 w-1/2 bg-stone-100 animate-pulse rounded mx-auto"></div>
                 </div>
               ))}
            </div>
          ) : categories.length > 0 ? (
            <div 
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 pt-2"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[240px] lg:w-[280px] snap-start"
                >
                  <Link to={`/category/${cat.slug}`} className="group flex flex-col w-full">
                    
                    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-stone-50 shadow-sm border border-stone-100">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 opacity-60 md:opacity-0 md:group-hover:opacity-80"></div>

                      <div className="absolute bottom-3 md:bottom-5 inset-x-3 md:inset-x-5 transition-all duration-500 ease-out opacity-100 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 z-10">
                        <div className="w-full bg-white/95 backdrop-blur-sm text-stone-900 px-2 py-2.5 md:py-3 text-[9px] md:text-xs font-bold uppercase tracking-[0.15em] rounded shadow-md border border-white/50 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors duration-300 text-center">
                          View Collection
                        </div>
                      </div>

                    </div>

                    <div className="mt-4 text-center px-1">
                      <h3 className="font-serif text-lg md:text-xl text-stone-900 group-hover:text-rose-600 transition-colors duration-300">
                        {cat.name}
                      </h3>
                    </div>

                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500">
              No categories found.
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