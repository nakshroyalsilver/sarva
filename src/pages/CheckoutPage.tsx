import { useState } from "react";
import { useLocation, Navigate, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, CreditCard, Gift, Check, Banknote, ShoppingBag, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { supabase } from "../../supabase"; 

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  
  // 1: Contact, 2: Shipping, 3: Payment
  const [activeStep, setActiveStep] = useState(1);
  
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "" });
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "", lastName: "", flat: "", street: "", pincode: "", city: "", state: ""
  });
  
  const [showGiftMessage, setShowGiftMessage] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  // Processing & Success States
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const checkoutItems = state?.directPurchase 
    ? [state.directPurchase] 
    : cartItems;

  if (!checkoutItems || checkoutItems.length === 0) {
    return <Navigate to="/cart" />;
  }

  const subtotal = checkoutItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
  const totalMRP = checkoutItems.reduce((acc: number, item: any) => acc + ((item.originalPrice || item.price) * item.qty), 0);
  const totalDiscount = totalMRP - subtotal;
  
  const codCharge = paymentMethod === "cod" ? 50 : 0;
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping + codCharge;

  const handleBack = () => {
    if (state?.directPurchase) navigate(-1);
    else navigate("/cart");
  };

  const handleContinueToShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactInfo.phone.length === 10 && contactInfo.email.includes("@")) {
      setActiveStep(2);
    } else {
      alert("Please enter a valid 10-digit phone number and email.");
    }
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingInfo.firstName && shippingInfo.pincode && shippingInfo.flat) {
      setActiveStep(3);
    } else {
      alert("Please fill in all required shipping fields.");
    }
  };

  // --- NEW: RELATIONAL DATABASE SAVING LOGIC ---
  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Step 1: Insert the main Order record
      const orderPayload = {
        total_amount: total,
        status: paymentMethod === 'online' ? 'Pending Payment' : 'Processing', // Fits your schema's default
        customer_phone: `+91${contactInfo.phone}`,
        customer_email: contactInfo.email,
        shipping_address: shippingInfo,
        subtotal: subtotal,
        discount: totalDiscount,
        shipping_fee: shipping,
        cod_charge: codCharge,
        payment_method: paymentMethod,
        gift_message: showGiftMessage ? giftMessage : null,
        // Note: user_id is left null here assuming guest checkout. 
        // If logged in, you would add: user_id: currentUser.id
      };

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id') // We strictly need the new ID returned to us
        .single();

      if (orderError) throw orderError;

      // Step 2: Map cart items to match your 'order_items' table schema
      const orderItemsPayload = checkoutItems.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.id, // Must be a valid UUID from your products table
        quantity: item.qty,
        price_at_purchase: item.price,
        size: item.size || null // Uses the new size column we added
      }));

      // Step 3: Insert all items into the 'order_items' table
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // Step 4: Clear Cart & Show Success
      if (!state?.directPurchase) {
        localStorage.removeItem("sarvaa_cart");
      }
      setOrderSuccess(true);

    } catch (error: any) {
      console.error("Order error:", error);
      alert("Failed to place order. Please try again or check your cart items.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC] font-sans relative">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10 max-w-6xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer">
               <ArrowLeft size={20} />
             </button>
             <h1 className="font-serif text-2xl text-gray-900 tracking-wide">Secure Checkout</h1>
          </div>
          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border border-green-100">
            <ShieldCheck size={14} /> 100% Safe
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* LEFT COLUMN: FORMS */}
          <div className="lg:w-[55%] space-y-4">
            
            {/* STEP 1: CONTACT INFO */}
            <div className={`bg-white rounded-xl border transition-colors ${activeStep === 1 ? "border-rose-200 shadow-sm" : "border-gray-100"}`}>
              <button onClick={() => activeStep > 1 && setActiveStep(1)} className="w-full flex items-center justify-between p-6 cursor-pointer">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-3">
                  {activeStep > 1 ? (
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"><Check size={12} strokeWidth={3} /></div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 1 ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-400"}`}>1</div>
                  )}
                  Contact Information
                </h2>
                {activeStep > 1 && <span className="text-xs text-rose-600 font-medium underline">Edit</span>}
              </button>

              <AnimatePresence>
                {activeStep === 1 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <form onSubmit={handleContinueToShipping} className="p-6 pt-0 border-t border-gray-50">
                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Mobile Number *</label>
                            <div className="flex items-center border-b border-gray-300 focus-within:border-rose-500 transition-colors">
                              <span className="text-sm font-medium text-gray-600 pr-3 border-r border-gray-200 mr-3 py-2 bg-transparent select-none">
                                +91
                              </span>
                              <input 
                                type="tel" 
                                required
                                maxLength={10}
                                value={contactInfo.phone}
                                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value.replace(/\D/g, '')})}
                                placeholder="10-digit number" 
                                className="w-full py-2 text-sm outline-none bg-transparent" 
                              />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Email Address *</label>
                            <input type="email" required value={contactInfo.email} onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} placeholder="For order updates" className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 transition-colors bg-transparent" />
                        </div>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <button type="submit" disabled={contactInfo.phone.length !== 10 || !contactInfo.email} className="bg-gray-900 text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer">Continue to Shipping</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 2: SHIPPING ADDRESS */}
            <div className={`bg-white rounded-xl border transition-colors ${activeStep === 2 ? "border-rose-200 shadow-sm" : "border-gray-100"} ${activeStep < 2 ? "opacity-60" : ""}`}>
              <button onClick={() => activeStep > 2 && setActiveStep(2)} disabled={activeStep < 2} className={`w-full flex items-center justify-between p-6 ${activeStep >= 2 ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-3">
                  {activeStep > 2 ? (
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"><Check size={12} strokeWidth={3} /></div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 2 ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-400"}`}>2</div>
                  )}
                  Delivery Address
                </h2>
                {activeStep > 2 && <span className="text-xs text-rose-600 font-medium underline">Edit</span>}
              </button>

              <AnimatePresence>
                {activeStep === 2 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <form onSubmit={handleContinueToPayment} className="p-6 pt-0 border-t border-gray-50">
                      <div className="space-y-6 mt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="relative">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">First Name *</label>
                            <input required type="text" value={shippingInfo.firstName} onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                          </div>
                          <div className="relative">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Last Name</label>
                            <input type="text" value={shippingInfo.lastName} onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                          </div>
                        </div>
                        <div className="relative">
                          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Flat No, House, Building *</label>
                          <input required type="text" value={shippingInfo.flat} onChange={(e) => setShippingInfo({...shippingInfo, flat: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                        </div>
                        <div className="relative">
                          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Street, Area, Colony *</label>
                          <input required type="text" value={shippingInfo.street} onChange={(e) => setShippingInfo({...shippingInfo, street: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          <div className="relative">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Pincode *</label>
                            <input required type="text" maxLength={6} value={shippingInfo.pincode} onChange={(e) => setShippingInfo({...shippingInfo, pincode: e.target.value.replace(/\D/g, '')})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                          </div>
                          <div className="relative">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">City *</label>
                            <input required type="text" value={shippingInfo.city} onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                          </div>
                          <div className="relative col-span-2 md:col-span-1">
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">State *</label>
                            <input required type="text" value={shippingInfo.state} onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                          </div>
                        </div>
                        
                        <div className="pt-4 pb-2 border-t border-gray-50">
                            <label className="flex items-center gap-2 cursor-pointer mb-3">
                                <input type="checkbox" checked={showGiftMessage} onChange={() => setShowGiftMessage(!showGiftMessage)} className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer" />
                                <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5"><Gift size={16} className="text-rose-500"/> Is this a gift?</span>
                            </label>
                            <AnimatePresence>
                              {showGiftMessage && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <textarea placeholder="Type your gift message here (max 200 chars). We will print it on a beautiful card." value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm focus:border-rose-500 outline-none h-24 resize-none mt-2" maxLength={200} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                        </div>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors cursor-pointer">Continue to Payment</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 3: PAYMENT METHOD */}
            <div className={`bg-white rounded-xl border transition-colors ${activeStep === 3 ? "border-rose-200 shadow-sm" : "border-gray-100"} ${activeStep < 3 ? "opacity-60" : ""}`}>
              <div className="w-full flex items-center p-6">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 3 ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-400"}`}>3</div>
                  Payment Method
                </h2>
              </div>
              
              <AnimatePresence>
                {activeStep === 3 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                    <div className="p-6 pt-0 border-t border-gray-50">
                      
                      <div className="space-y-3 mt-2">
                        <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-rose-600 bg-rose-50/50' : 'border-gray-200 hover:border-rose-200'}`}>
                          <div className="flex items-start gap-3">
                            <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer" />
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><CreditCard size={18} className="text-gray-500" /> UPI / Cards / Wallets</h3>
                              <p className="text-xs text-gray-500 mt-1">Pay securely online. Recommended.</p>
                            </div>
                          </div>
                        </label>

                        <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-rose-600 bg-rose-50/50' : 'border-gray-200 hover:border-rose-200'}`}>
                          <div className="flex items-start gap-3">
                            <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer" />
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Banknote size={18} className="text-gray-500" /> Cash on Delivery (COD)</h3>
                              <p className="text-xs text-gray-500 mt-1">Pay with cash or UPI at your doorstep.</p>
                              {paymentMethod === 'cod' && <p className="text-xs font-semibold text-rose-600 mt-2">Extra ₹50 handling charge applies.</p>}
                            </div>
                          </div>
                        </label>
                      </div>

                      <button 
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="w-full mt-8 bg-rose-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : (paymentMethod === 'online' ? `Pay ₹${total.toLocaleString()} Securely` : 'Place Order')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:w-[45%]">
            <div className="sticky top-28 space-y-6">
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-serif text-lg text-gray-900 mb-6 pb-4 border-b border-gray-50 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-rose-600" /> Order Summary
                  </h3>
                  <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {checkoutItems.map((item: any, idx: number) => (
                      <div key={`${item.id}-${idx}`} className="flex gap-4 items-start">
                        <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                             <span>Size: {item.size}</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full" />
                             <span>Qty: {item.qty}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-sm font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                             {item.originalPrice && <span className="text-xs text-gray-400 line-through">₹{(item.originalPrice * item.qty).toLocaleString()}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Price Details</h3>
                    <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Total MRP</span>
                            <span>₹{totalMRP.toLocaleString()}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                              <span>Discount on MRP</span>
                              <span>- ₹{totalDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span className="text-green-600 font-medium">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                        </div>
                        {codCharge > 0 && (
                          <div className="flex justify-between text-rose-600">
                              <span>COD Handling Fee</span>
                              <span>₹{codCharge}</span>
                          </div>
                        )}
                        <div className="h-px bg-dashed border-t border-dashed border-gray-200 my-4" />
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-base">Total Amount</span>
                              <span className="text-[10px] text-gray-400 font-medium">Inclusive of VAT/GST</span>
                            </div>
                            <span className="font-bold text-gray-900 text-xl">₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

            </div>
          </div>

        </div>
      </main>

      {/* --- SUCCESS POPUP MODAL --- */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-sm text-gray-500 mb-8">
                Thank you, {shippingInfo.firstName}. Your order has been placed successfully. We have sent the details to {contactInfo.email}.
              </p>
              <button 
                onClick={handleFinish}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;