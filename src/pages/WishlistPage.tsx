import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext"; 
import { Helmet } from "react-helmet-async";
import { supabase } from "../../supabase"; // 🚀 ADDED: Supabase import for live status check

const WishlistPage = () => {
  // 1. Get Real Data from Global State
  const { wishlistItems, toggleWishlist, addToCart } = useCart();

  // 🚀 NEW: Live status tracking for items sitting in the wishlist
  const [liveWishlistStatus, setLiveWishlistStatus] = useState<Record<string, any>>({});

  // 🚀 NEW: Live Stock & Archive Checker
  useEffect(() => {
    const checkLiveStatus = async () => {
      if (wishlistItems.length === 0) {
        setLiveWishlistStatus({});
        return;
      }
      
      const ids = wishlistItems.map((w: any) => w.id);
      const { data, error } = await supabase
        .from('products')
        .select('id, is_archived, stock_quantity')
        .in('id', ids);

      if (!error && data) {
        const statusMap: Record<string, any> = {};
        data.forEach(p => {
          statusMap[p.id] = p;
        });
        setLiveWishlistStatus(statusMap);
      }
    };
    
    checkLiveStatus();
  }, [wishlistItems]);

  // 2. Helper to move item to cart and remove from wishlist
  const handleMoveToCart = (item: any) => {
    addToCart(item);
    toggleWishlist(item);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Helmet>
        <title>Wishlist | Sarvaa Fine Jewelry</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-10 lg:py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Your Wishlist</h1>
          <p className="text-gray-500 text-sm">
            {wishlistItems.length} items saved for later
          </p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {wishlistItems.map((item: any) => {
              
              // 🚀 LIVE STATUS CALCULATIONS
              const liveData = liveWishlistStatus[item.id];
              const isArchived = liveData?.is_archived === true;
              const isOutOfStock = liveData && liveData.stock_quantity < 1;
              const isUnavailable = isArchived || isOutOfStock;

              return (
                <div key={item.id} className={`group relative border rounded-lg overflow-hidden transition-shadow ${isUnavailable ? 'border-red-100 bg-red-50/20' : 'border-gray-100 hover:shadow-lg'}`}>
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-gray-400 hover:text-red-500 z-20 transition-colors shadow-sm"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="block relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isUnavailable ? 'grayscale opacity-60' : ''}`}
                    />
                    
                    {/* 🚀 SMART BADGES */}
                    {isArchived ? (
                      <span className="absolute top-3 left-3 bg-red-50 border border-red-200 text-[10px] font-bold px-2 py-1 uppercase tracking-wider text-red-600 rounded-sm">
                        Unavailable
                      </span>
                    ) : isOutOfStock ? (
                      <span className="absolute top-3 left-3 bg-red-50 border border-red-200 text-[10px] font-bold px-2 py-1 uppercase tracking-wider text-red-600 rounded-sm">
                        Out of Stock
                      </span>
                    ) : item.badge ? (
                      <span className="absolute top-3 left-3 bg-white/90 text-[10px] font-bold px-2 py-1 uppercase tracking-wider text-rose-600 rounded-sm shadow-sm">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>

                  {/* Details */}
                  <div className="p-4 flex flex-col h-full">
                    <h3 className={`font-medium text-sm mb-1 truncate ${isUnavailable ? 'text-gray-500' : 'text-gray-900'}`}>
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`font-bold text-sm ${isUnavailable ? 'text-gray-400' : 'text-gray-900'}`}>
                        ₹{item.price.toLocaleString()}
                      </span>
                      {item.originalPrice && !isUnavailable && (
                        <span className="text-gray-400 text-xs line-through">₹{item.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {/* 🚀 DYNAMIC BUTTON */}
                    <div className="mt-auto">
                      {!isUnavailable ? (
                        <button 
                          onClick={() => handleMoveToCart(item)}
                          className="w-full bg-rose-600 text-white text-xs font-bold uppercase py-3 rounded hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-rose-200 cursor-pointer"
                        >
                          <ShoppingBag size={14} /> Move to Cart
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="w-full bg-gray-200 text-gray-500 text-xs font-bold uppercase py-3 rounded flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100 border-dashed max-w-2xl mx-auto">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-rose-300">
               <Trash2 size={24} />
             </div>
             <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
             <p className="text-gray-500 text-sm mb-6">Save items you love here for later.</p>
             <Link to="/" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
               Start Shopping
             </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;