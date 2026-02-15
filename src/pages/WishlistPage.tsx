import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext"; // 1. Import Hook

const WishlistPage = () => {
  // 2. Get Real Data from Global State
  const { wishlistItems, toggleWishlist, addToCart } = useCart();

  // 3. Helper to move item to cart and remove from wishlist
  const handleMoveToCart = (item: any) => {
    addToCart(item);
    toggleWishlist(item);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-10 lg:py-16">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Your Wishlist</h1>
          <p className="text-gray-500 text-sm">
            {wishlistItems.length} items saved for later
          </p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {wishlistItems.map((item) => (
              <div key={item.id} className="group relative border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                
                {/* Remove Button */}
                <button 
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-gray-400 hover:text-red-500 z-20 transition-colors"
                  title="Remove from Wishlist"
                >
                  <Trash2 size={16} />
                </button>

                {/* Image */}
                <Link to={`/product/${item.id}`} className="block relative aspect-[3/4] bg-gray-50 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {item.badge && (
                    <span className="absolute top-3 left-3 bg-white/90 text-[10px] font-bold px-2 py-1 uppercase tracking-wider text-rose-600 rounded-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-gray-900 text-sm">₹{item.price.toLocaleString()}</span>
                    {item.originalPrice && (
                      <span className="text-gray-400 text-xs line-through">₹{item.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-rose-600 text-white text-xs font-bold uppercase py-3 rounded hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-rose-300">
                <Trash2 size={24} />
             </div>
             <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
             <p className="text-gray-500 text-sm mb-6">Save items you love here for later.</p>
             <Link to="/" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose-700 transition-colors">
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