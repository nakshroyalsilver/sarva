import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShieldCheck, ArrowRight, Gift, Star, ShoppingBag, ChevronDown, Tag, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext"; 
import { supabase } from "../../supabase"; 
import { Helmet } from "react-helmet-async";
import { analytics } from "@/lib/analytics"; 

const CartPage = () => {
  const navigate = useNavigate(); 
  const { cartItems, updateQty, removeFromCart, addToCart } = useCart();

  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  
  const [liveCartStatus, setLiveCartStatus] = useState<Record<string, any>>({});

  
  // Fetch real products from Supabase for "More to Love"
  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_archived', false)
        .limit(8); 
        
      if (!error && data) {
        // Define what the raw data from Supabase looks like
        interface RawSupabaseProduct {
          id: string;
          title?: string;
          name?: string;
          price?: number;
          image_url?: string;
          image_urls?: string[];
          [key: string]: unknown;
        }

        // 1. Filter out items already in the cart
        const filtered = data
          .filter((p: RawSupabaseProduct) => !cartItems.find((c: any) => c.id === p.id))
          .slice(0, 4);
        
        // 🚀 2. FIX: Format the data so 'name' and 'image' match what the CartContext expects!
        const formatted = filtered.map((p: RawSupabaseProduct) => ({
          ...p,
          name: p.title || p.name || 'Premium Jewelry Piece',
          image: (p.image_urls && p.image_urls.length > 0) 
            ? p.image_urls[0] 
            : p.image_url || 'https://via.placeholder.com/800'
        }));

        setSuggestedProducts(formatted);
      }
    };
    fetchSuggestions();
  }, [cartItems]);
  

  // --- STRICT CART MATH LOGIC ---
  const subtotal = cartItems.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.qty)), 0);
  
  // Shipping: Free above ₹5000
  const shipping = subtotal >= 5000 ? 0 : 99;
  const amountNeededForFreeShipping = 5000 - subtotal;
  
  const total = subtotal + shipping;

  // Track Cart View for Google Analytics
  useEffect(() => {
    if (cartItems.length > 0) {
      analytics.trackViewCart(total, cartItems);
    }
  }, [cartItems.length, total]); // Added total to dependency array for accuracy

  // 🚀 SMART CHECKOUT VALIDATION
  // Prevents user from going to checkout if they are holding an archived or out-of-stock item
  const hasUnavailableItems = cartItems.some((item: any) => {
    const liveData = liveCartStatus[item.id];
    if (!liveData) return false; // Assume fine until loaded
    return liveData.is_archived || liveData.stock_quantity < item.qty;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9] font-sans">

     <Helmet>
        <title>Shopping Cart | Sarvaa Fine Jewelry</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navbar />
        
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        <h1 className="font-serif text-2xl md:text-3xl text-gray-900 mb-8">Shopping Cart ({cartItems.length})</h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: ITEMS */}
            <div className="lg:w-2/3 space-y-8">
              <div className="space-y-4">
                {cartItems.map((item: any) => {
                  // 🚀 LIVE STATUS CALCULATIONS
                  const liveData = liveCartStatus[item.id];
                  const isArchived = liveData?.is_archived === true;
                  const isOutOfStock = liveData && liveData.stock_quantity < 1;
                  const notEnoughStock = liveData && liveData.stock_quantity > 0 && liveData.stock_quantity < item.qty;
                  
                  const isUnavailable = isArchived || isOutOfStock;

                  return (
                    <div key={`${item.id}-${item.size}`} className={`bg-white p-4 rounded-xl shadow-sm border ${isUnavailable ? 'border-red-100 bg-red-50/20' : 'border-gray-100'} flex gap-4 md:gap-6 transition-shadow hover:shadow-md`}>
                      <Link to={`/product/${item.id}`} className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 relative group">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isUnavailable ? 'grayscale opacity-60' : ''}`} 
                        />
                      </Link>
                      
                      <div className="flex-1 flex flex-col justify-between relative">
                        <div>
                          <div className="flex justify-between items-start">
                            <Link to={`/product/${item.id}`}>
                               <h3 className={`font-medium text-sm md:text-base hover:text-rose-600 transition-colors line-clamp-2 pr-6 ${isUnavailable ? 'text-gray-500' : 'text-gray-900'}`}>
                                 {item.name}
                               </h3>
                            </Link>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 cursor-pointer absolute right-0 top-0 bg-white/80 rounded-full">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 capitalize">Category: {item.category} {item.size ? `• Size: ${item.size}` : ''}</p>
                          
                          {/* 🚀 SMART BADGES FOR ARCHIVED/OOS */}
                          {(isArchived || isOutOfStock) && (
                            <div className="mt-2">
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase tracking-wider">
                                {isArchived ? 'Unavailable' : 'Out of Stock'}
                              </span>
                            </div>
                          )}
                          
                          {notEnoughStock && (
                            <div className="mt-2">
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase tracking-wider flex items-center inline-flex gap-1">
                                <AlertCircle size={10} /> Only {liveData.stock_quantity} left in stock
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-end justify-between mt-4">
                          {!isUnavailable ? (
                            <div className="flex items-center border border-gray-200 rounded-md bg-white">
                              <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-l-md cursor-pointer"><Minus size={14} /></button>
                              <span className="w-8 text-center text-xs font-semibold">{item.qty}</span>
                              <button 
                                onClick={() => {
                                  if (liveData && item.qty >= liveData.stock_quantity) {
                                    alert(`Maximum stock reached. Only ${liveData.stock_quantity} available.`);
                                  } else {
                                    updateQty(item.id, 1);
                                  }
                                }} 
                                className={`p-1.5 rounded-r-md transition-colors ${liveData && item.qty >= liveData.stock_quantity ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-600 cursor-pointer'}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Please Remove</span>
                          )}
                          
                          <div className="text-right">
                             <span className={`block font-bold ${isUnavailable ? 'text-gray-400' : 'text-gray-900'}`}>
                               ₹{(item.price * item.qty).toLocaleString()}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DYNAMIC MORE TO LOVE SECTION */}
              <div className="pt-8 border-t border-gray-200">
                <h2 className="font-serif text-xl text-gray-900 mb-6">More to Love</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {suggestedProducts.map((p: any) => (
                    <div key={p.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                      <Link to={`/product/${p.id}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
                        <img src={p.image || p.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        {p.badge && <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded text-rose-600 uppercase tracking-wider">{p.badge}</span>}
                      </Link>
                      <div className="p-3 flex flex-col flex-grow">
                        <h4 className="text-xs font-medium text-gray-900 truncate mb-1">{p.name || p.title}</h4>
                        <div className="flex items-center gap-1 mb-3">
                          <span className="text-sm font-bold text-gray-900">₹{p.price.toLocaleString()}</span>
                        </div>
                        <button onClick={() => addToCart({...p, qty: 1})} className="w-full mt-auto bg-white border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1 cursor-pointer">
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SUMMARY */}
            <div className="lg:w-1/3 space-y-6">
              
              {/* GIFT MESSAGE */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                 <button onClick={() => setIsGiftOpen(!isGiftOpen)} className="w-full flex items-center justify-between p-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                       <Gift size={16} className="text-rose-500" />
                       <span>Add Gift Message (Free)</span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isGiftOpen ? "rotate-180" : ""}`} />
                 </button>
                 <AnimatePresence>
                   {isGiftOpen && (
                     <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                       <div className="p-4 pt-0">
                         <textarea placeholder="Type your message here... (We will print this on a beautiful card)" maxLength={200} rows={3} value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} className="w-full border border-gray-300 rounded p-3 text-sm outline-none focus:border-rose-500 resize-none" />
                         <div className="flex justify-end mt-1">
                           <span className="text-[10px] text-gray-400">{giftMessage.length}/200</span>
                         </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              {/* DISCOUNT NOTIFIER */}
              <div className="bg-rose-50 rounded-lg p-4 border border-rose-100 flex items-start gap-3">
                <Tag size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Have a discount code?</h4>
                  <p className="text-xs text-gray-600 mt-1">You will be able to enter your coupon code on the next checkout screen.</p>
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-28">
                <h2 className="font-serif text-lg text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
                <div className="space-y-3 text-sm mb-6">
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `₹${shipping}`}</span>
                  </div>

                  {/* FREE SHIPPING PROGRESS TEXT */}
                  {shipping > 0 && (
                    <div className="text-[11px] text-rose-600 text-right mt-1 font-medium">
                      Add ₹{amountNeededForFreeShipping.toLocaleString()} more for FREE shipping
                    </div>
                  )}

                </div>

                <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-base">Total Amount</span>
                    <span className="text-[10px] text-gray-400">(Inclusive of all taxes)</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xl">₹{total.toLocaleString()}</span>
                </div>

                {/* 🚀 CHECKOUT BUTTON: Blocks if an item is archived or OOS */}
                {hasUnavailableItems && (
                  <div className="mb-3 text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-100 text-center font-medium">
                    Please remove unavailable items to proceed to checkout.
                  </div>
                )}
                
                <button 
                  onClick={() => navigate('/checkout')} 
                  disabled={hasUnavailableItems}
                  className={`w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${
                    hasUnavailableItems 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 cursor-pointer'
                  }`}
                >
                  {hasUnavailableItems ? 'Review Cart Items' : <>Checkout <ArrowRight size={16} /></>}
                </button>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 py-2 rounded border border-gray-100">
                    <ShieldCheck size={12} className="text-green-600" />
                    <span>100% Secure</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 py-2 rounded border border-gray-100">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>Secured Shipping</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
               <ShoppingBag size={32} className="text-rose-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose-700 transition-colors">
              Continue Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;