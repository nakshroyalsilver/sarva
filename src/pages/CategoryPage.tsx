import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, SlidersHorizontal, ArrowUpDown, X, Frown } from "lucide-react";
import Navbar from "@/components/layout/Navbar"; 
import Footer from "@/components/layout/Footer"; 
import ProductCard from "@/components/ProductCard";
import { supabase } from "../../supabase";

const PRICE_RANGES = ["Under ₹1000", "₹1000 - ₹2500", "₹2500 - ₹5000", "Above ₹5000"];
const MATERIAL_OPTIONS = ["925 Sterling Silver", "Rose Gold Plated", "Oxidized Silver", "Gold Plated"];

const CategoryPage = () => {
  const { slug } = useParams();
  
  // UI State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  
  // Filter & Sort State
  const [sortOption, setSortOption] = useState("recommended");
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  // 1. Fetch the raw data ONCE when the category changes
  useEffect(() => {
    async function fetchLiveCatalog() {
      setLoading(true);
      try {
        // Fetch base data sorted by newest by default
        let query = supabase.from('products').select('*, categories(name, slug)').order('created_at', { ascending: false });

        if (slug === 'new') {
          setCategoryName('New Arrivals');
          query = query.eq('is_new_arrival', true);
        } else if (slug && slug !== 'all') {
          const { data: catData } = await supabase.from('categories').select('id, name').eq('slug', slug).single();
          if (catData) {
            setCategoryName(catData.name);
            query = query.eq('category_id', catData.id);
          }
        } else {
          setCategoryName('All Collections');
        }

        const { data: prodData, error } = await query;
        if (error) throw error;

        if (prodData) {
          const formattedProducts = prodData.map(p => ({
            ...p,
            name: p.title, 
            image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
            price: p.price || 0, 
            category: p.categories?.name || 'Uncategorized'
          }));
          setRawProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Error fetching live catalog:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveCatalog();
    // Reset filters when changing pages
    setSelectedPrices([]);
    setSortOption("recommended");
    window.scrollTo(0, 0);
  }, [slug]);

  // 2. Instant Frontend Filtering & Sorting
  const displayedProducts = useMemo(() => {
    let result = [...rawProducts];

    // Filter by Price
    if (selectedPrices.length > 0) {
      result = result.filter(product => {
        return selectedPrices.some(range => {
          if (range === "Under ₹1000") return product.price < 1000;
          if (range === "₹1000 - ₹2500") return product.price >= 1000 && product.price <= 2500;
          if (range === "₹2500 - ₹5000") return product.price > 2500 && product.price <= 5000;
          if (range === "Above ₹5000") return product.price > 5000;
          return false;
        });
      });
    }

    // Sort Results
    if (sortOption === "price_low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price_high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [rawProducts, selectedPrices, sortOption]);

  // 3. Handlers
  const togglePriceFilter = (range: string) => {
    setSelectedPrices(prev => 
      prev.includes(range) ? prev.filter(p => p !== range) : [...prev, range]
    );
  };

  const clearAllFilters = () => {
    setSelectedPrices([]);
  };

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

          <div className="border-b border-stone-200 pb-8 md:pb-12 mb-4 mt-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 capitalize tracking-tight mb-4">
                  {loading ? "Loading Collection..." : categoryName}
                </h1>
                <p className="text-stone-500 text-sm md:text-base font-light leading-relaxed">
                  {loading 
                    ? "Curating our finest pieces for you..." 
                    : `Explore our exclusive collection of ${categoryName.toLowerCase()}, crafted with precision and timeless elegance.`}
                </p>
              </div>
              
              {!loading && (
                <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0">
                  <span className="hidden md:block w-12 h-px bg-stone-300"></span>
                  <span className="inline-flex items-center justify-center text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-stone-500 bg-stone-50 px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                    {displayedProducts.length} {displayedProducts.length === 1 ? 'Piece' : 'Pieces'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 flex gap-8 items-start relative mt-4 md:mt-6">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-8 pb-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Filters</h3>
                {selectedPrices.length > 0 && (
                  <button onClick={clearAllFilters} className="text-[10px] text-rose-600 underline cursor-pointer hover:text-rose-700">Clear All</button>
                )}
              </div>

              <FilterSection title="Price">
                {PRICE_RANGES.map((range) => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input 
                      type="checkbox" 
                      checked={selectedPrices.includes(range)}
                      onChange={() => togglePriceFilter(range)}
                      className="w-4 h-4 rounded border-gray-300 text-rose-600 accent-rose-600 focus:ring-rose-500 cursor-pointer" 
                    />
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{range}</span>
                  </label>
                ))}
              </FilterSection>
              
              <div className="h-px bg-gray-100" />
              
              {/* MATERIAL PLACEHOLDER */}
              <FilterSection title="Material">
                {MATERIAL_OPTIONS.map((mat) => (
                  <label key={mat} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-rose-600 accent-rose-600 focus:ring-rose-500 cursor-pointer" />
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{mat}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* PRODUCT GRID */}
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
            ) : displayedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Frown size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No products found matching your filters.</p>
                {selectedPrices.length > 0 ? (
                  <button onClick={clearAllFilters} className="text-rose-600 font-bold text-sm underline cursor-pointer">Clear Filters</button>
                ) : (
                  <Link to="/" className="text-rose-600 font-bold text-sm underline">Back Home</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
        <button 
          onClick={() => setIsMobileFilterOpen(true)} 
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-r border-gray-100 active:bg-gray-50 relative"
        >
          {selectedPrices.length > 0 && (
            <span className="absolute top-1 right-[30%] w-2 h-2 bg-rose-600 rounded-full"></span>
          )}
          <SlidersHorizontal size={18} className="text-gray-600" /> 
          Filters
        </button>
        <div className="flex-1 relative flex flex-col items-center justify-center">
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

      {/* MOBILE FILTER MENU */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileFilterOpen(false)} className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-white z-[60] shadow-2xl overflow-y-auto lg:hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-serif text-lg text-gray-900">Filters</h2>
                <div className="flex items-center gap-4">
                  {selectedPrices.length > 0 && (
                    <button onClick={clearAllFilters} className="text-[10px] text-rose-600 underline font-bold uppercase tracking-widest">Clear</button>
                  )}
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 cursor-pointer"><X size={20} /></button>
                </div>
              </div>
              
              <div className="p-6 space-y-8 pb-32">
                 <FilterSection title="Price">
                    {PRICE_RANGES.map((range) => (
                      <label key={range} className="flex items-center gap-3 py-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedPrices.includes(range)}
                          onChange={() => togglePriceFilter(range)}
                          className="w-5 h-5 rounded border-gray-300 text-rose-600 accent-rose-600 focus:ring-rose-500" 
                        />
                        <span className="text-sm text-gray-700">{range}</span>
                      </label>
                    ))}
                 </FilterSection>
                 <div className="h-px bg-gray-100" />
                 
                 {/* MATERIAL PLACEHOLDER */}
                 <FilterSection title="Material">
                    {MATERIAL_OPTIONS.map((m) => (
                      <label key={m} className="flex items-center gap-3 py-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-rose-600 accent-rose-600 focus:ring-rose-500" />
                        <span className="text-sm text-gray-700">{m}</span>
                      </label>
                    ))}
                 </FilterSection>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white pb-[calc(1rem+env(safe-area-inset-bottom))]">
                 <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-rose-600 text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-200 cursor-pointer">Show {displayedProducts.length} Results</button>
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