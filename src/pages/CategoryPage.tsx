import { useState, useEffect, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, SlidersHorizontal, ArrowUpDown, X, Frown, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar"; 
import Footer from "@/components/layout/Footer"; 
import ProductCard from "@/components/ProductCard";
import { supabase } from "../../supabase";
import { Helmet } from "react-helmet-async"; 
import { useQuery } from "@tanstack/react-query"; 
import { analytics } from "@/lib/analytics"; // <-- NEW: Analytics Import

const PRICE_RANGES = ["Under ₹1000", "₹1000 - ₹2500", "₹2500 - ₹5000", "Above ₹5000"];
const MATERIAL_OPTIONS = ["925 Sterling Silver", "Rose Gold Plated", "Oxidized Silver", "Gold Plated"];

const CategoryPage = () => {
  const { slug } = useParams();
  
  // UI State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false); 
  
  // Filter & Sort State
  const [sortOption, setSortOption] = useState("recommended");
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]); 

  // 1. TANSTACK QUERY: Fetch Catalog Data & Cache it
  const { data, isLoading } = useQuery({
    queryKey: ['catalog', slug], 
    queryFn: async () => {
      let title = 'All Collections';
      let query = supabase.from('products').select('*, categories(name, slug)').order('created_at', { ascending: false });

      if (slug === 'new') {
        title = 'New Arrivals';
        query = query.eq('is_new_arrival', true);
      } else if (slug && slug !== 'all') {
        const { data: catData } = await supabase.from('categories').select('id, name').eq('slug', slug).single();
        if (catData) {
          title = catData.name;
          query = query.eq('category_id', catData.id);
        }
      }

      const { data: prodData, error } = await query;
      if (error) throw error;

      const formattedProducts = prodData ? prodData.map((p: any) => ({
        ...p,
        name: p.title, 
        image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
        price: p.price || 0, 
        category: p.categories?.name || 'Uncategorized',
        stock_quantity: Number(p.stock_quantity || 0) // Explicitly parse stock for sorting
      })) : [];

      return { categoryName: title, products: formattedProducts };
    },
    staleTime: 1000 * 60 * 5, 
  });

  const rawProducts = data?.products || [];
  const categoryName = data?.categoryName || (slug === 'new' ? 'New Arrivals' : slug === 'all' ? 'All Collections' : '');

  // --- NEW: Track Category View for Google Analytics ---
  useEffect(() => {
    if (rawProducts && rawProducts.length > 0) {
      analytics.trackViewCategory(categoryName, rawProducts);
    }
  }, [rawProducts, categoryName]);

  // Reset filters and scroll to top when the category URL changes
  useEffect(() => {
    setSelectedPrices([]);
    setSelectedMaterials([]);
    setSortOption("recommended");
    window.scrollTo(0, 0);
  }, [slug]);

  // 2. Instant Frontend Filtering & Smart Sorting 
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

    // Filter by Material
    if (selectedMaterials.length > 0) {
      result = result.filter(product => {
        return selectedMaterials.some(mat => 
          mat === "925 Sterling Silver" || 
          product.name?.toLowerCase().includes(mat.toLowerCase()) || 
          product.type?.toLowerCase().includes(mat.toLowerCase()) ||
          product.specifications?.toLowerCase().includes(mat.toLowerCase())
        );
      });
    }

    // --- SMART SORTING LOGIC ---
    result.sort((a, b) => {
      // Step 1: ALWAYS Push Out of Stock items to the bottom
      const aInStock = a.stock_quantity > 0 ? 1 : 0;
      const bInStock = b.stock_quantity > 0 ? 1 : 0;
      
      if (aInStock !== bInStock) {
        return bInStock - aInStock; // In-stock items (1) come before OOS items (0)
      }

      // Step 2: Apply the user's selected sort ONLY among items with the same stock status
      if (sortOption === "price_low") {
        return a.price - b.price;
      } else if (sortOption === "price_high") {
        return b.price - a.price;
      } else if (sortOption === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      return 0; // "Recommended" fallback
    });

    return result;
  }, [rawProducts, selectedPrices, selectedMaterials, sortOption]);

  // Handlers
  const togglePriceFilter = (range: string) => {
    setSelectedPrices(prev => prev.includes(range) ? prev.filter(p => p !== range) : [...prev, range]);
  };

  const toggleMaterialFilter = (mat: string) => {
    setSelectedMaterials(prev => prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]);
  };

  const clearAllFilters = () => {
    setSelectedPrices([]);
    setSelectedMaterials([]); 
  };

  const SORT_OPTIONS = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'newest', label: 'Newest First' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      
      <Helmet>
        <title>{categoryName ? `${categoryName} | Sarvaa Fine Jewelry` : "Collection | Sarvaa Fine Jewelry"}</title>
        <meta name="description" content={`Explore our exclusive collection of ${categoryName ? categoryName.toLowerCase() : 'fine jewelry'}, crafted with precision and timeless elegance.`} />
        <link rel="canonical" href={`https://sarvaajewelry.com/category/${slug || 'all'}`} />
        
        <meta property="og:title" content={categoryName ? `${categoryName} | Sarvaa Fine Jewelry` : "Collection | Sarvaa Fine Jewelry"} />
        <meta property="og:description" content={`Explore our exclusive collection of ${categoryName ? categoryName.toLowerCase() : 'fine jewelry'}.`} />
        <meta property="og:url" content={`https://sarvaajewelry.com/category/${slug || 'all'}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-4 md:pt-6 pb-20">
        <div className="container mx-auto px-4 lg:px-6 mb-6 md:mb-10">
          
          {/* --- BEAUTIFIED ROSE RED TINTED HERO BANNER --- */}
          <div className="relative rounded-2xl overflow-hidden bg-rose-100 min-h-[180px] md:min-h-[220px] flex items-center shadow-sm border border-rose-200">
            
           
           

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10 w-full px-6 md:px-12 py-8 flex flex-col items-start"
            >
              {/* Left Side Breadcrumbs */}
              <div className="flex items-center text-[9px] md:text-[10px] text-rose-800 uppercase tracking-[0.25em] font-bold mb-4">
                <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link> 
                <span className="mx-2 md:mx-3 text-rose-400">/</span> 
                <span className="text-stone-900">{isLoading ? "..." : categoryName}</span>
              </div>

              {/* Main Elegant Title & Description */}
              <div className="max-w-lg text-left">
                <h1 className="font-serif text-3xl md:text-5xl text-stone-950 capitalize tracking-wide mb-3">
                  {isLoading ? "Loading..." : categoryName}
                </h1>

                <p className="text-stone-700 text-xs md:text-sm font-light leading-relaxed mb-6">
                  {isLoading 
                    ? "Curating our finest pieces for you..." 
                    : `Explore our exclusive collection of ${categoryName.toLowerCase()}, crafted with precision and timeless elegance.`}
                </p>

                {/* Chic Product Count Badge */}
                {!isLoading && (
                  <div className="inline-flex items-center justify-center text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-rose-800 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-rose-200">
                    {displayedProducts.length} {displayedProducts.length === 1 ? 'Piece' : 'Pieces'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          {/* --- END HERO BANNER --- */}

        </div>

        <div className="container mx-auto px-4 lg:px-6 flex gap-8 items-start relative">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-8 pb-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Filters</h3>
                {(selectedPrices.length > 0 || selectedMaterials.length > 0) && (
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
              
              <FilterSection title="Material">
                {MATERIAL_OPTIONS.map((mat) => (
                  <label key={mat} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input 
                      type="checkbox" 
                      checked={selectedMaterials.includes(mat)}
                      onChange={() => toggleMaterialFilter(mat)}
                      className="w-4 h-4 rounded border-gray-300 text-rose-600 accent-rose-600 focus:ring-rose-500 cursor-pointer" 
                    />
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{mat}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1 w-full">
            
            {/* DESKTOP SORT */}
            <div className="hidden lg:flex justify-end items-center mb-6">
               <div className="flex items-center gap-3">
                 <span className="text-sm text-gray-500">Sort by:</span>
                 <div className="relative">
                    <select 
                      className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:text-rose-600 transition-colors pr-4 py-1 appearance-none"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      {SORT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                 </div>
               </div>
            </div>

            {isLoading ? (
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center px-4 bg-stone-50/50 rounded-2xl border border-stone-100"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-100 mb-6">
                  <Filter size={24} className="text-stone-300" />
                </div>
                <h2 className="font-serif text-2xl text-stone-900 mb-3">Artistry takes time.</h2>
                <p className="text-stone-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  We are constantly crafting new pieces, but we currently don't have any items that exactly match your selected filters. 
                </p>
                <button 
                  onClick={clearAllFilters} 
                  className="bg-stone-900 text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md cursor-pointer"
                >
                  Clear All Filters
                </button>
              </motion.div>
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
          {(selectedPrices.length > 0 || selectedMaterials.length > 0) && (
            <span className="absolute top-1 right-[30%] w-2 h-2 bg-rose-600 rounded-full"></span>
          )}
          <SlidersHorizontal size={18} className="text-gray-600" /> 
          Filters
        </button>
        
        <button 
          onClick={() => setIsMobileSortOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold text-gray-800 uppercase tracking-widest active:bg-gray-50 relative"
        >
          <ArrowUpDown size={18} className="text-gray-600" /> 
          Sort
        </button>
      </div>

      {/* MOBILE SORT BOTTOM SHEET */}
      <AnimatePresence>
        {isMobileSortOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileSortOpen(false)} 
              className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }} 
              className="fixed inset-x-0 bottom-0 max-h-[60vh] bg-white z-[60] shadow-2xl overflow-y-auto lg:hidden rounded-t-3xl pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))]"
            >
              <div className="px-6 flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl text-gray-900">Sort By</h2>
                <button onClick={() => setIsMobileSortOpen(false)} className="p-2 -mr-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full"><X size={18} /></button>
              </div>
              <div className="px-4 space-y-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSortOption(opt.id);
                      setTimeout(() => setIsMobileSortOpen(false), 200); 
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                      sortOption === opt.id ? 'bg-rose-50 border-rose-100' : 'bg-transparent border-transparent hover:bg-gray-50'
                    } border`}
                  >
                    <span className={`text-sm font-medium ${sortOption === opt.id ? 'text-rose-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                    {sortOption === opt.id && <Check size={18} className="text-rose-600" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE FILTER MENU */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileFilterOpen(false)} className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-white z-[60] shadow-2xl overflow-y-auto lg:hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-serif text-lg text-gray-900">Filters</h2>
                <div className="flex items-center gap-4">
                  {(selectedPrices.length > 0 || selectedMaterials.length > 0) && (
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
                 
                 <FilterSection title="Material">
                    {MATERIAL_OPTIONS.map((m) => (
                      <label key={m} className="flex items-center gap-3 py-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedMaterials.includes(m)}
                          onChange={() => toggleMaterialFilter(m)}
                          className="w-5 h-5 rounded border-gray-300 text-rose-600 accent-rose-600 focus:ring-rose-500" 
                        />
                        <span className="text-sm text-gray-700">{m}</span>
                      </label>
                    ))}
                 </FilterSection>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white pb-[calc(1rem+env(safe-area-bottom))]">
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