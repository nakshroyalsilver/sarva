import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShieldCheck, ArrowRight, Gift, Tag, Star, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { products } from "@/data/products";

const CartPage = () => {
  // Mock Cart Data
  const [cartItems, setCartItems] = useState([
    { ...products[0], qty: 1, size: '7' },
    { ...products[1], qty: 2, size: 'M' },
  ]);

  // Section 1: "You Might Also Like" (First 4 items not in cart)
  const suggestedProducts = products.filter(
    (p) => !cartItems.find((c) => c.id === p.id)
  ).slice(0, 4);

  // Section 2: "Trending Now" (Next 4 items)
  const trendingProducts = products.filter(
    (p) => !cartItems.find((c) => c.id === p.id)
  ).slice(4, 8);

  const updateQty = (id: string, delta: number) => {
    setCartItems(items => items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (product: any) => {
    // Check if item exists
    const exists = cartItems.find((item) => item.id === product.id);
    if (exists) {
      updateQty(product.id, 1);
    } else {
      setCartItems([...cartItems, { ...product, qty: 1, size: 'Standard' }]);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discount = 500; 
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9] font-sans">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
        <h1 className="font-serif text-2xl md:text-3xl text-gray-900 mb-8">Shopping Cart ({cartItems.length})</h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* --- LEFT COLUMN: ITEMS & SUGGESTIONS --- */}
            <div className="lg:w-2/3 space-y-8">
              
              {/* 1. Cart Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:gap-6 transition-shadow hover:shadow-md">
                    {/* Image */}
                    <Link to={`/product/${item.id}`} className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 relative group">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    
                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link to={`/product/${item.id}`}>
                             <h3 className="font-medium text-gray-900 text-sm md:text-base hover:text-rose-600 transition-colors line-clamp-2">{item.name}</h3>
                          </Link>
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 capitalize">Category: {item.category} • Size: {item.size}</p>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        {/* Qty Control */}
                        <div className="flex items-center border border-gray-200 rounded-md bg-white">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-l-md"><Minus size={14} /></button>
                          <span className="w-8 text-center text-xs font-semibold">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-r-md"><Plus size={14} /></button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                           <span className="block font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                           {item.originalPrice && (
                             <span className="text-xs text-gray-400 line-through">₹{(item.originalPrice * item.qty).toLocaleString()}</span>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. "You Might Also Like" (Cross-Sell) */}
              <div className="pt-8 border-t border-gray-200">
                <h2 className="font-serif text-xl text-gray-900 mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {suggestedProducts.map((p) => (
                    <div key={p.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                      <Link to={`/product/${p.id}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
                        <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        {p.badge && <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded text-rose-600 uppercase tracking-wider">{p.badge}</span>}
                      </Link>
                      
                      <div className="p-3 flex flex-col flex-grow">
                        <h4 className="text-xs font-medium text-gray-900 truncate mb-1">{p.name}</h4>
                        <div className="flex items-center gap-1 mb-3">
                          <span className="text-sm font-bold text-gray-900">₹{p.price.toLocaleString()}</span>
                          {p.originalPrice && <span className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</span>}
                        </div>
                        
                        {/* THE NEW EASY "ADD" BUTTON */}
                        <button 
                          onClick={() => addToCart(p)}
                          className="w-full mt-auto bg-white border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. "Trending Now" (Additional Upsell) */}
              {trendingProducts.length > 0 && (
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl text-gray-900">Trending Now</h2>
                    <Link to="/category/new" className="text-xs font-bold text-rose-600 hover:underline uppercase tracking-wider">View All</Link>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {trendingProducts.map((p) => (
                      <div key={p.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                        <Link to={`/product/${p.id}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
                          <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </Link>
                        
                        <div className="p-3 flex flex-col flex-grow">
                          <h4 className="text-xs font-medium text-gray-900 truncate mb-1">{p.name}</h4>
                          <div className="flex items-center gap-1 mb-3">
                            <span className="text-sm font-bold text-gray-900">₹{p.price.toLocaleString()}</span>
                            {p.originalPrice && <span className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</span>}
                          </div>
                          
                          {/* THE NEW EASY "ADD" BUTTON */}
                          <button 
                            onClick={() => addToCart(p)}
                            className="w-full mt-auto bg-gray-900 text-white hover:bg-gray-700 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* --- RIGHT COLUMN: SUMMARY --- */}
            <div className="lg:w-1/3 space-y-6">
              
              {/* Coupons & Gifts */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4">
                 <button className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-rose-600 group">
                    <div className="flex items-center gap-2">
                       <Tag size={16} className="text-rose-500" />
                       <span>Apply Coupon</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-rose-600" />
                 </button>
                 <div className="h-px bg-gray-50" />
                 <button className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-rose-600 group">
                    <div className="flex items-center gap-2">
                       <Gift size={16} className="text-rose-500" />
                       <span>Add Gift Message</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-rose-600" />
                 </button>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-28">
                <h2 className="font-serif text-lg text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `₹${shipping}`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-base">Total Amount</span>
                    <span className="text-[10px] text-gray-400">(Inclusive of all taxes)</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xl">₹{total.toLocaleString()}</span>
                </div>

                <button className="w-full bg-rose-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2">
                  Checkout <ArrowRight size={16} />
                </button>

                {/* Trust Badges in Summary */}
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 py-2 rounded">
                    <ShieldCheck size={12} className="text-green-600" />
                    <span>100% Secure</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 py-2 rounded">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>Top Rated</span>
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