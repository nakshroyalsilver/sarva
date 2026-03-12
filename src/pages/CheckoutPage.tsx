import { useState, useEffect, useRef } from "react";
import { useLocation, Navigate, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, CreditCard, Gift, Check, Banknote, ShoppingBag, CheckCircle2, MessageCircle, X, Tag, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { supabase } from "../../supabase"; 
import emailjs from '@emailjs/browser';
import { Helmet } from "react-helmet-async";
import { analytics } from "../lib/analytics";

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const { cartItems, clearCart, removeFromCart } = useCart();

  const currentUser = localStorage.getItem("currentUser");

  // 1. Redirect Guest Users to Login, but save their "Buy Now" item first
  useEffect(() => {
    if (!currentUser) {
      if (state?.directPurchase) {
        localStorage.setItem("pending_direct_purchase", JSON.stringify(state.directPurchase));
      }
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [currentUser, navigate, state]);

  // 2. Recover the "Buy Now" item into STATE so it survives re-renders
  const [directPurchaseData] = useState(() => {
    // If they were already logged in, grab it from the router state
    if (state?.directPurchase) return state.directPurchase;
    
    // If they just came from the Login page, grab it from memory
    const saved = localStorage.getItem("pending_direct_purchase");
    return saved ? JSON.parse(saved) : null;
  });

  // 3. Clean up the temporary storage ONLY AFTER it is safely locked in our state
  useEffect(() => {
    // FIX: Only delete the item if they are actually logged in!
    if (currentUser && localStorage.getItem("pending_direct_purchase")) {
      localStorage.removeItem("pending_direct_purchase");
    }
  }, [currentUser]);

  // --- PERSISTENT CHECKOUT DRAFT LOGIC ---
  const [activeStep, setActiveStep] = useState(() => {
    const saved = localStorage.getItem("checkout_step");
    return saved ? Number(saved) : 1;
  });
  
  //contact info
  const [contactInfo, setContactInfo] = useState(() => {
    // 1. Try to load the saved checkout contact draft
    try {
      const saved = localStorage.getItem("checkout_contact");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* Ignore and move on */ }
    if (currentUser) {
      try {
        const parsedUser = JSON.parse(currentUser);
        return { phone: "", email: parsedUser.email || "" };
      } catch (e) { /* Ignore and move on */ }
    }
    return { phone: "", email: "" };
  });
        
  //Shipping state
  const [shippingInfo, setShippingInfo] = useState(() => {
    try {
      const saved = localStorage.getItem("checkout_shipping");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* Ignore and move on */ }
    try {
      const permanentlySaved = localStorage.getItem("saved_shipping_address");
      if (permanentlySaved) return JSON.parse(permanentlySaved);
    } catch (e) { /* Ignore and move on */ }
    if (currentUser) {
      try { 
        const parsedUser = JSON.parse(currentUser);
        return {
          firstName: parsedUser.name?.split(' ')[0] || "",
          lastName: parsedUser.name?.split(' ').slice(1).join(' ') || "",
          flat: "", street: "", pincode: "", city: "", state: ""
        };
      } catch (e) { /* Ignore and move on */ }
    }
    return { firstName: "", lastName: "", flat: "", street: "", pincode: "", city: "", state: "" };
  });

  // --- BILLING ADDRESS STATE ---
  const [billingInfo, setBillingInfo] = useState(() => {
    // 1. Try to load the saved checkout billing draft
    try {
      const saved = localStorage.getItem("checkout_billing");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* Ignore and move on */ }

    // 2. Try to load any pending saved billing address
    try {
      const pending = localStorage.getItem("pending_save_billing");
      if (pending) return JSON.parse(pending);
    } catch (e) { /* Ignore and move on */ }

    // 3. If EVERYTHING fails, return a safe, empty form!
    return { firstName: "", lastName: "", flat: "", street: "", city: "", state: "", pincode: "" };
  });

  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(() => {
    try {
      const savedSame = localStorage.getItem("pending_billing_same");
      // Check for null specifically, because JSON.parse("false") is valid!
      if (savedSame !== null) return JSON.parse(savedSame); 
    } catch (e) { /* Ignore and fallback */ }
    
    // Default fallback
    return true; 
  });
  
  // --- POPUP STATE ---
  const [showSaveAddressPrompt, setShowSaveAddressPrompt] = useState(false);

  useEffect(() => {
    // This deletes the temporary sticky notes so they don't haunt future orders
    localStorage.removeItem("pending_save_shipping");
    localStorage.removeItem("pending_save_billing");
    localStorage.removeItem("pending_billing_same");
  }, []);

  // Save the applied coupon to local storage
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem("checkout_coupon");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* Ignore and fallback */ }
    return null;
  });

  // Auto-save changes to localStorage as they type
  useEffect(() => { localStorage.setItem("checkout_step", activeStep.toString()); }, [activeStep]);
  useEffect(() => { localStorage.setItem("checkout_contact", JSON.stringify(contactInfo)); }, [contactInfo]);
  useEffect(() => { localStorage.setItem("checkout_shipping", JSON.stringify(shippingInfo)); }, [shippingInfo]);
  useEffect(() => { localStorage.setItem("checkout_billing", JSON.stringify(billingInfo)); }, [billingInfo]);
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("checkout_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("checkout_coupon");
    }
  }, [appliedCoupon]);
  
  const [showGiftMessage, setShowGiftMessage] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "online" | "cod">("whatsapp");

  // Processing & Success States
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Reference to prevent double-firing Google Analytics events
  const hasTrackedCheckout = useRef(false);

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAvailableCoupons(data);
      }
    };
    fetchActiveCoupons();
  }, []);

  // 🚀 Modified to use the recovered direct purchase data
  const checkoutItems = directPurchaseData ? [directPurchaseData] : cartItems;

  
  const subtotal = checkoutItems?.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.qty)), 0) || 0;
  
  useEffect(() => {
    if (appliedCoupon && subtotal < Number(appliedCoupon.min_order_value)) {
      setAppliedCoupon(null);
      setCouponError(`Coupon ${appliedCoupon.code} removed because your total dropped below ₹${appliedCoupon.min_order_value}.`);
    }
  }, [subtotal, appliedCoupon]);

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      couponDiscountAmount = subtotal * (Number(appliedCoupon.discount_value) / 100);
    } else {
      couponDiscountAmount = Number(appliedCoupon.discount_value);
    }
    if (couponDiscountAmount > subtotal) couponDiscountAmount = subtotal;
  }

  const subtotalAfterCoupon = subtotal - couponDiscountAmount;
  const shipping = subtotalAfterCoupon >= 5000 ? 0 : 99; 
  const amountNeededForFreeShipping = 5000 - subtotalAfterCoupon;
  const total = subtotalAfterCoupon + shipping;
  // ==========================================

  // --- NEW: Track Checkout Initiated ---
  useEffect(() => {
    if (checkoutItems && checkoutItems.length > 0 && !hasTrackedCheckout.current) {
      analytics.trackBeginCheckout(total, checkoutItems);
      hasTrackedCheckout.current = true;
    }
  }, [checkoutItems, total]);

  // Early return for unauthenticated users to prevent UI flash during redirect
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCFC]">
        <Loader2 className="animate-spin text-rose-600" size={32} />
      </div>
    );
  }

  if (!checkoutItems || checkoutItems.length === 0) {
    return <Navigate to="/cart" />;
  }

  // --- COUPON HANDLERS ---
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError("");
    
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', couponInput.trim())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setCouponError("Invalid or expired coupon code.");
        setIsApplyingCoupon(false);
        return;
      }

      if (subtotal < Number(data.min_order_value)) {
        setCouponError(`Add ₹${Number(data.min_order_value) - subtotal} more to use this coupon.`);
        setIsApplyingCoupon(false);
        return;
      }

      setAppliedCoupon(data);
      setCouponInput("");
    } catch (err) {
      setCouponError("Error applying coupon. Please try again.");
    }
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // --- AUTO FILL LOCATION ---
  const handleAutoFillLocation = (type: 'shipping' | 'billing') => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
              'User-Agent': 'SarvaaJewelryStore/1.0'
            }
          });
          const data = await res.json();
          
          if (data && data.address) {
            const updatedAddress = {
              street: data.address.road || data.address.suburb || data.address.neighbourhood || "",
              city: data.address.city || data.address.town || data.address.state_district || "",
              state: data.address.state || "",
              pincode: data.address.postcode || "",
            };

            if (type === 'shipping') {
              setShippingInfo(prev => ({ ...prev, ...updatedAddress }));
            } else {
              setBillingInfo(prev => ({ ...prev, ...updatedAddress }));
            }
          }
        } catch (error) {
          console.error("Error fetching location details", error);
          alert("Could not fetch your exact address. Please enter it manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        alert("Please allow location access in your browser settings to use this feature.");
        setIsLocating(false);
      }
    );
  };

  // --- NAVIGATION HANDLERS ---
  const handleBack = () => {
    if (directPurchaseData) navigate(-1);
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
    
    const isShippingValid = shippingInfo.firstName && shippingInfo.pincode && shippingInfo.flat && shippingInfo.street && shippingInfo.city && shippingInfo.state;
    const isBillingValid = isBillingSameAsShipping || (billingInfo.firstName && billingInfo.pincode && billingInfo.flat && billingInfo.street && billingInfo.city && billingInfo.state);

    if (isShippingValid && isBillingValid) {
      const alreadySaved = localStorage.getItem("saved_shipping_address");
      
      if (!alreadySaved) {
        setShowSaveAddressPrompt(true);
      } else {
        setActiveStep(3);
      }
    } else {
      alert("Please fill in all required address fields.");
    }
  };

  const handleSaveAddressChoice = (save: boolean) => {
    if (save) {
      // User is guaranteed logged in now, safe to save permanently
      localStorage.setItem("saved_shipping_address", JSON.stringify(shippingInfo));
    }
    setShowSaveAddressPrompt(false);
    setActiveStep(3); 
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      const hasFakeProducts = checkoutItems.some((item: any) => !isValidUUID(item.id));
      if (hasFakeProducts) {
        alert("Wait! You have old test products in your cart. Please go back, clear your cart, and add real products from the live store.");
        setIsProcessing(false);
        return; 
      }

      // 🚀 THE FINAL GATEKEEPER FIX
      for (const item of checkoutItems) {
        const { data: stockCheck, error: stockError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();

        if (stockError || !stockCheck || stockCheck.stock_quantity < item.qty) {
          alert(`Oh no! Another customer just bought the last "${item.title || item.name}". It is now out of stock.`);
          setIsProcessing(false);
          
          removeFromCart(item.id);
          navigate('/cart');
          return; 
        }
      }

      const finalBillingAddress = isBillingSameAsShipping ? shippingInfo : billingInfo;

      // --- SILENTLY EXTRACT THE UUID ---
      let userUUID = null;
      try {
        const freshData = localStorage.getItem("currentUser");
        if (freshData) {
          const parsedData = JSON.parse(freshData);
          userUUID = parsedData.id || parsedData.user_id || null;
        }
      } catch (e) {
        console.error("Parse error", e);
      }

      const { data: newOrderId, error: rpcError } = await supabase.rpc('place_order', {
        p_user_id: userUUID, 
        p_total_amount: total,
        p_status: 'Pending WhatsApp',
        p_customer_phone: `+91${contactInfo.phone}`,
        p_customer_email: contactInfo.email,
        p_shipping_address: shippingInfo,
        p_billing_address: finalBillingAddress,
        p_subtotal: subtotal,
        p_discount: couponDiscountAmount,
        p_coupon_code: appliedCoupon ? appliedCoupon.code : null,
        p_shipping_fee: shipping,
        p_cod_charge: 0,
        p_payment_method: paymentMethod,
        p_gift_message: showGiftMessage ? giftMessage : null,
        p_items: checkoutItems.map((item: any) => ({
          product_id: item.id,
          quantity: Number(item.qty),
          price_at_purchase: Number(item.price),
          size: item.size || null
        }))
      });

      if (rpcError) {
        if (rpcError.message.includes('OUT_OF_STOCK')) {
              throw new Error("Just missed it! Another customer bought the last piece a second ago. Please review your cart.");
        }
        throw rpcError;
      }

      analytics.trackWhatsAppOrder(newOrderId, total);

      //  THE SILENT CLEANUP FIX (Updated to use directPurchaseData)
      if (directPurchaseData) {
        const itemWasInCart = cartItems.find((item: any) => item.id === directPurchaseData.id);
        if (itemWasInCart) {
          removeFromCart(directPurchaseData.id); 
        }
      } else {
        clearCart();
      }

      // Cleanup local drafts
      localStorage.removeItem("checkout_contact");
      localStorage.removeItem("checkout_shipping"); 
      localStorage.removeItem("checkout_billing");
      localStorage.removeItem("checkout_step");
      localStorage.removeItem("checkout_coupon");

      const shortOrderId = newOrderId.split('-')[0].toUpperCase();

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

        const emailCouponRow = appliedCoupon ? `
        <tr>
          <td style="width: 60%"></td>
          <td>Coupon (${appliedCoupon.code})</td>
          <td style="padding: 8px; white-space: nowrap; color: #16a34a;">- ₹${couponDiscountAmount.toLocaleString()}</td>
        </tr>
        ` : '';

        const templateParams = {
          to_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          to_email: contactInfo.email,
          order_id: `#${shortOrderId}`,
          order_items_html: orderItemsHtml + emailCouponRow, 
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
      } catch (emailError) {
        console.error("Failed to send email confirmation:", emailError);
      }

      // --- GENERATE CLEAN WHATSAPP MESSAGE ---
      const whatsappItemList = checkoutItems.map((item: any, index: number) => {
        const productName = item.title || item.name || "Premium Jewelry Piece";
        const sizeInfo = item.size ? ` (Size: ${item.size})` : "";
        return `${index + 1}. *${productName}*${sizeInfo}\n   Qty: ${item.qty} × Rs.${item.price.toLocaleString()} = Rs.${(item.price * item.qty).toLocaleString()}`;
      }).join('\n\n');

      const businessWhatsApp = import.meta.env.VITE_BUSINESS_WHATSAPP;
      const giftSection = showGiftMessage && giftMessage ? `*GIFT MESSAGE:*\n"${giftMessage}"\n\n` : "";
      
      const whatsappCouponLine = appliedCoupon ? `*Coupon (${appliedCoupon.code}):* -Rs.${couponDiscountAmount.toLocaleString()}\n` : "";

      const rawMessage = `*New Order Request*

Hello Sarvaa Fine Jewelry,
I would like to place an order. Here are my details:

*ORDER ID:* #${shortOrderId}
----------------------------
*ORDER SUMMARY:*

${whatsappItemList}

----------------------------
*Subtotal:* Rs.${subtotal.toLocaleString()}
${whatsappCouponLine}*Shipping:* ${shipping === 0 ? "FREE" : `Rs.${shipping}`}
*Grand Total:* *Rs.${total.toLocaleString()}*
----------------------------

${giftSection}*CUSTOMER DETAILS:*
*Name:* ${shippingInfo.firstName} ${shippingInfo.lastName}
*Phone:* +91 ${contactInfo.phone}

*DELIVERY ADDRESS:*
${shippingInfo.flat}, ${shippingInfo.street}
${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}

*BILLING ADDRESS:*
${isBillingSameAsShipping ? "Same as Delivery" : `${billingInfo.flat}, ${billingInfo.street}\n${billingInfo.city}, ${billingInfo.state} - ${billingInfo.pincode}`}

Please let me know how to proceed with the payment. Thank you!`;

      const generatedLink = `https://wa.me/${businessWhatsApp}?text=${encodeURIComponent(rawMessage)}`;
      setWhatsappLink(generatedLink);
      
      setOrderSuccess(true);

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
      
      <Helmet>
        <title>Checkout Page | Sarvaa Fine Jewelry</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

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
                        <button type="submit" disabled={contactInfo.phone.length !== 10 || !contactInfo.email} className="bg-gray-900 text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer">Continue to Addresses</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 2: SHIPPING & BILLING ADDRESSES */}
            <div className={`bg-white rounded-xl border transition-colors ${activeStep === 2 ? "border-rose-200 shadow-sm" : "border-gray-100"} ${activeStep < 2 ? "opacity-60" : ""}`}>
              <button onClick={() => activeStep > 2 && setActiveStep(2)} disabled={activeStep < 2} className={`w-full flex items-center justify-between p-6 ${activeStep >= 2 ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-3">
                  {activeStep > 2 ? (
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center"><Check size={12} strokeWidth={3} /></div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 2 ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-400"}`}>2</div>
                  )}
                  Addresses
                </h2>
                {activeStep > 2 && <span className="text-xs text-rose-600 font-medium underline">Edit</span>}
              </button>

              <AnimatePresence>
                {activeStep === 2 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <form onSubmit={handleContinueToPayment} className="p-6 pt-0 border-t border-gray-50">
                      
                      {/* --- SHIPPING ADDRESS SECTION --- */}
                      <div className="flex items-center justify-between mt-4 mb-4">
                        <h3 className="font-serif text-lg text-gray-900">Shipping Address</h3>
                        <button 
                          type="button" 
                          onClick={() => handleAutoFillLocation('shipping')}
                          className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
                        >
                          {isLocating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                          Auto-fill Location
                        </button>
                      </div>

                      <div className="space-y-6">
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

                      <div className="h-px bg-gray-100 my-8" />

                      {/* --- BILLING ADDRESS SECTION --- */}
                      <h3 className="font-serif text-lg text-gray-900 mb-4">Billing Address</h3>
                      
                      <label className="flex items-center gap-3 cursor-pointer mb-6 border p-4 rounded-xl bg-gray-50/50 border-gray-200">
                        <input 
                          type="checkbox" 
                          checked={isBillingSameAsShipping} 
                          onChange={(e) => setIsBillingSameAsShipping(e.target.checked)} 
                          className="w-4 h-4 text-rose-600 accent-rose-600 cursor-pointer" 
                        />
                        <span className="text-sm font-medium text-gray-800">Same as Shipping Address</span>
                      </label>

                      <AnimatePresence>
                        {!isBillingSameAsShipping && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-6 overflow-hidden">
                            <div className="flex justify-end">
                              <button 
                                type="button" 
                                onClick={() => handleAutoFillLocation('billing')}
                                className="text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
                              >
                                {isLocating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                                Auto-fill Location
                              </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="relative">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">First Name *</label>
                                <input required={!isBillingSameAsShipping} type="text" value={billingInfo.firstName} onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                              </div>
                              <div className="relative">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Last Name</label>
                                <input type="text" value={billingInfo.lastName} onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                              </div>
                            </div>
                            <div className="relative">
                              <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Flat No, House, Building *</label>
                              <input required={!isBillingSameAsShipping} type="text" value={billingInfo.flat} onChange={(e) => setBillingInfo({...billingInfo, flat: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                            </div>
                            <div className="relative">
                              <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Street, Area, Colony *</label>
                              <input required={!isBillingSameAsShipping} type="text" value={billingInfo.street} onChange={(e) => setBillingInfo({...billingInfo, street: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              <div className="relative">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Pincode *</label>
                                <input required={!isBillingSameAsShipping} type="text" maxLength={6} value={billingInfo.pincode} onChange={(e) => setBillingInfo({...billingInfo, pincode: e.target.value.replace(/\D/g, '')})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                              </div>
                              <div className="relative">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">City *</label>
                                <input required={!isBillingSameAsShipping} type="text" value={billingInfo.city} onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                              </div>
                              <div className="relative col-span-2 md:col-span-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">State *</label>
                                <input required={!isBillingSameAsShipping} type="text" value={billingInfo.state} onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})} className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-rose-500 bg-transparent" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="h-px bg-gray-100 my-8" />

                      <label className="flex items-center gap-2 cursor-pointer mt-6"><input type="checkbox" checked={showGiftMessage} onChange={() => setShowGiftMessage(!showGiftMessage)} className="text-rose-600 accent-rose-600 w-4 h-4 cursor-pointer" /><span className="text-sm font-medium">Is this a gift?</span></label>
                      {showGiftMessage && <textarea placeholder="Gift Message" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm h-20 mt-2 outline-none focus:border-rose-300" />}
                      
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

          {/* RIGHT COLUMN: ORDER SUMMARY & COUPONS */}
          <div className="lg:w-[45%]">
            <div className="sticky top-28 space-y-6">
                
                {/* CART ITEMS SUMMARY */}
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

                {/* COUPON SECTION */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Tag size={16} /> Apply Discount Code</h3>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-green-700 uppercase">{appliedCoupon.code} Applied!</span>
                        <span className="text-xs text-green-600">- ₹{couponDiscountAmount.toLocaleString()}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter coupon code" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-rose-500 uppercase"
                      />
                      <button 
                        type="submit" 
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>}

                  {/* DISPLAY AVAILABLE COUPONS */}
                  {availableCoupons.length > 0 && !appliedCoupon && (
                    <div className="mt-5 border-t border-gray-50 pt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Available Offers</p>
                      <div className="space-y-2">
                        {availableCoupons.map(coupon => (
                          <div 
                            key={coupon.id} 
                            className="flex items-center justify-between bg-rose-50/50 border border-rose-100 rounded-lg p-3 cursor-pointer hover:bg-rose-50 transition-colors" 
                            onClick={() => setCouponInput(coupon.code)}
                          >
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-rose-700">{coupon.code}</span>
                                <span className="text-xs text-rose-600/80 mt-0.5">
                                  Save {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} {coupon.min_order_value > 0 ? `on orders above ₹${coupon.min_order_value}` : ''}
                                </span>
                             </div>
                             <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-rose-100">Tap to Use</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* PRICE DETAILS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Price Details</h3>
                    <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                        
                        {appliedCoupon && <div className="flex justify-between text-green-600 font-medium"><span>Coupon Discount ({appliedCoupon.code})</span><span>- ₹{couponDiscountAmount.toLocaleString()}</span></div>}

                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span className={shipping === 0 ? "text-green-600 font-medium" : "text-gray-900"}>
                            {shipping === 0 ? "FREE" : `₹${shipping}`}
                          </span>
                        </div>
                        
                        {/* FREE SHIPPING PROGRESS TEXT */}
                        {shipping > 0 && (
                          <div className="text-[11px] text-rose-600 text-right mt-1 font-medium">
                            Add ₹{amountNeededForFreeShipping.toLocaleString()} more for FREE shipping
                          </div>
                        )}
                        
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

      {/* --- SAVE ADDRESS PROMPT MODAL --- */}
      <AnimatePresence>
        {showSaveAddressPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-rose-600" />
              </div>
              <h2 className="font-serif text-xl text-gray-900 mb-2">Save for next time?</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Want us to securely save this address to your profile so you can checkout faster next time?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleSaveAddressChoice(false)} 
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  No Thanks
                </button>
                <button 
                  onClick={() => handleSaveAddressChoice(true)} 
                  className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-md cursor-pointer"
                >
                  Yes, Save It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">Order Initiated!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Thank you, {shippingInfo.firstName}. We have saved your order details. Please click below to finalize via WhatsApp.
              </p>
              
              <div className="space-y-3">
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full block py-3.5 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-colors cursor-pointer text-center"
                >
                  Open WhatsApp Manually
                </a>
                <button 
                  onClick={handleFinish} 
                  className="w-full py-3.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors cursor-pointer text-center"
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