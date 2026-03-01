import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShieldCheck, ArrowRight, Gift, Star, ShoppingBag, ChevronDown, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext"; 
import { supabase } from "../../supabase"; 

const CartPage = () => {
  const navigate = useNavigate(); 
  const { cartItems, updateQty, removeFromCart, addToCart } = useCart();

  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  
  // Dynamic Products from Backend
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  // Fetch real products from Supabase for "More to Love"
  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(8); 
        
      if (!error && data) {
        // Filter out items already in the cart and take the first 4
        const filtered = data.filter((p: any) => !cartItems.find((c) => c.id === p.id)).slice(0, 4);
        setSuggestedProducts(filtered);
      }
    };
    fetchSuggestions();
  }, [cartItems]);

  // --- STRICT CART MATH LOGIC ---
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0);
  
  // Shipping: Free above ₹5000
  const shipping = subtotal >= 5000 ? 0 : 99;
  const amountNeededForFreeShipping = 5000 - subtotal;
  
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9] font-sans">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
        <h1 className="font-serif text-2xl md:text-3xl text-gray-900 mb-8">Shopping Cart ({cartItems.length})</h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: ITEMS */}
            <div className="lg:w-2/3 space-y-8">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:gap-6 transition-shadow hover:shadow-md">
                    <Link to={`/product/${item.id}`} className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 relative group">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link to={`/product/${item.id}`}>
                             <h3 className="font-medium text-gray-900 text-sm md:text-base hover:text-rose-600 transition-colors line-clamp-2">{item.name}</h3>
                          </Link>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 capitalize">Category: {item.category} {item.size ? `• Size: ${item.size}` : ''}</p>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-md bg-white">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-l-md cursor-pointer"><Minus size={14} /></button>
                          <span className="w-8 text-center text-xs font-semibold">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-r-md cursor-pointer"><Plus size={14} /></button>
                        </div>
                        <div className="text-right">
                           <span className="block font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DYNAMIC MORE TO LOVE SECTION */}
              <div className="pt-8 border-t border-gray-200">
                <h2 className="font-serif text-xl text-gray-900 mb-6">More to Love</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {suggestedProducts.map((p) => (
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

                {/* CHECKOUT BUTTON */}
                <button onClick={() => navigate('/checkout')} className="w-full bg-rose-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer">
                  Checkout <ArrowRight size={16} />
                </button>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 py-2 rounded border border-gray-100">
                    <ShieldCheck size={12} className="text-green-600" />
                    <span>100% Secure</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 py-2 rounded border border-gray-100">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>4.8/5 Rated</span>
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