import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, Clock, ArrowRight, ShoppingBag, ShieldCheck, 
  X, MapPin, CreditCard, Receipt, Printer, XCircle, 
  RotateCcw, Star, ShoppingCart 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "../../supabase";
import { useCart } from "@/context/CartContext";

const MyOrders = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart(); 

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [itemToReview, setItemToReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // --- NEW: Accurate 5-Step Tracking Flow ---
  const trackingSteps = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

  const getStepIndex = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered")) return 4;
    if (s.includes("out for delivery")) return 3;
    if (s.includes("shipped")) return 2;
    if (s.includes("processing")) return 1;
    if (s.includes("placed") || s.includes("pending") || s.includes("new")) return 0;
    return -1; // Fallback for Cancelled or Return Requested
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchMyOrders(parsedUser.email);
  }, [navigate]);

  const fetchMyOrders = async (userEmail: string) => {
    try {
      setLoading(true);
      const cleanEmail = userEmail.trim();

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .ilike("customer_email", cleanEmail) 
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order: any) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    setOrderItems([]); 

    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          product_id,
          quantity,
          price_at_purchase,
          size,
          products ( name, images, image )
        `)
        .eq("order_id", order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleBuyAgain = (item: any) => {
    if(addToCart) {
      const productImg = item.products?.images?.[0] || item.products?.image;
      addToCart({
        id: item.product_id,
        name: item.products?.name,
        price: item.price_at_purchase,
        image: productImg,
        size: item.size || "Standard",
        qty: 1
      } as any); 
      navigate('/cart');
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('orders').update({ status: 'Cancelled' }).eq('id', selectedOrder.id);
      if (error) throw error;
      const updatedOrder = { ...selectedOrder, status: 'Cancelled' };
      setSelectedOrder(updatedOrder);
      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!window.confirm("Would you like to request a return or exchange for this order?")) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('orders').update({ status: 'Return Requested' }).eq('id', selectedOrder.id);
      if (error) throw error;
      const updatedOrder = { ...selectedOrder, status: 'Return Requested' };
      setSelectedOrder(updatedOrder);
      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      alert("Return request submitted successfully. Our team will contact you shortly.");
    } catch (error) {
      console.error("Error requesting return:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: itemToReview.product_id,
        user_email: user.email,
        rating: rating,
        review_text: reviewText
      });
      if (error) throw error;
      alert("Thank you for your review!");
      setReviewModalOpen(false);
      setReviewText("");
      setRating(5);
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
      <div className="print:hidden"><Navbar /></div>

      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl print:hidden">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
          <div>
            <h1 className="font-serif text-3xl text-gray-900 tracking-wide mb-2">My Orders</h1>
            <p className="text-sm text-gray-500">Track, return, or buy items again.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border border-green-100">
            <ShieldCheck size={14} /> Secured
          </div>
        </div>

        {loading ? (
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
            {orders.map((order, index) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Placed</p>
                      <p className="text-sm font-semibold text-gray-800">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0"><Package size={24} strokeWidth={1.5} /></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-gray-900">{order.status === "Delivered" ? "Delivered successfully" : "Tracking Status"}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusBadge(order.status)}`}>{order.status || "Processing"}</span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><Clock size={12} />Payment Method: <span className="uppercase font-semibold text-gray-700">{order.payment_method}</span></p>
                    </div>
                  </div>
                  <button onClick={() => handleViewDetails(order)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-rose-200 hover:text-rose-600 transition-colors group cursor-pointer">
                    View Details
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
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
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:rounded-none print:!transform-none print:overflow-visible print:border-none print:block"
            >
              
              {/* ========================================= */}
              {/* WEB VIEW (HIDDEN DURING PRINT)           */}
              {/* ========================================= */}
              <div className="print:hidden flex flex-col h-full">
                {/* Header */}
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

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                  {/* Visual Tracking Timeline */}
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

                  {/* Status & Info Row */}
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

                  {/* Items List */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5"><Receipt size={14}/> Items Ordered</h3>
                    {loadingDetails ? (
                      <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : (
                      <div className="space-y-4">
                        {orderItems.map((item, idx) => {
                          const productImg = item.products?.images?.[0] || item.products?.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80";
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                              <Link to={`/product/${item.product_id}`} className="flex flex-1 items-center gap-4 group">
                                <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                  <img src={productImg} alt="Product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-rose-600 transition-colors">{item.products?.name || "Premium Jewelry Item"}</p>
                                  <p className="text-xs text-gray-500 mt-1">Size: {item.size || "Standard"} • Qty: {item.quantity}</p>
                                  <p className="text-sm font-bold text-gray-900 mt-1 sm:hidden">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                                </div>
                              </Link>
                              
                              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end sm:pl-4">
                                <p className="text-sm font-bold text-gray-900 hidden sm:block">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleBuyAgain(item)} className="p-2 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 rounded-lg transition-colors border border-gray-100 cursor-pointer" title="Buy Again"><ShoppingCart size={16} /></button>
                                  {selectedOrder.status === "Delivered" && (
                                    <button onClick={() => { setItemToReview(item); setReviewModalOpen(true); }} className="p-2 bg-gray-50 hover:bg-yellow-50 text-gray-600 hover:text-yellow-600 rounded-lg transition-colors border border-gray-100 cursor-pointer" title="Write a Review"><Star size={16} /></button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-end sm:items-start gap-6">
                    <div className="w-full sm:w-auto">
                      {(selectedOrder.status === "Pending Payment" || selectedOrder.status === "Placed" || selectedOrder.status === "Processing") && (
                        <button onClick={handleCancelOrder} disabled={isUpdating} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors cursor-pointer">
                          <XCircle size={14}/> Cancel Order
                        </button>
                      )}
                      {selectedOrder.status === "Delivered" && (
                        <button onClick={handleRequestReturn} disabled={isUpdating} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-stone-50 text-stone-700 border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors cursor-pointer">
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


              {/* ========================================= */}
              {/* PRINT ONLY VIEW (HIDDEN ON SCREEN)       */}
              {/* ========================================= */}
              <div className="hidden print:block w-full bg-white text-black font-sans p-8">
                
                {/* Header Section */}
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

                {/* Billing Details */}
                <div className="flex justify-between mb-10 text-sm">
                  <div className="w-1/2 pr-8">
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2 border-b border-gray-200 pb-1">Billed & Shipped To:</h3>
                    <p className="font-bold text-gray-900 text-base">{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}</p>
                    <p className="text-gray-700 mt-1">
                      {selectedOrder.shipping_address?.flat}, {selectedOrder.shipping_address?.street}<br />
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                    </p>
                    <p className="text-gray-700 mt-1">Ph: {selectedOrder.shipping_address?.phone || "N/A"}</p>
                  </div>
                </div>

                {/* Professional Table */}
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
                    {orderItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-gray-900">{item.products?.name || "Premium Jewelry Item"}</p>
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

                {/* Totals Section */}
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

                {/* Footer Note */}
                <div className="border-t border-gray-300 pt-6 text-center">
                  <p className="font-bold text-gray-800 text-sm mb-1">Thank you for your purchase!</p>
                  <p className="text-xs text-gray-500">This is a computer-generated invoice and does not require a physical signature.</p>
                  <p className="text-xs text-gray-500 mt-1">For returns or support, please visit www.sarvaa.com/support</p>
                </div>
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
              <p className="text-sm text-gray-500 mb-6 line-clamp-1">{itemToReview.products?.name}</p>
              
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
              
              <button onClick={handleSubmitReview} className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors cursor-pointer">Submit Review</button>
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