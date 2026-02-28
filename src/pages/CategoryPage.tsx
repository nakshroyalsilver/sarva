import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, SlidersHorizontal, ArrowUpDown, X, Frown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "../../supabase";
import { useSEO } from "@/hooks/useSEO";

const SPECIAL_SLUGS = ['all', 'new', 'new-arrivals'];

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recommended");
  
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveCatalog() {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*, categories(name, slug)');

        if (slug && !SPECIAL_SLUGS.includes(slug)) {
          const { data: catData } = await supabase.from('categories').select('id, name').eq('slug', slug).single();
          if (catData) {
            setCategoryName(catData.name);
            query = query.eq('category_id', catData.id);
          } else {
            // Category slug not found in DB — show Coming Soon
            navigate('/coming-soon', { replace: true });
            return;
          }
        } else {
          setCategoryName(slug === 'new' || slug === 'new-arrivals' ? 'New Arrivals' : 'All Collections');
        }

        // --- APPLIED SORTING LOGIC ---
        if (slug === 'new' || slug === 'new-arrivals') {
          query = query.order('created_at', { ascending: false }).limit(20);
        } else if (sortOption === "newest") {
          query = query.order("created_at", { ascending: false });
        } else if (sortOption === "price_low") {
          query = query.order("price", { ascending: true });
        } else if (sortOption === "price_high") {
          query = query.order("price", { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false }); // Default for 'recommended'
        }

        const { data: prodData, error } = await query;
        if (error) throw error;

        if (prodData) {
          const formattedProducts = prodData.map(p => {
            return {
              ...p,
              name: p.title, 
              // --- CHANGED: Supports new multiple images array, fallback to old single image ---
              image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
              price: p.price || 0, 
              category: p.categories?.name || 'Uncategorized'
            };
          });

          setLiveProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Error fetching live catalog:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveCatalog();
    window.scrollTo(0, 0);
  }, [slug, sortOption]); // <-- Added sortOption to dependency array so it refetches when sort changes

  // SEO: dynamic title + description per category
  const displayName = categoryName || slug || "Silver Jewelry";
  useSEO({
    title: `${displayName} — 925 Sterling Silver`,
    description: `Shop handcrafted 925 Sterling Silver ${displayName.toLowerCase()} online in India. BIS hallmarked, free shipping & 30-day returns. Only at Sarvaa Jewelry.`,
    keywords: `silver ${displayName.toLowerCase()} India, buy silver ${displayName.toLowerCase()} online, 925 sterling silver ${displayName.toLowerCase()}, Sarvaa ${displayName.toLowerCase()}`,
    canonicalPath: `/category/${slug}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${displayName} — Sarvaa Jewelry`,
      "description": `Browse our collection of handcrafted 925 Sterling Silver ${displayName.toLowerCase()} at Sarvaa Jewelry.`,
      "url": `https://sarvaajewelry.com/category/${slug}`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sarvaajewelry.com" },
          { "@type": "ListItem", "position": 2, "name": displayName, "item": `https://sarvaajewelry.com/category/${slug}` }
        ]
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      <main className="flex-grow pt-4 pb-20">
        <div className="container mx-auto px-4 lg:px-6 mb-6">
          <div className="text-[10px] md:text-[11px] text-gray-500 mb-4 md:mb-6 uppercase tracking-widest font-medium flex items-center">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link> 
            <span className="mx-2 text-gray-300">/</span> 
            <span className="text-gray-900 capitalize font-semibold">{loading ? "..." : categoryName}</span>
          </div>

          <div className="border-b border-gray-100 pb-4 md:pb-6">
            <h1 className="font-serif text-2xl md:text-4xl text-gray-900 capitalize mb-2">
              {loading ? "Loading..." : categoryName}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm max-w-2xl font-light">
              {loading ? "Counting designs..." : `${liveProducts.length} Designs Found`}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 flex gap-8 items-start relative mt-4 md:mt-6">
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-8 pb-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Filters</h3>
                <button className="text-[10px] text-rose-600 underline cursor-pointer hover:text-rose-700">Clear All</button>
              </div>

              <FilterSection title="Price">
                {["Under ₹1000", "₹1000 - ₹2500", "₹2500 - ₹5000", "Above ₹5000"].map((range) => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input type="checkbox" className="appearance-none w-4 h-4 border border-gray-300 rounded-[3px] checked:bg-rose-600 checked:border-rose-600 transition-all" />
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{range}</span>
                  </label>
                ))}
              </FilterSection>
              <div className="h-px bg-gray-100" />
              <FilterSection title="Material">
                {["925 Sterling Silver", "Rose Gold Plated", "Oxidized Silver", "Gold Plated"].map((mat) => (
                  <label key={mat} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input type="checkbox" className="appearance-none w-4 h-4 border border-gray-300 rounded-[3px] checked:bg-rose-600 checked:border-rose-600 transition-all" />
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{mat}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          <div className="flex-1 w-full">
            <div className="hidden lg:flex justify-end items-center mb-6">
               <div className="flex items-center gap-3">
                 <span className="text-sm text-gray-500">Sort by:</span>
                 <div className="relative">
                    <select 
                      className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:text-rose-600 transition-colors pr-4 py-1 appearance-none"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                 </div>
               </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i}>
                    <div className="aspect-[3/4] bg-gray-100 mb-4 rounded-sm"></div>
                    <div className="h-4 bg-gray-100 w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : liveProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12">
                {liveProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Frown size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500">No products found in this category.</p>
                <Link to="/" className="mt-4 text-rose-600 font-bold text-sm underline">Back Home</Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
        <button 
          onClick={() => setIsMobileFilterOpen(true)} 
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-r border-gray-100 active:bg-gray-50"
        >
          <SlidersHorizontal size={18} className="text-gray-600" /> 
          Filters
        </button>
        <div className="flex-1 relative flex flex-col items-center justify-center">
           {/* MOBILE SORT DROPDOWN OVERLAY */}
           <select 
             className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
             value={sortOption}
             onChange={(e) => setSortOption(e.target.value)}
           >
             <option value="recommended">Recommended</option>
             <option value="newest">Newest First</option>
             <option value="price_low">Price: Low to High</option>
             <option value="price_high">Price: High to Low</option>
           </select>
           <div className="flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-800 uppercase tracking-widest active:bg-gray-50 pointer-events-none">
             <ArrowUpDown size={18} className="text-gray-600" /> 
             Sort
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileFilterOpen(false)} className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-white z-[60] shadow-2xl overflow-y-auto lg:hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-serif text-lg text-gray-900">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-8 pb-32">
                 <FilterSection title="Price">
                    {["Under ₹1000", "₹1000 - ₹2500", "Above ₹5000"].map((range) => (
                      <label key={range} className="flex items-center gap-3 py-2">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                        <span className="text-sm text-gray-700">{range}</span>
                      </label>
                    ))}
                 </FilterSection>
                 <div className="h-px bg-gray-100" />
                 <FilterSection title="Material">
                    {["Silver", "Rose Gold", "Oxidized"].map((m) => (
                      <label key={m} className="flex items-center gap-3 py-2">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                        <span className="text-sm text-gray-700">{m}</span>
                      </label>
                    ))}
                 </FilterSection>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white pb-[calc(1rem+env(safe-area-inset-bottom))]">
                 <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-rose-600 text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-200">Apply Filters</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h3 className="font-bold text-xs mb-3 text-gray-900 uppercase tracking-widest">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

export default CategoryPage;