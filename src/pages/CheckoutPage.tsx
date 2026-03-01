import { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, CreditCard, Gift, Check, Banknote, ShoppingBag, CheckCircle2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { supabase } from "../../supabase"; 
import emailjs from '@emailjs/browser';

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  
  // 1: Contact, 2: Shipping, 3: Payment
  const [activeStep, setActiveStep] = useState(1);
  
  // Default contact
  const [contactInfo, setContactInfo] = useState({ 
    phone: "8780791994", 
    email: "" 
  });

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "", lastName: "", flat: "", street: "", pincode: "", city: "", state: ""
  });
  
  const [showGiftMessage, setShowGiftMessage] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  
  // Default is whatsapp
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "online" | "cod">("whatsapp");

  // Processing & Success States
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");

  // --- AUTO-FILL LOGGED-IN USER DATA ---
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setContactInfo((prev) => ({ 
        ...prev, 
        email: parsedUser.email 
      }));
      setShippingInfo((prev) => ({
        ...prev,
        firstName: parsedUser.name?.split(' ')[0] || "",
        lastName: parsedUser.name?.split(' ').slice(1).join(' ') || ""
      }));
    }
  }, []);

  const checkoutItems = state?.directPurchase 
    ? [state.directPurchase] 
    : cartItems;

  if (!checkoutItems || checkoutItems.length === 0) {
    return <Navigate to="/cart" />;
  }

  const subtotal = checkoutItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
  const totalMRP = checkoutItems.reduce((acc: number, item: any) => acc + ((item.originalPrice || item.price) * item.qty), 0);
  const totalDiscount = totalMRP - subtotal;
  
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

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

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // 1. SAFETY CHECK
      const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      const hasFakeProducts = checkoutItems.some((item: any) => !isValidUUID(item.id));
      if (hasFakeProducts) {
        alert("Wait! You have old test products in your cart. Please go back, clear your cart, and add real products from the live store.");
        setIsProcessing(false);
        return; 
      }

      // Step 2: Insert the main Order record
      const orderPayload = {
        total_amount: total,
        status: 'Pending WhatsApp',
        customer_phone: `+91${contactInfo.phone}`,
        customer_email: contactInfo.email,
        shipping_address: shippingInfo,
        subtotal: subtotal,
        discount: totalDiscount,
        shipping_fee: shipping,
        cod_charge: 0,
        payment_method: paymentMethod,
        gift_message: showGiftMessage ? giftMessage : null,
      };

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Step 3: Map & Insert cart items 
      const orderItemsPayload = checkoutItems.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.id,
        quantity: item.qty,
        price_at_purchase: item.price,
        size: item.size || null 
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
      if (itemsError) throw itemsError;

      // Step 4: Clear Cart
      if (!state?.directPurchase) {
        localStorage.removeItem("sarvaa_cart"); 
      }

      const shortOrderId = newOrder.id.split('-')[0].toUpperCase();

      // --- SEND AUTOMATED EMAILJS RECEIPT ---
      try {
        const orderItemsHtml = checkoutItems.map((item: any) => `
          <table style="width: 100%; border-collapse: collapse">
            <tr style="vertical-align: top">
              <td style="padding: 24px 8px 0 4px; display: inline-block; width: max-content">
                <img style="height: 64px; width: 64px; object-fit: cover; border-radius: 4px;" src="${item.image}" alt="item" />
              </td>
              <td style="padding: 24px 8px 0 8px; width: 100%">
                <div>${item.title || item.name}</div>
                <div style="font-size: 14px; color: #888; padding-top: 4px">
                  QTY: ${item.qty} ${item.size ? `| Size: ${item.size}` : ''}
                </div>
              </td>
              <td style="padding: 24px 4px 0 0; white-space: nowrap">
                <strong>₹${(item.price * item.qty).toLocaleString()}</strong>
              </td>
            </tr>
          </table>
        `).join('');

        const templateParams = {
          to_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          to_email: contactInfo.email,
          order_id: `#${shortOrderId}`,
          order_items_html: orderItemsHtml, 
          subtotal: `₹${subtotal.toLocaleString()}`,
          shipping_fee: shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`,
          order_total: `₹${total.toLocaleString()}`,
        };

        
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID, 
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID, 
          templateParams, 
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        console.log("Confirmation email sent successfully!");
      } catch (emailError) {
        console.error("Failed to send email confirmation:", emailError);
      }

      // --- GENERATE CLEAN WHATSAPP MESSAGE ---
      const whatsappItemList = checkoutItems.map((item: any, index: number) => {
        const productName = item.title || item.name || "Premium Jewelry Piece";
        const sizeInfo = item.size ? ` (Size: ${item.size})` : "";
        return `${index + 1}. *${productName}*${sizeInfo}\n    Qty: ${item.qty} × Rs.${item.price.toLocaleString()} = Rs.${(item.price * item.qty).toLocaleString()}`;
      }).join('\n\n');

      const businessWhatsApp = import.meta.env.VITE_BUSINESS_WHATSAPP;
      const giftSection = showGiftMessage && giftMessage ? `*GIFT MESSAGE:*\n"${giftMessage}"\n\n` : "";

      const rawMessage = `*New Order Request*

Hello Sarvaa Fine Jewelry,
I would like to place an order. Here are my details:

*ORDER ID:* #${shortOrderId}
----------------------------
*ORDER SUMMARY:*

${whatsappItemList}

----------------------------
*Subtotal:* Rs.${subtotal.toLocaleString()}
*Shipping:* ${shipping === 0 ? "FREE" : `Rs.${shipping}`}
*Grand Total:* *Rs.${total.toLocaleString()}*
----------------------------

${giftSection}*CUSTOMER DETAILS:*
*Name:* ${shippingInfo.firstName} ${shippingInfo.lastName}
*Phone:* +91 ${contactInfo.phone}

*DELIVERY ADDRESS:*
${shippingInfo.flat}, ${shippingInfo.street}
${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}

Please let me know how to proceed with the payment. Thank you!`;

      // encodeURIComponent fixes the # bug
      const generatedLink = `https://wa.me/${businessWhatsApp}?text=${encodeURIComponent(rawMessage)}`;
      setWhatsappLink(generatedLink);
      
      setOrderSuccess(true);

      setTimeout(() => {
        window.open(generatedLink, '_blank');
      }, 800);

    } catch (error: any) {
      console.error("Order error:", error);
      alert(`Failed to place order: ${error.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    navigate("/my-orders"); 
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
                              <span className="text-sm font-medium text-gray-600 pr-3 border-r border-gray-200 mr-3 py-2 bg-transparent select-none">+91</span>
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

            {/* SHIPPING ADDRESS */}
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
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer mt-6"><input type="checkbox" checked={showGiftMessage} onChange={() => setShowGiftMessage(!showGiftMessage)} className="text-rose-600 w-4 h-4" /><span className="text-sm font-medium">Is this a gift?</span></label>
                      {showGiftMessage && <textarea placeholder="Gift Message" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm h-20 mt-2" />}
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
                      <div className="space-y-4 mt-2">
                        
                        <label className={`block border rounded-xl p-4 cursor-pointer transition-all border-green-600 bg-green-50/50 shadow-sm relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-bl-lg">Recommended</div>
                          <div className="flex items-start gap-3 pt-1">
                            <input type="radio" checked readOnly className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer" />
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <MessageCircle size={18} className="text-green-600" fill="currentColor" fillOpacity={0.2} /> 
                                Order via WhatsApp
                              </h3>
                              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                                Send your order details directly to our team via WhatsApp to finalize payment securely.
                              </p>
                            </div>
                          </div>
                        </label>

                        <label className={`block border rounded-xl p-4 cursor-not-allowed opacity-60 bg-gray-50 border-gray-200`}>
                          <div className="flex items-start gap-3">
                            <input type="radio" disabled className="mt-1 w-4 h-4 text-gray-400" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2"><CreditCard size={18} /> UPI / Cards / Wallets</h3>
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Direct online payment gateway integration is currently in progress.</p>
                            </div>
                          </div>
                        </label>

                        <label className={`block border rounded-xl p-4 cursor-not-allowed opacity-60 bg-gray-50 border-gray-200`}>
                          <div className="flex items-start gap-3">
                            <input type="radio" disabled className="mt-1 w-4 h-4 text-gray-400" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2"><Banknote size={18} /> Cash on Delivery</h3>
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">COD will be available shortly.</p>
                            </div>
                          </div>
                        </label>

                      </div>

                      <button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full mt-8 bg-green-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                        {isProcessing ? 'Processing Order...' : `Order via WhatsApp (₹${total.toLocaleString()})`}
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
                  <h3 className="font-serif text-lg text-gray-900 mb-6 pb-4 border-b border-gray-50 flex items-center gap-2"><ShoppingBag size={18} className="text-rose-600" /> Order Summary</h3>
                  <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {checkoutItems.map((item: any, idx: number) => (
                      <div key={`${item.id}-${idx}`} className="flex gap-4 items-start">
                        <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100"><img src={item.image} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 pt-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed">{item.title || item.name}</h4>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                             {item.size && (
                               <>
                                 <span>Size: {item.size}</span>
                                 <span className="w-1 h-1 bg-gray-300 rounded-full" />
                               </>
                             )}
                             <span>Qty: {item.qty}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-sm font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Price Details</h3>
                    <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Total MRP</span><span>₹{totalMRP.toLocaleString()}</span></div>
                        {totalDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount on MRP</span><span>- ₹{totalDiscount.toLocaleString()}</span></div>}
                        <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600 font-medium">{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
                        <div className="h-px bg-dashed border-t border-dashed border-gray-200 my-4" />
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col"><span className="font-bold text-gray-900 text-base">Total Amount</span><span className="text-[10px] text-gray-400 font-medium">Inclusive of VAT/GST</span></div>
                            <span className="font-bold text-gray-900 text-xl">₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">Order Initiated!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Thank you, {shippingInfo.firstName}. We have saved your order details. WhatsApp should open automatically to finalize your order.
              </p>
              
              <div className="space-y-3">
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full block py-3.5 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors"
                >
                  Open WhatsApp Manually
                </a>
                <button 
                  onClick={handleFinish} 
                  className="w-full py-3.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Go to My Orders
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default CheckoutPage;