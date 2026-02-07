import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Heart, Star, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { products } from "@/data/products"; // Ensure this path is correct
import Navbar from "../components/layout/Navbar"; // Ensure this path is correct
import Footer from "../components/layout/Footer"; // Ensure this path is correct

const CategoryPage = () => {
  const { slug } = useParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("recommended");
  
  // Filter Logic
  const categoryProducts = products.filter(
    (p) => p.category === slug || slug === "all" || slug === "new-arrivals"
  );
  
  const displayProducts = categoryProducts.length < 4 
    ? [...categoryProducts, ...categoryProducts] 
    : categoryProducts;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* 1. Navbar Integration */}
      <Navbar />

      <main className="flex-grow pt-4 pb-20">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 lg:px-6 mb-6">
          <div className="text-[11px] text-gray-500 mb-6 uppercase tracking-widest font-medium">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link> 
            <span className="mx-2 text-gray-300">/</span> 
            <span className="text-gray-900 capitalize font-semibold">{slug?.replace("-", " ")}</span>
          </div>

          {/* Banner / Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-5xl text-gray-900 capitalize mb-3">
                {slug === "new-arrivals" ? "New Arrivals" : slug}
              </h1>
              <p className="text-gray-500 text-sm max-w-2xl leading-relaxed font-light">
                Discover our handcrafted {slug} collection. Each piece is made with 925 Sterling Silver, 
                designed to catch the light and your heart.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 flex gap-10 items-start relative mt-8">
          
          {/* 2. Sticky Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-8 pb-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Filters</h3>
                <button className="text-[10px] text-rose-600 underline cursor-pointer hover:text-rose-700">Clear All</button>
              </div>

              <FilterSection title="Price">
                {["Under ₹1000", "₹1000 - ₹2500", "₹2500 - ₹5000", "Above ₹5000"].map((range) => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group py-1">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="peer appearance-none w-4 h-4 border border-gray-300 rounded-[3px] checked:bg-rose-500 checked:border-rose-500 transition-all" />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{range}</span>
                  </label>
                ))}
              </FilterSection>

              <div className="h-px bg-gray-100" />

              <FilterSection title="Material">
                {["925 Sterling Silver", "Rose Gold Plated", "Oxidized Silver", "Gold Plated"].map((mat) => (
                  <label key={mat} className="flex items-center gap-3 cursor-pointer group py-1">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="peer appearance-none w-4 h-4 border border-gray-300 rounded-[3px] checked:bg-rose-500 checked:border-rose-500 transition-all" />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{mat}</span>
                  </label>
                ))}
              </FilterSection>

              <div className="h-px bg-gray-100" />
              
              <FilterSection title="Occasion">
                {["Daily Wear", "Office Wear", "Party", "Wedding", "Gifting"].map((occ) => (
                  <label key={occ} className="flex items-center gap-3 cursor-pointer group py-1">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="peer appearance-none w-4 h-4 border border-gray-300 rounded-[3px] checked:bg-rose-500 checked:border-rose-500 transition-all" />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-rose-600 transition-colors">{occ}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* 3. Product Grid Area */}
          <div className="flex-1">
            
            {/* Desktop Sort Bar */}
            <div className="hidden lg:flex justify-between items-center mb-6">
               <span className="text-sm text-gray-400">{displayProducts.length} Products Found</span>
               <div className="flex items-center gap-3">
                 <span className="text-sm text-gray-500">Sort by:</span>
                 <div className="relative">
                    <select 
                      className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:text-rose-600 transition-colors pr-4 py-1"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                 </div>
               </div>
            </div>

            {/* THE GRID */}
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-8 lg:gap-y-12">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No products found in this category.</p>
                <Link to="/" className="text-rose-600 font-medium hover:underline border border-rose-600 px-6 py-2 rounded-full hover:bg-rose-600 hover:text-white transition-all">Go back home</Link>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 4. Footer Integration */}
      <Footer />

      {/* 5. Mobile Sticky Bottom Bar (Giva Style) */}
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

      {/* 6. Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-[60] shadow-2xl overflow-y-auto lg:hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-serif text-xl text-gray-900">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-8 pb-24">
                 <FilterSection title="Price">
                    {["Under ₹1000", "₹1000 - ₹2500", "Above ₹5000"].map((range) => (
                      <label key={range} className="flex items-center gap-3 py-1">
                        <input type="checkbox" className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500" />
                        <span className="text-gray-700">{range}</span>
                      </label>
                    ))}
                 </FilterSection>
                 <div className="h-px bg-gray-100" />
                 <FilterSection title="Material">
                    {["Silver", "Rose Gold", "Oxidized"].map((m) => (
                      <label key={m} className="flex items-center gap-3 py-1">
                        <input type="checkbox" className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500" />
                        <span className="text-gray-700">{m}</span>
                      </label>
                    ))}
                 </FilterSection>
              </div>
              
              {/* Drawer Bottom Action */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white safe-area-pb">
                 <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-rose-600 text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-200"
                 >
                   Show {displayProducts.length} Products
                 </button>
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
    <h3 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wider">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

// ==========================================
// 3. Updated Giva-Style Product Card
// ==========================================
const ProductCard = ({ product }: { product: any }) => {
  return (
    // FIX: WRAPPED IN LINK TO NAVIGATE TO PRODUCT PAGE
    <Link to={`/product/${product.id}`} className="block">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="group relative cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden mb-3 border border-transparent group-hover:border-gray-100 transition-colors">
          
          {/* Badges */}
          {product.badge && (
            <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10 rounded-sm shadow-sm ${
              product.badge === 'Best Seller' ? 'bg-amber-100 text-amber-800' : 'bg-white text-rose-600'
            }`}>
              {product.badge}
            </span>
          )}

          {/* Wishlist Button - Prevent default so it doesn't trigger Link navigation */}
          <button 
            onClick={(e) => {
              e.preventDefault(); 
              // Add Wishlist Logic Here
            }}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-gray-400 hover:text-rose-500 hover:bg-white transition-all z-20 shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-2 lg:group-hover:translate-x-0 duration-300"
          >
            <Heart size={16} />
          </button>

          {/* Main Image */}
          <img 
            src={product.image} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
          
          {/* Quick View Overlay (Giva style) */}
          <div className="absolute inset-x-0 bottom-0 p-3 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 z-20 flex flex-col gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault(); 
                // Add Cart Logic Here
              }}
              className="w-full bg-white text-gray-900 text-xs font-bold uppercase py-2.5 rounded hover:bg-rose-600 hover:text-white transition-colors shadow-lg border border-gray-200"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-1.5 px-1">
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className={`${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium ml-1">({product.reviews})</span>
          </div>
          
          <h3 className="font-medium text-gray-900 text-sm group-hover:text-rose-600 transition-colors truncate">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-900 text-sm">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="text-gray-400 text-xs line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default CategoryPage;