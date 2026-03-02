import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, Check, Bell } from "lucide-react";
import { useCart } from "@/context/CartContext"; 
import { supabase } from "../../supabase";

const ProductCard = ({ product }: { product: any }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  
  const [isAdded, setIsAdded] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

  const currentStock = product.stock_quantity !== undefined && product.stock_quantity !== null 
    ? Number(product.stock_quantity) 
    : 10; 
    
  const isOutOfStock = currentStock <= 0;

  // NEW: Check on load if this item was already waitlisted by the user
  useEffect(() => {
    const waitlistedItems = JSON.parse(localStorage.getItem("waitlistedProducts") || "[]");
    if (waitlistedItems.includes(product.id)) {
      setIsNotified(true);
    }
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) return; 

    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleNotifyMe = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple clicks if already notified
    if (isNotified) return;

    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      alert("Please log in to join the waitlist.");
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    const { error } = await supabase.from('waitlist').insert([{
      product_id: product.id,
      product_name: product.title || product.name,
      customer_name: user.name,
      customer_phone: user.phone || user.email || 'N/A'
    }]);

    if (!error) {
      setIsNotified(true);
      
      // NEW: Save to localStorage so it permanently stays "Waitlisted" across reloads
      const waitlistedItems = JSON.parse(localStorage.getItem("waitlistedProducts") || "[]");
      if (!waitlistedItems.includes(product.id)) {
        waitlistedItems.push(product.id);
        localStorage.setItem("waitlistedProducts", JSON.stringify(waitlistedItems));
      }
    } else {
      alert("Failed to join waitlist. Please try again.");
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <motion.div 
        className="group relative cursor-pointer h-full flex flex-col"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden mb-3 border border-transparent group-hover:border-gray-100 transition-colors">
          
          {isOutOfStock ? (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10 rounded-sm shadow-sm bg-red-50 text-red-600 border border-red-100">
              Out of Stock
            </span>
          ) : product.badge ? (
            <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10 rounded-sm shadow-sm ${
              product.badge === 'Best Seller' ? 'bg-amber-100 text-amber-800' : 'bg-white text-rose-600'
            }`}>
              {product.badge}
            </span>
          ) : null}

          <button 
            onClick={handleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all z-20 shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-2 lg:group-hover:translate-x-0 duration-300 ${
              isInWishlist 
                ? "bg-rose-50 text-rose-600" 
                : "bg-white/90 text-gray-400 hover:text-rose-500 hover:bg-white"
            }`}
          >
            <Heart size={16} className={isInWishlist ? "fill-rose-600" : ""} />
          </button>

          <img 
            src={product.image} 
            alt={product.name} 
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-80 grayscale-[20%]' : ''}`}
            loading="lazy"
          />
          
          <div className="absolute inset-x-0 bottom-0 p-3 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 z-20">
            {isOutOfStock ? (
              <button 
                onClick={handleNotifyMe}
                disabled={isNotified} // DISABLED ONCE CLICKED
                className={`w-full text-xs font-bold uppercase py-2.5 rounded transition-all shadow-lg border flex items-center justify-center gap-2 ${
                  isNotified 
                    ? "bg-green-600 text-white border-green-600 cursor-default" // Locks to Green
                    : "bg-stone-900 text-white hover:bg-stone-800 border-stone-900 cursor-pointer"
                }`}
              >
                {isNotified ? <>Waitlisted <Check size={14} /></> : <><Bell size={14} /> Notify Me</>}
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                className={`w-full text-xs font-bold uppercase py-2.5 rounded transition-all shadow-lg border flex items-center justify-center gap-2 ${
                  isAdded 
                    ? "bg-green-600 text-white border-green-600" 
                    : "bg-white text-gray-900 hover:bg-rose-600 hover:text-white border-gray-200"
                }`}
              >
                {isAdded ? <>Added <Check size={14} /></> : "Add to Cart"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1 px-1">
          <div className="flex items-center gap-1">
             <div className="flex">
               {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className={`${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
               ))}
             </div>
             <span className="text-[10px] text-gray-400 font-medium ml-1">({product.reviews})</span>
          </div>
          <h3 className="font-serif text-gray-900 text-sm group-hover:text-rose-600 transition-colors truncate">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className={`font-bold text-sm ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>₹{product.price.toLocaleString()}</span>
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

export default ProductCard;