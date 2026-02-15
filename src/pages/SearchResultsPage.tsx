import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, SlidersHorizontal, ArrowUpDown, ChevronDown, Frown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard"; 
import { products } from "@/data/products"; 

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recommended");
  
  // Basic Search Logic
  const allResults = products.filter((p) => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  // Mock Filter Logic (Visual Only for UI)
  const displayProducts = allResults; 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      <main className="flex-grow pt-4 pb-20">
        
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 lg:px-6 mb-6">
          <div className="text-[11px] text-gray-500 mb-4 uppercase tracking-widest font-medium">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link> 
            <span className="mx-2 text-gray-300">/</span> 
            <span className="text-gray-900 font-semibold">Search Results</span>
          </div>

          {/* Header */}
          <div className="border-b border-gray-100 pb-4">
            <h1 className="font-serif text-2xl md:text-3xl text-gray-900">
              Results for "<span className="text-rose-600">{query}</span>"
            </h1>
            <p className="text-xs text-gray-500 mt-2">{displayProducts.length} items found</p>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 flex gap-10 items-start relative mt-6">
          
          {/* --- LEFT SIDEBAR (Desktop Filters) --- */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-8 pb-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Filters</h3>
                <button className="text-[10px] text-rose-600 underline cursor-pointer hover:text-rose-700">Clear All</button>
              </div>

              <FilterSection title="Price">
                {["Under ₹1000", "₹1000 - ₹2500", "₹2500 - ₹5000", "Above ₹5000"].map((range) => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input type="checkbox" className="appearance-none w-4 h-4 border border-gray-300 rounded-[3px] checked:bg-rose-600 checked:border-rose-600 focus:ring-0 transition-all cursor-pointer" />
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{range}</span>
                  </label>
                ))}
              </FilterSection>

              <div className="h-px bg-gray-100" />

              <FilterSection title="Material">
                {["925 Sterling Silver", "Rose Gold Plated", "Oxidized Silver", "Gold Plated"].map((mat) => (
                  <label key={mat} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input type="checkbox" className="appearance-none w-4 h-4 border border-gray-300 rounded-[3px] checked:bg-rose-600 checked:border-rose-600 focus:ring-0 transition-all cursor-pointer" />
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{mat}</span>
                  </label>
                ))}
              </FilterSection>

              <div className="h-px bg-gray-100" />
              
              <FilterSection title="Occasion">
                {["Daily Wear", "Office Wear", "Party", "Wedding", "Gifting"].map((occ) => (
                  <label key={occ} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input type="checkbox" className="appearance-none w-4 h-4 border border-gray-300 rounded-[3px] checked:bg-rose-600 checked:border-rose-600 focus:ring-0 transition-all cursor-pointer" />
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{occ}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1">
            
            {/* Sort Bar (Desktop) */}
            <div className="hidden lg:flex justify-end items-center mb-6">
               <div className="flex items-center gap-3 group cursor-pointer relative">
                 <span className="text-sm text-gray-500">Sort by:</span>
                 <div className="relative">
                    <select 
                      className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:text-rose-600 transition-colors pr-6 py-1 appearance-none"
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

            {/* Product Grid */}
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-rose-300 shadow-sm">
                  <Frown size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">No matches found</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  Try checking your spelling or use more general terms like "Ring" or "Silver".
                </p>
                <Link 
                  to="/" 
                  className="bg-rose-600 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                >
                  Clear Search
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />

      {/* --- MOBILE STICKY BOTTOM BAR --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold text-gray-800 uppercase tracking-widest active:bg-gray-50 border-r border-gray-100"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
        <button 
          className="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold text-gray-800 uppercase tracking-widest active:bg-gray-50"
        >
          <ArrowUpDown size={16} /> Sort
        </button>
      </div>

      {/* --- MOBILE FILTER DRAWER --- */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-white z-[60] shadow-2xl overflow-y-auto lg:hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-serif text-lg text-gray-900">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-8 pb-32">
                 <FilterSection title="Price">
                    {["Under ₹1000", "₹1000 - ₹2500", "Above ₹5000"].map((range) => (
                      <label key={range} className="flex items-center gap-3 py-1.5">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                        <span className="text-sm text-gray-700">{range}</span>
                      </label>
                    ))}
                 </FilterSection>
                 <div className="h-px bg-gray-100" />
                 <FilterSection title="Material">
                    {["Silver", "Rose Gold", "Oxidized"].map((m) => (
                      <label key={m} className="flex items-center gap-3 py-1.5">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                        <span className="text-sm text-gray-700">{m}</span>
                      </label>
                    ))}
                 </FilterSection>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white pb-[calc(1rem+env(safe-area-inset-bottom))]">
                 <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-rose-600 text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-200"
                 >
                   Apply Filters
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Component for Filter Sections
const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h3 className="font-bold text-xs mb-3 text-gray-900 uppercase tracking-widest">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

export default SearchResultsPage;