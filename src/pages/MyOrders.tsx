import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, Clock, ArrowRight, ShoppingBag, ShieldCheck, 
  X, MapPin, CreditCard, Receipt, Printer, XCircle, 
  RotateCcw, Star, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "../../supabase";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const MyOrders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [itemToReview, setItemToReview] = useState<any>(null);
  const [rating, setRating] = useState(0); 
  const [reviewText, setReviewText] = useState("");
  
  // Cancel Confirmation Modal State
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);

  const trackingSteps = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

  const getStepIndex = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered")) return 4;
    if (s.includes("out for delivery")) return 3;
    if (s.includes("shipped")) return 2;
    if (s.includes("processing")) return 1;
    if (s.includes("placed") || s.includes("pending") || s.includes("new")) return 0;
    return -1; 
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Corrupted user profile, clearing memory.");
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  }, [navigate]);

  // --- 1. MAIN ORDERS QUERY (HYBRID UUID FETCH) ---
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    // Cache using the permanent ID first, fallback to email
    queryKey: ['myOrders', user?.id || user?.user_id || user?.email], 
    queryFn: async () => {
      const cleanEmail = user?.email?.trim();
      const userUUID = user?.id || user?.user_id;

      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products:product_id ( title, image_url, image_urls )
          )
        `)
        .order("created_at", { ascending: false });

      // THE HYBRID FETCH: Searches for the permanent UUID first, 
      // but also catches your old email-only test orders!
      if (userUUID) {
        query = query.or(`user_id.eq.${userUUID},customer_email.ilike.${cleanEmail}`);
      } else {
        query = query.ilike("customer_email", cleanEmail);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user, 
    staleTime: 1000 * 60 * 5, 
  });

  // --- 2. FETCH REVIEWED PRODUCTS QUERY (UPDATED TO USE EMAIL) ---
  const { data: reviewedProducts = [] } = useQuery({
    queryKey: ['reviewedProducts', user?.email], // Updated to email
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('user_email', user.email); // Updated to email to prevent Name collisions
        
      if (error) throw error;
      return data.map(r => r.product_id); 
    },
    enabled: !!user?.email, // Updated to email
    staleTime: 1000 * 60 * 5,
  });

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleInitiateCancel = () => {
    setCancelConfirmationOpen(true);
  };

  // --- UPDATED SECURE CANCEL LOGIC ---
  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;
    
    setIsUpdating(true);
    try {
      // 1. Mark the order as Cancelled in the database.
      // Your new Supabase SQL trigger will automatically catch this and restore the inventory safely!
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', selectedOrder.id);
        
      if (orderError) throw orderError;

      // 2. Update the UI
      setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
      await queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      setCancelConfirmationOpen(false);
      
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order.");
      setCancelConfirmationOpen(false); // UX Fix: Close modal on failure
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    if (!window.confirm("Would you like to request a return or exchange for this order?")) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('orders').update({ status: 'Return Requested' }).eq('id', orderId);
      if (error) throw error;
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'Return Requested' });
      }
      
      // FIX: Invalidate the general 'myOrders' key so it auto-refreshes instantly!
      await queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      alert("Return request submitted successfully. Our team will contact you shortly.");
    } catch (error) {
      console.error("Error requesting return:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- UPDATED REVIEW SUBMISSION (USES EMAIL) ---
  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Please select a star rating before submitting.");
      return;
    }

    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: itemToReview.product_id,
        user_email: user.email, // Added this line for strict unique identification
        user_name: user.name, 
        rating: rating,
        comment: reviewText   
      });
      if (error) throw error;
      alert("Thank you for your review!");
      
      // Instantly update the reviewed products list 
      await queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      
      setReviewModalOpen(false);
      setReviewText("");
      setRating(0); 
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered")) return "bg-green-50 text-green-700 border-green-200";
    if (s.includes("processing") || s.includes("shipped")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (s.includes("cancelled")) return "bg-red-50 text-red-700 border-red-200";
    return "bg-amber-50 text-amber-700 border-amber-200"; 
  };

  const currentStepIndex = getStepIndex(selectedOrder?.status);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC] font-sans print:bg-white">
      <Helmet>
        <title> My Orders | Sarvaa Fine Jewelry</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="print:hidden"><Navbar /></div>

      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl print:hidden">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
          <div>
            <h1 className="font-serif text-3xl text-gray-900 tracking-wide mb-2">My Orders</h1>
            <p className="text-sm text-gray-500">Track and manage your orders.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border border-green-100">
            <ShieldCheck size={14} /> Secured
          </div>
        </div>

        {loadingOrders ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6"><ShoppingBag size={32} /></div>
            <h2 className="text-xl font-serif text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 text-sm mb-8">Looks like you haven't placed any orders with us yet.</p>
            <Link to="/" className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Start Shopping</Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any, index: number) => {
              const firstItem = order.order_items?.[0];
              const previewImage = firstItem?.products?.image_urls?.[0] || firstItem?.products?.image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80";
              const extraItemsCount = order.order_items?.length ? order.order_items.length - 1 : 0;

              return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Placed</p>
                      <p className="text-sm font-semibold text-gray-800">{formatDateTime(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-sm font-semibold text-gray-800">₹{order.total_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="text-sm font-mono text-gray-800">#{order.id.split('-')[0].toUpperCase()}</p>
                  </div>
                </div>

                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                      <img src={previewImage} alt="Order Preview" className="w-full h-full object-cover" />
                      {extraItemsCount > 0 && (
                        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold">
                          +{extraItemsCount}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-gray-900">{order.status === "Delivered" ? "Delivered successfully" : "Tracking Status"}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusBadge(order.status)}`}>{order.status || "Processing"}</span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><Clock size={12} />Payment Method: <span className="uppercase font-semibold text-gray-700">{order.payment_method}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <button onClick={() => handleViewDetails(order)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-rose-200 hover:text-rose-600 transition-colors group cursor-pointer">
                      View Details
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              </motion.div>
            )})}
          </div>
        )}
      </main>

      {/* --- ORDER DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedOrder && !reviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 print:static print:block print:p-0 print:z-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm print:hidden" />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden print:max-h-none print:shadow-none print:w-full print:rounded-none print:!transform-none print:overflow-visible print:border-none print:block"
            >
              
              {/* WEB VIEW */}
              <div className="print:hidden flex flex-col h-full overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                  <div>
                    <h2 className="text-lg font-serif text-gray-900">Order Details</h2>
                    <p className="text-xs font-mono text-gray-500 mt-1">#{selectedOrder.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handlePrintInvoice} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 uppercase tracking-widest border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"><Printer size={14} /> Invoice</button>
                    <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"><X size={20} /></button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 min-h-0">
                  {selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Return Requested" && (
                    <div className="py-4 px-2">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full" />
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500" 
                          style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` : '0%' }}
                        />
                        {trackingSteps.map((step, idx) => (
                          <div key={step} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${idx <= currentStepIndex ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                              {idx < currentStepIndex ? <CheckCircle size={14} /> : idx + 1}
                            </div>
                            <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-center ${idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}`}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedOrder.status === "Cancelled" || selectedOrder.status === "Return Requested") && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                      <XCircle size={20} />
                      <p className="text-sm font-bold">This order has been {selectedOrder.status.toLowerCase()}.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5"><MapPin size={14}/> Shipping Address</h3>
                      <p className="text-sm text-gray-800 font-medium">{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {selectedOrder.shipping_address?.flat}, {selectedOrder.shipping_address?.street}<br />
                        {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5"><CreditCard size={14}/> Payment Info</h3>
                      <p className="text-sm text-gray-800 font-medium uppercase">{selectedOrder.payment_method}</p>
                      <p className="text-sm text-gray-600 mt-1">Status: <span className={`font-semibold ${selectedOrder.status === 'Cancelled' ? 'text-red-600' : 'text-gray-900'}`}>{selectedOrder.status}</span></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5"><Receipt size={14}/> Items Ordered</h3>
                    <div className="space-y-4">
                      {selectedOrder.order_items?.map((item: any, idx: number) => {
                        const productImg = item.products?.image_urls?.[0] || item.products?.image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80";
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                            <Link to={`/product/${item.product_id}`} className="flex flex-1 items-center gap-4 group">
                              <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                <img src={productImg} alt="Product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-rose-600 transition-colors">{item.products?.title || "Premium Jewelry Item"}</p>
                                <p className="text-xs text-gray-500 mt-1">Size: {item.size || "Standard"} • Qty: {item.quantity}</p>
                                <p className="text-sm font-bold text-gray-900 mt-1 sm:hidden">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                              </div>
                            </Link>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end sm:pl-4">
                              <p className="text-sm font-bold text-gray-900 hidden sm:block">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                              
                              <div className="flex items-center gap-2">
                                {/* DYNAMIC REVIEW BUTTON LOGIC */}
                                {selectedOrder.status?.toLowerCase() === "delivered" && (
                                  reviewedProducts.includes(item.product_id) ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg border border-gray-200 text-[10px] font-bold uppercase tracking-widest">
                                      <CheckCircle2 size={12} /> Reviewed
                                    </span>
                                  ) : (
                                    <button 
                                      onClick={() => { setItemToReview(item); setReviewModalOpen(true); }} 
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors border border-yellow-200 cursor-pointer text-[10px] font-bold uppercase tracking-widest shadow-sm"
                                    >
                                      <Star size={12} fill="currentColor" /> Write Review
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PRICE BREAKDOWN & CANCEL BUTTON */}
                  <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-end sm:items-start gap-6">
                    <div className="w-full sm:w-auto flex flex-col gap-3">
                      {(selectedOrder.status === "Pending Payment" || selectedOrder.status === "Placed" || selectedOrder.status === "Pending WhatsApp") && (
                        <button 
                          onClick={handleInitiateCancel} 
                          disabled={isUpdating} 
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <XCircle size={14}/> Cancel Order
                        </button>
                      )}
                      {selectedOrder.status === "Delivered" && (
                        <button onClick={() => handleRequestReturn(selectedOrder.id)} disabled={isUpdating} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-stone-50 text-stone-700 border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors cursor-pointer">
                          <RotateCcw size={14}/> Request Return
                        </button>
                      )}
                    </div>
                    <div className="space-y-3 w-full sm:max-w-xs">
                      <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toLocaleString()}</span></div>
                      {selectedOrder.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>- ₹{selectedOrder.discount?.toLocaleString()}</span></div>}
                      <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>{selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee}`}</span></div>
                      {selectedOrder.cod_charge > 0 && <div className="flex justify-between text-sm text-rose-600"><span>COD Fee</span><span>₹{selectedOrder.cod_charge}</span></div>}
                      <div className="h-px bg-gray-200 my-2" />
                      <div className="flex justify-between items-center"><span className="font-bold text-gray-900">Total</span><span className="text-xl font-bold text-gray-900">₹{selectedOrder.total_amount?.toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRINT INVOICE VIEW */}
              <div className="hidden print:block w-full bg-white text-black font-sans p-8">
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                  <div>
                    <h1 className="text-4xl font-serif italic mb-1 text-gray-900">Sarvaa</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Luxury Traditional Wear</p>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>123 Heritage Lane, Fashion District</p>
                      <p>Mumbai, Maharashtra, 400001</p>
                      <p>GSTIN: 27AAAAA0000A1Z5</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-800 mb-2">Tax Invoice</h2>
                    <table className="ml-auto text-sm text-gray-800">
                      <tbody>
                        <tr><td className="pr-4 text-gray-500 text-right">Invoice No:</td><td className="font-bold">#{selectedOrder.id.split('-')[0].toUpperCase()}</td></tr>
                        <tr><td className="pr-4 text-gray-500 text-right">Order Date:</td><td className="font-bold">{new Date(selectedOrder.created_at).toLocaleDateString('en-IN')}</td></tr>
                        <tr><td className="pr-4 text-gray-500 text-right">Payment:</td><td className="font-bold uppercase">{selectedOrder.payment_method}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between mb-10 text-sm gap-8">
                  <div className="w-1/2">
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2 border-b border-gray-200 pb-1">Billed To:</h3>
                    <p className="font-bold text-gray-900 text-base">{selectedOrder.billing_address?.firstName || selectedOrder.shipping_address?.firstName} {selectedOrder.billing_address?.lastName || selectedOrder.shipping_address?.lastName}</p>
                    <p className="text-gray-700 mt-1">
                      {selectedOrder.billing_address?.flat || selectedOrder.shipping_address?.flat}, {selectedOrder.billing_address?.street || selectedOrder.shipping_address?.street}<br />
                      {selectedOrder.billing_address?.city || selectedOrder.shipping_address?.city}, {selectedOrder.billing_address?.state || selectedOrder.shipping_address?.state} - {selectedOrder.billing_address?.pincode || selectedOrder.shipping_address?.pincode}
                    </p>
                  </div>
                  <div className="w-1/2">
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2 border-b border-gray-200 pb-1">Shipped To:</h3>
                    <p className="font-bold text-gray-900 text-base">{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}</p>
                    <p className="text-gray-700 mt-1">
                      {selectedOrder.shipping_address?.flat}, {selectedOrder.shipping_address?.street}<br />
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                    </p>
                    <p className="text-gray-700 mt-1">Ph: {selectedOrder.customer_phone}</p>
                  </div>
                </div>

                <table className="w-full text-left border-collapse mb-8 text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-900 text-gray-800">
                      <th className="py-3 font-bold uppercase text-xs tracking-wider w-1/2">Item Description</th>
                      <th className="py-3 font-bold uppercase text-xs tracking-wider text-center">Size</th>
                      <th className="py-3 font-bold uppercase text-xs tracking-wider text-center">Qty</th>
                      <th className="py-3 font-bold uppercase text-xs tracking-wider text-right">Unit Price</th>
                      <th className="py-3 font-bold uppercase text-xs tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_items?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-gray-900">{item.products?.title || "Premium Jewelry Item"}</p>
                          <p className="text-xs text-gray-500 mt-1">SKU: SRV-{item.product_id.substring(0,6).toUpperCase()}</p>
                        </td>
                        <td className="py-4 text-center text-gray-800">{item.size || "Standard"}</td>
                        <td className="py-4 text-center text-gray-800">{item.quantity}</td>
                        <td className="py-4 text-right text-gray-800">₹{item.price_at_purchase.toLocaleString()}</td>
                        <td className="py-4 text-right font-bold text-gray-900">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mb-16">
                  <div className="w-72">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 text-gray-600">Subtotal</td>
                          <td className="py-2 text-right font-semibold">₹{selectedOrder.subtotal?.toLocaleString()}</td>
                        </tr>
                        {selectedOrder.discount > 0 && (
                          <tr className="border-b border-gray-100 text-green-700">
                            <td className="py-2">Discount Applied</td>
                            <td className="py-2 text-right font-semibold">- ₹{selectedOrder.discount?.toLocaleString()}</td>
                          </tr>
                        )}
                        <tr className="border-b border-gray-100">
                          <td className="py-2 text-gray-600">Shipping Fees</td>
                          <td className="py-2 text-right font-semibold">{selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee}`}</td>
                        </tr>
                        {selectedOrder.cod_charge > 0 && (
                          <tr className="border-b border-gray-100">
                            <td className="py-2 text-gray-600">COD Handling Fee</td>
                            <td className="py-2 text-right font-semibold">₹{selectedOrder.cod_charge}</td>
                          </tr>
                        )}
                        <tr className="border-t-2 border-gray-900">
                          <td className="py-3 text-lg font-bold text-gray-900">Grand Total</td>
                          <td className="py-3 text-right text-xl font-bold text-gray-900">₹{selectedOrder.total_amount?.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CANCEL CONFIRMATION WARNING MODAL --- */}
      <AnimatePresence>
        {cancelConfirmationOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 print:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCancelConfirmationOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
              
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle size={32} strokeWidth={1.5} />
              </div>
              
              <h3 className="font-serif text-2xl text-gray-900 mb-2">Cancel Order?</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to cancel order <span className="font-bold text-gray-700">#{selectedOrder?.id?.split('-')[0].toUpperCase()}</span>? This action cannot be undone.
              </p>
              
              <div className="flex flex-col gap-3">
                <button onClick={() => setCancelConfirmationOpen(false)} className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors cursor-pointer">
                  No, Keep Order
                </button>
                <button onClick={handleConfirmCancel} disabled={isUpdating} className="w-full py-3.5 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer">
                  {isUpdating ? "Cancelling..." : "Yes, Cancel Order"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- REVIEW MODAL --- */}
      <AnimatePresence>
        {reviewModalOpen && itemToReview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 print:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
              <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 cursor-pointer"><X size={20}/></button>
              
              <h3 className="font-serif text-xl text-gray-900 mb-2">Rate Your Product</h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-1">{itemToReview.products?.title}</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform cursor-pointer">
                    <Star size={32} fill={star <= rating ? "#F59E0B" : "none"} color={star <= rating ? "#F59E0B" : "#D1D5DB"} strokeWidth={1} />
                  </button>
                ))}
              </div>
              
              <textarea 
                placeholder="What did you love about it?" 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)} 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-rose-500 outline-none h-24 resize-none mb-6 bg-gray-50" 
              />
              
              <button onClick={handleSubmitReview} className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors cursor-pointer shadow-md">
                Submit Review
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="print:hidden"><Footer /></div>
    </div>
  );
};

const CheckCircle = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default MyOrders;