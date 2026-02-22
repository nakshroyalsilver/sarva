import { useState } from "react";
import { useLocation, Navigate, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, MapPin, Truck, CreditCard, Lock, Gift, Tag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [showGiftMessage, setShowGiftMessage] = useState(false);

  // Determine items: Either from "Buy Now" (state) or Global Cart
  const checkoutItems = state?.directPurchase 
    ? [state.directPurchase] 
    : cartItems;

  // Redirect if nothing to checkout
  if (!checkoutItems || checkoutItems.length === 0) {
    return <Navigate to="/cart" />;
  }

  // Calculations for Price Breakdown (Giva Style)
  const subtotal = checkoutItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
  const totalMRP = checkoutItems.reduce((acc: number, item: any) => acc + ((item.originalPrice || item.price) * item.qty), 0);
  const totalDiscount = totalMRP - subtotal;
  
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleBack = () => {
    if (state?.directPurchase) {
      navigate(-1);
    } else {
      navigate("/cart");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC] font-sans">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10 max-w-6xl">
        
        {/* Checkout Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <button onClick={handleBack} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
               <ArrowLeft size={20} />
             </button>
             <h1 className="font-serif text-2xl text-gray-900 tracking-wide">Checkout</h1>
          </div>
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} /> 100% Secure
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* --- LEFT COLUMN: FORMS --- */}
          <div className="lg:w-[60%] space-y-8">
            
            {/* 1. Contact Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="relative">
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Mobile Number</label>
                    <input type="tel" placeholder="10-digit mobile number" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 transition-colors bg-transparent" />
                </div>
                <div className="relative">
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Email Address</label>
                    <input type="email" placeholder="For order updates" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 transition-colors bg-transparent" />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Shipping Address
              </h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <input type="text" placeholder="First Name *" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                  <input type="text" placeholder="Last Name *" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                </div>
                <input type="text" placeholder="Flat No, House, Building *" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                <input type="text" placeholder="Street, Area, Colony *" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <input type="text" placeholder="Pincode *" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                  <input type="text" placeholder="City *" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                  <input type="text" placeholder="State *" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                </div>
                
                {/* Gifting Option (Giva Style) */}
                <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" checked={showGiftMessage} onChange={() => setShowGiftMessage(!showGiftMessage)} className="rounded text-rose-600 focus:ring-rose-500" />
                        <span className="text-sm text-gray-700 font-medium flex items-center gap-1"><Gift size={16} className="text-rose-500"/> Add a gift message?</span>
                    </label>
                    {showGiftMessage && (
                        <textarea placeholder="Type your message here (max 200 chars)..." className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-rose-500 outline-none h-24 resize-none" maxLength={200}></textarea>
                    )}
                </div>
              </div>
            </div>

            {/* 3. Payment Placeholder */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 opacity-60 pointer-events-none">
              <h2 className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-2 flex items-center gap-3">
                <span className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Payment
              </h2>
              <p className="text-xs text-gray-400 ml-9">Select your payment method after saving address</p>
            </div>

          </div>

          {/* --- RIGHT COLUMN: SUMMARY --- */}
          <div className="lg:w-[40%]">
            <div className="sticky top-28 space-y-6">
                
                {/* Product Card */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-serif text-lg text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {checkoutItems.map((item: any, idx: number) => (
                      <div key={`${item.id}-${idx}`} className="flex gap-4 items-start">
                        <div className="w-16 h-20 bg-gray-50 rounded overflow-hidden shrink-0 border border-gray-100">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                             <span>Size: {item.size}</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full" />
                             <span>Qty: {item.qty}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-sm font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                             {item.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">₹{(item.originalPrice * item.qty).toLocaleString()}</span>
                             )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupons */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-rose-200 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Tag size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Apply Coupon</p>
                            <p className="text-xs text-gray-500 group-hover:text-rose-600 transition-colors">Login to see best offers</p>
                        </div>
                    </div>
                    <ArrowLeft size={16} className="rotate-180 text-gray-400" />
                </div>

                {/* Price Details */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Price Details</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Total MRP</span>
                            <span>₹{totalMRP.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Discount on MRP</span>
                            <span>- ₹{totalDiscount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span className="text-green-600 font-medium">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                        </div>
                        <div className="h-px bg-dashed border-t border-dashed border-gray-200 my-2" />
                        <div className="flex justify-between font-bold text-gray-900 text-base">
                            <span>Total Amount</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-rose-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2">
                    Proceed to Pay
                </button>

                {/* Trust Markers */}
                <div className="flex items-center justify-center gap-4 opacity-40 grayscale pb-4">
                    <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" className="h-5" alt="Visa" />
                    <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" className="h-5" alt="Mastercard" />
                    <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" className="h-5" alt="PayPal" />
                    <img src="https://cdn-icons-png.flaticon.com/512/5968/5968269.png" className="h-5" alt="UPI" />
                </div>

            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;