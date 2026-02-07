import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShieldCheck, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { products } from "@/data/products";
import { ShoppingBag } from "lucide-react";

const CartPage = () => {
  // Mock Cart Data
  const [cartItems, setCartItems] = useState([
    { ...products[0], qty: 1, size: '7' },
    { ...products[1], qty: 2, size: 'M' },
  ]);

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

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discount = 500; // Mock discount
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
        <h1 className="font-serif text-2xl md:text-3xl text-gray-900 mb-8">Shopping Cart ({cartItems.length})</h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left: Cart Items */}
            <div className="lg:w-2/3 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 md:gap-6">
                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link to={`/product/${item.id}`}>
                           <h3 className="font-medium text-gray-900 text-sm md:text-base hover:text-rose-600 transition-colors">{item.name}</h3>
                        </Link>
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 capitalize">Category: {item.category} | Size: {item.size}</p>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Qty Control */}
                      <div className="flex items-center border border-gray-200 rounded">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-gray-50 text-gray-600"><Minus size={14} /></button>
                        <span className="w-8 text-center text-xs font-medium">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-gray-50 text-gray-600"><Plus size={14} /></button>
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

            {/* Right: Order Summary */}
            <div className="lg:w-1/3">
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
                  <span className="font-bold text-gray-900 text-base">Total Amount</span>
                  <span className="font-bold text-gray-900 text-lg">₹{total.toLocaleString()}</span>
                </div>

                <button className="w-full bg-rose-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2">
                  Checkout <ArrowRight size={16} />
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 py-2 rounded">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span>Safe & Secure Checkout</span>
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