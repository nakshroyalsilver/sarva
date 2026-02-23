import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "../../../supabase"; // Adjust the path if needed
import { categories as staticCategories } from "@/data/products"; // Import static data as fallback

interface LiveCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
}

const CategoryShowcase = () => {
  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveCategories() {
      try {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          console.info("Supabase not configured, using static data");
          setCategories(staticCategories.slice(0, 3) as unknown as LiveCategory[]);
          setLoading(false);
          return;
        }

        // 1. Fetch categories (Checking for BOTH singular and plural slugs)
        const { data, error } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            slug,
            products ( image_url )
          `)
          .in('slug', ['earring', 'earrings', 'necklace', 'necklaces', 'bracelet', 'bracelets']) 
          .order('name', { ascending: true });

        if (error) throw error;

        console.log("Supabase Categories Data:", data); // Helpful for debugging!

        if (data && data.length > 0) {
          // 2. Format the data and assign the correct cover images
          const formattedCategories: LiveCategory[] = data.map((cat: any) => {
            let coverImage = "";

            // --- CUSTOM CATEGORY IMAGE LOGIC ---
            if (cat.slug === 'necklace' || cat.slug === 'necklaces') {
              coverImage = "https://evsasggscybkayavrxmw.supabase.co/storage/v1/object/public/product-images/necklace/0.36013557480999037.jpeg";
            }
            else if (cat.slug === 'earring' || cat.slug === 'earrings') {
              coverImage = cat.products.length > 0 ? cat.products[0].image_url : "https://evsasggscybkayavrxmw.supabase.co/storage/v1/object/public/product-images/earring/earring2.jpg";
            }
            else if (cat.slug === 'bracelet' || cat.slug === 'bracelets') {
              coverImage = cat.products.length > 0 ? cat.products[0].image_url : "https://evsasggscybkayavrxmw.supabase.co/storage/v1/object/public/product-images/bracelet/bracelet1.jpg";
            }
            else if (cat.products.length > 0 && cat.products[0].image_url) {
              // Default fallback: grab the first product image
              coverImage = cat.products[0].image_url;
            } else {
              // Final fallback if totally empty
              coverImage = "https://placehold.co/400x600/e2e8f0/64748b?text=Coming+Soon";
            }

            return {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              count: cat.products.length,
              image: coverImage
            };
          });

          // Show maximum of 3 categories on the homepage
          setCategories(formattedCategories.slice(0, 3));
        } else {
          // Fallback if Supabase connects but finds 0 matching categories
          console.warn("Supabase returned empty array, falling back to static data.");
          setCategories(staticCategories.slice(0, 3) as unknown as LiveCategory[]);
        }
      } catch (error) {
        console.error("Error fetching categories, using static data:", error);
        // Fallback to static data on actual error
        setCategories(staticCategories.slice(0, 3) as unknown as LiveCategory[]);
      } finally {
        setLoading(false); // Turn off the skeleton loader once data arrives
      }
    }

    fetchLiveCategories();
  }, []);

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-6">

        {/* --- SECTION HEADER - Compact --- */}
        <div className="text-center mb-6 md:mb-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[0.25em] text-rose-500 uppercase mb-2 block"
          >
            Collections
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-2xl md:text-4xl text-gray-900 tracking-wide"
          >
            Shop by Category
          </motion.h2>
        </div>

        {loading ? (
          // --- LOADING SKELETON (Shows while waiting for database) ---
          <div className="flex justify-center py-12">
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-full aspect-[3/4] bg-gray-100 rounded-sm hidden md:block"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* --- MOBILE VIEW: "Instagram Story" style circles --- */}
            <div className="flex md:hidden gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x justify-center">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center flex-shrink-0 snap-center group"
                >
                  {/* Circle Image Wrapper */}
                  <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-rose-200 to-transparent group-hover:from-rose-500 group-hover:to-rose-300 transition-all duration-300">
                    <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  {/* Category Name below circle */}
                  <span className="mt-3 text-xs font-medium text-gray-800 tracking-wide text-center">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* --- DESKTOP VIEW: 3-Column Grid - Compact --- */}
            <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="w-full"
                >
                  <Link to={`/category/${cat.slug}`} className="group flex flex-col cursor-pointer w-full">
                    
                    {/* Image Container with fixed aspect ratio */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-100 mb-5 w-full">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Hover "View Collection" Button */}
                      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out flex justify-center">
                        <button className="bg-white/95 backdrop-blur-sm text-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-colors w-full justify-center cursor-pointer">
                          View Collection <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Text Details below image */}
                    <div className="text-center mt-auto">
                      <h3 className="font-serif text-2xl text-gray-900 group-hover:text-rose-600 transition-colors duration-300">
                        {cat.name}
                      </h3>
                      <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest font-medium">
                        {cat.count} Products
                      </p>
                    </div>

                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CategoryShowcase;