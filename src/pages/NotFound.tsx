import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Mock Trending Products Data
const trendingProducts = [
  { id: 1, name: "Diamond Solitaire Ring", price: "₹25,999", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80" },
  { id: 2, name: "Kundan Bridal Choker", price: "₹12,999", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&q=80" },
  { id: 3, name: "Gold Plated Jhumkas", price: "₹8,499", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80" },
  { id: 4, name: "Crystal Charm Bracelet", price: "₹2,199", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80" },
];

const NotFound: React.FC = () => {
  // 1. Create a reference for the absolute top of this page
  const topRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 2. Force the browser to snap to this specific div instantly
    const scrollToTop = () => {
      topRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      // Fallbacks just in case it is the window scrolling
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    };

    // Fire immediately
    scrollToTop();
    
    // Fire again slightly after React Router finishes rendering
    const timeoutId = setTimeout(scrollToTop, 50);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {/* 3. Place the invisible anchor at the absolute top */}
      <div ref={topRef} className="absolute top-0 left-0 w-full h-0 pointer-events-none" aria-hidden="true" />
      
      <div className="min-h-screen flex flex-col bg-[#FCFCFC] font-sans text-gray-900">
        <Navbar />

        <main className="flex-grow flex flex-col items-center pt-20 pb-24 px-6">
          
          {/* --- TOP SECTION: Luxury "Coming Soon" Message --- */}
          <div className="max-w-2xl w-full text-center mb-16">
            
            <div className="mb-6">
              <span className="text-[10px] font-bold tracking-[0.3em] text-rose-600 uppercase">
                Coming Soon
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 tracking-wide">
              Artistry Takes Time.
            </h1>

            {/* Minimalist Divider */}
            <div className="w-12 h-[1px] bg-gray-300 mx-auto mb-8"></div>

            <p className="text-gray-500 text-sm md:text-base mb-10 max-w-md mx-auto leading-relaxed">
              The collection you are looking for is currently being perfected by our artisans and will be unveiled soon. In the meantime, continue your journey to discover our current masterpieces.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/" 
                className="w-full sm:w-64 flex items-center justify-center bg-rose-600 text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
              >
                Return Home
              </Link>
              
              <Link 
                to="/category/new" 
                className="w-full sm:w-64 flex items-center justify-center bg-transparent border-2 border-rose-100 text-rose-600 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-rose-50 hover:border-rose-200 transition-all"
              >
                Shop New Arrivals
              </Link>
            </div>
          </div>

          {/* --- BOTTOM SECTION: Trending Products --- */}
          <div className="max-w-5xl w-full border-t border-gray-100 pt-12">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-serif text-gray-900 mb-2 tracking-wide">Discover More</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
                Trending beautifully right now
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <div key={product.id} className="bg-white group overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[4/5] overflow-hidden relative bg-gray-50">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
                      <Link to={`/category/rings`} className="w-full bg-white/95 backdrop-blur-sm text-gray-900 py-3 font-bold uppercase tracking-[0.15em] text-[9px] hover:bg-rose-600 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-lg">
                        <ShoppingBag size={14} strokeWidth={1.5} /> View Details
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 text-center">
                    <h3 className="text-xs font-semibold text-gray-800 mb-1.5 truncate tracking-wide">{product.name}</h3>
                    <p className="text-rose-600 font-bold text-xs">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default NotFound;