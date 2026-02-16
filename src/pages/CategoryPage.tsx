import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, SlidersHorizontal, ArrowUpDown, X, Frown } from "lucide-react";
import { products } from "@/data/products"; 
import Navbar from "@/components/layout/Navbar"; 
import Footer from "@/components/layout/Footer"; 
import ProductCard from "@/components/ProductCard";

const CategoryPage = () => {
  const { slug } = useParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recommended");
  
  // 1. Filter Products based on Category Slug
  const categoryProducts = products.filter(
    (p) => p.category === slug || slug === "all" || slug === "new-arrivals"
  );
  
  // Mock logic to show items (in real app, this changes based on sort/filter)
  const displayProducts = categoryProducts.length < 4 
    ? [...categoryProducts, ...categoryProducts] // Duplicate for demo if few items
    : categoryProducts;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      <main className="flex-grow pt-4 pb-20">
        
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 lg:px-6 mb-6">
          <div className="text-[10px] md:text-[11px] text-gray-500 mb-4 md:mb-6 uppercase tracking-widest font-medium flex items-center">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link> 
            <span className="mx-2 text-gray-300">/</span> 
            <span className="text-gray-900 capitalize font-semibold">{slug?.replace("-", " ")}</span>
          </div>

          {/* Category Banner / Header */}
          <div className="border-b border-gray-100 pb-4 md:pb-6">
            <h1 className="font-serif text-2xl md:text-4xl text-gray-900 capitalize mb-2">
              {slug === "new-arrivals" ? "New Arrivals" : slug}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm max-w-2xl font-light">
              {displayProducts.length} Designs Found
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 flex gap-8 items-start relative mt-4 md:mt-6">
          
          {/* --- DESKTOP SIDEBAR FILTERS (Hidden on Mobile) --- */}
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

          {/* --- PRODUCT GRID --- */}
          <div className="flex-1 w-full">
            
            {/* Desktop Sort Bar (Hidden on Mobile) */}
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

            {/* THE RESPONSIVE GRID */}
            {displayProducts.length > 0 ? (
              // grid-cols-2 (Mobile) -> md:grid-cols-3 (Tablet) -> xl:grid-cols-4 (Large Desktop)
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12">
                {displayProducts.map((product) => (
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

      {/* --- MOBILE BOTTOM BAR (Visible only on Mobile) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
        <button 
          onClick={() => setIsMobileFilterOpen(true)} 
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-r border-gray-100 active:bg-gray-50"
        >
          <SlidersHorizontal size={18} className="text-gray-600" /> 
          Filters
        </button>
        <button 
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-800 uppercase tracking-widest active:bg-gray-50"
        >
          <ArrowUpDown size={18} className="text-gray-600" /> 
          Sort
        </button>
      </div>

      {/* --- MOBILE FILTER DRAWER --- */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileFilterOpen(false)} className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-white z-[60] shadow-2xl overflow-y-auto lg:hidden">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-serif text-lg text-gray-900">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
              </div>
              
              {/* Drawer Content */}
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
              
              {/* Drawer Footer */}
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

// Helper for Sidebar Sections
const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h3 className="font-bold text-xs mb-3 text-gray-900 uppercase tracking-widest">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

export default CategoryPage;