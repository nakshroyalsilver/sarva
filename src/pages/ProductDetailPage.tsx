import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Truck, Check, Gift, Tag, ChevronRight, Minus, Plus, ShoppingBag, PlayCircle, Bell, Info } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { products as localProducts } from "@/data/products"; 
import { useCart } from "@/context/CartContext"; 
import { supabase } from "../../supabase"; 
import ProductReviews from "@/components/home/ProductReviews";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistItems, cartItems } = useCart();
  
  const topRef = useRef<HTMLDivElement>(null);

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [dbSimilar, setDbSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [availableOffers, setAvailableOffers] = useState<any[]>([]);

  const [activeImage, setActiveImage] = useState(0); 
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [isPincodeChecked, setIsPincodeChecked] = useState(false);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  
  const [isAdded, setIsAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const [stockAlertMessage, setStockAlertMessage] = useState<string | null>(null);
  
  // NEW: State to track if the item is already waitlisted
  const [isNotified, setIsNotified] = useState(false);

  const [isZooming, setIsZooming] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      setLoading(true);
      try {
        const { data: prodData } = await supabase.from('products').select('*, categories(name, slug)').eq('id', id).single();
        
        if (prodData) {
          const formattedProduct = {
            ...prodData,
            name: prodData.title,
            image: (prodData.image_urls && prodData.image_urls.length > 0) ? prodData.image_urls[0] : prodData.image_url,
            price: prodData.price || 0,
            category: prodData.categories?.slug || 'uncategorized',
            stock_quantity: (prodData.stock_quantity !== undefined && prodData.stock_quantity !== null) ? Number(prodData.stock_quantity) : 0, 
            rating: 4.8, 
            reviews: 124 
          };
          setDbProduct(formattedProduct);

          const { data: simData } = await supabase.from('products').select('*, categories(name, slug)').eq('category_id', prodData.category_id).neq('id', id).limit(8);
          if (simData) {
            setDbSimilar(simData.map(p => ({
              ...p,
              name: p.title,
              image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
              price: p.price || 0,
              category: p.categories?.slug || 'uncategorized'
            })));
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProductDetails();
    window.scrollTo(0, 0);
    setActiveImage(0);
    setQuantity(1);
  }, [id]);

  useEffect(() => {
    async function fetchOffers() {
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3); 
        
      if (data) setAvailableOffers(data);
    }
    fetchOffers();
  }, []);

  const localProduct = localProducts.find((p) => p.id === id);
  const product = dbProduct || localProduct || localProducts[0];
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);
  const similarProducts = dbSimilar.length > 0 ? dbSimilar : [...localProducts, ...localProducts].filter(p => p.category === product.category && p.id !== product.id).slice(0, 8);

  const images = (product.image_urls && product.image_urls.length > 0)
    ? product.image_urls
    : (product.image ? [product.image] : []);

  const currentStock = dbProduct 
    ? Number(dbProduct.stock_quantity) 
    : (product.stock_quantity !== undefined ? Number(product.stock_quantity) : 10);
    
  const isOutOfStock = currentStock <= 0;

  // NEW: Check on load if this item was already waitlisted by the user
  useEffect(() => {
    if (product?.id) {
      const waitlistedItems = JSON.parse(localStorage.getItem("waitlistedProducts") || "[]");
      setIsNotified(waitlistedItems.includes(product.id));
    }
  }, [product?.id]);

  const existingCartQty = Array.isArray(cartItems) 
    ? cartItems.filter(item => item.id === product.id).reduce((sum, item) => sum + (item.qty || 1), 0)
    : 0;

  const triggerStockAlert = (msg: string) => {
    setStockAlertMessage(msg);
    setTimeout(() => setStockAlertMessage(null), 3500);
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) setIsPincodeChecked(true);
  };

  const validateAndGetSize = () => {
    if ((product.category === 'rings' || product.category === 'ring') && !selectedSize) {
      setSizeError(true);
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    setSizeError(false);
    return true;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return; 
    if (!validateAndGetSize()) return;

    if (existingCartQty + quantity > currentStock) {
      triggerStockAlert(`Only ${currentStock} total in stock. You already have ${existingCartQty} in cart.`);
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize || "Standard");
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return; 
    if (!validateAndGetSize()) return;

    if (existingCartQty + quantity > currentStock) {
      triggerStockAlert(`Only ${currentStock} total in stock. You already have ${existingCartQty} in cart.`);
      return;
    }

    addToCart(product, selectedSize || "Standard");
    navigate("/checkout", { 
      state: { directPurchase: { ...product, qty: quantity, size: selectedSize || "Standard" } } 
    });
  };

  const handleNotifyMe = async () => {
    if (isNotified) return;

    const storedUser = localStorage.getItem("currentUser");
    
    if (!storedUser) {
      triggerStockAlert("Please log in or register first to join the waitlist.");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const user = JSON.parse(storedUser);

    // Push to Supabase Waitlist
    const { error } = await supabase.from('waitlist').insert([{
      product_id: product.id,
      product_name: product.title || product.name,
      customer_name: user.name,
      customer_phone: user.phone || user.email || 'N/A'
    }]);

    if (!error) {
      setIsNotified(true);

      // Save to localStorage so it syncs with the grid cards
      const waitlistedItems = JSON.parse(localStorage.getItem("waitlistedProducts") || "[]");
      if (!waitlistedItems.includes(product.id)) {
        waitlistedItems.push(product.id);
        localStorage.setItem("waitlistedProducts", JSON.stringify(waitlistedItems));
      }

      setShowNotifyPopup(true);
      setTimeout(() => setShowNotifyPopup(false), 3500); 
    } else {
      triggerStockAlert("Failed to join waitlist. Please try again.");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || activeImage === -1) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)'
    });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-10 flex items-center justify-center">
           <div className="animate-pulse flex flex-col items-center">
             <div className="w-64 h-64 bg-gray-100 rounded-xl mb-6"></div>
             <div className="h-6 w-48 bg-gray-100 rounded mb-2"></div>
             <div className="h-4 w-24 bg-gray-100 rounded"></div>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-900 relative">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-6 lg:py-10">
        <div className="hidden md:flex text-xs text-gray-500 mb-6 uppercase tracking-widest items-center gap-2">
          <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link> 
          <ChevronRight size={10} />
          <Link to={`/category/${product.category}`} className="hover:text-rose-600 transition-colors capitalize">{product.category?.replace('-', ' ')}</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
          
          <div className="w-full lg:w-[38%] xl:w-[35%] lg:sticky lg:top-24 lg:h-fit self-start">
            <div className="flex flex-col gap-3"> 
              <div 
                ref={imageContainerRef}
                onMouseEnter={() => activeImage !== -1 && setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                className={`flex-1 relative aspect-square bg-gray-50 rounded-xl overflow-hidden group border border-gray-100 ${activeImage !== -1 ? 'cursor-crosshair' : ''}`}
              >
                 {activeImage === -1 && product.video_url ? (
                   <video 
                     src={product.video_url} 
                     controls 
                     autoPlay 
                     muted 
                     loop 
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <img 
                     src={images[activeImage] || 'https://via.placeholder.com/800'} 
                     alt={product.name} 
                     style={isZooming ? zoomStyle : { transform: 'scale(1)' }}
                     className={`w-full h-full object-cover transition-transform duration-200 ease-out ${isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''}`} 
                   />
                 )}

                 <button 
                   onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                   className={`absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur rounded-full transition-colors shadow-sm z-10 cursor-pointer ${isZooming ? 'opacity-0' : 'opacity-100'} text-gray-500 hover:text-rose-600`}
                 >
                   <Heart size={18} className={isWishlisted ? "fill-rose-600 text-rose-600" : ""} />
                 </button>
                 
                 <div className={`absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800 shadow-sm transition-opacity ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span>{product.rating} | {product.reviews}</span>
                 </div>
              </div>

              <div className="flex gap-2 overflow-x-auto lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-2 lg:pb-0">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImage === idx ? "border-rose-500 ring-1 ring-rose-500" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`View ${idx}`} className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-70' : ''}`} />
                    <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors"></div>
                  </button>
                ))}
                 
                 {product.video_url && (
                   <button 
                     onClick={() => setActiveImage(-1)}
                     className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 flex flex-col items-center justify-center bg-gray-50 cursor-pointer group transition-all ${
                       activeImage === -1 ? "border-rose-500 ring-1 ring-rose-500" : "border-gray-200 hover:border-gray-300"
                     }`}
                   >
                      <PlayCircle size={20} strokeWidth={1.5} className={`${activeImage === -1 ? "text-rose-500" : "text-gray-400"} mb-1 group-hover:text-rose-500 transition-colors`} />
                      <span className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeImage === -1 ? "text-rose-500" : "text-gray-500 group-hover:text-rose-500"}`}>Video</span>
                   </button>
                 )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[60%] flex flex-col gap-6 lg:gap-8 pb-24 lg:pb-0">
            <div className="border-b border-gray-100 pb-6">
              {product.type && (
                <span className="text-rose-600 font-bold text-[10px] uppercase tracking-widest mb-2 block">
                  {product.type}
                </span>
              )}
              <h1 className="font-serif text-xl md:text-3xl text-gray-900 mb-2">{product.name}</h1>
              
              {product.short_description && (
                <p className="text-sm text-gray-500 mb-4">{product.short_description}</p>
              )}

              <div className="flex items-end gap-3">
                <span className={`text-2xl font-medium ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>₹{product.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-sm font-bold text-green-600 mb-1.5">{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>
                  </>
                )}
                {isOutOfStock && (
                  <span className="ml-2 mb-1.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase tracking-wider">
                    Out of Stock
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            {availableOffers.length > 0 && (
              <div className="bg-rose-50/50 border border-dashed border-rose-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-rose-600" />
                  <span className="text-sm font-bold text-gray-900">Available Offers</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1.5 ml-6 list-disc marker:text-rose-400">
                  {availableOffers.map((offer) => (
                    <li key={offer.id}>
                      {offer.discount_type === 'percentage' 
                        ? `Flat ${offer.discount_value}% off` 
                        : `Get ₹${offer.discount_value} off`
                      }
                      {offer.min_order_value > 0 ? ` on orders above ₹${offer.min_order_value}` : ''}. 
                      Use Code: <strong className="text-gray-900">{offer.code}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              {(product.category === 'rings' || product.category === 'ring') && (
                <div className="mb-2" id="size-selector">
                  <div className="flex justify-between items-center mb-3">
                     <span className={`text-sm font-bold uppercase tracking-wider ${sizeError ? "text-red-500" : ""}`}>Select Size</span>
                     <button className="text-xs text-rose-600 underline cursor-pointer">Size Guide</button>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {['6', '7', '8', '9', '10'].map((size) => (
                      <button key={size} disabled={isOutOfStock} onClick={() => { setSelectedSize(size); setSizeError(false); }} className={`w-12 h-12 rounded-full border flex items-center justify-center text-sm font-medium transition-all ${isOutOfStock ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"} ${selectedSize === size ? "border-rose-600 bg-rose-600 text-white" : "border-gray-200 text-gray-600 hover:border-rose-300"}`}>{size}</button>
                    ))}
                  </div>
                  {sizeError && <p className="text-xs text-red-500 mt-2 font-medium animate-pulse">Please select a size to continue</p>}
                </div>
              )}

              <div className="mb-6 border rounded-lg p-3 flex items-center justify-between transition-colors hover:border-rose-200" onClick={() => !isOutOfStock && setIsGiftWrapped(!isGiftWrapped)}>
                 <div className={`flex items-center gap-3 ${isOutOfStock ? 'opacity-50' : 'cursor-pointer'}`}>
                   <div className="bg-white p-2 rounded-full text-rose-500 shadow-sm border border-rose-100"><Gift size={20} /></div>
                   <div><p className="text-sm font-bold text-gray-900">Make it a Gift</p><p className="text-[10px] text-gray-500">Premium wrap + Message card (₹50)</p></div>
                 </div>
                 <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${isGiftWrapped ? "bg-rose-600 border-rose-600" : "border-gray-300"} ${isOutOfStock ? 'opacity-50' : ''}`}>{isGiftWrapped && <Check size={12} className="text-white" />}</div>
              </div>

              {/* DESKTOP ADD TO CART / NOTIFY ME */}
              <div className="hidden lg:flex gap-3 h-12">
                 {isOutOfStock ? (
                   <button 
                     onClick={handleNotifyMe} 
                     disabled={isNotified}
                     className={`flex-1 text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                       isNotified 
                         ? "bg-green-600 border-green-600 cursor-default" 
                         : "bg-stone-900 hover:bg-stone-800 cursor-pointer"
                     }`}
                   >
                     {isNotified ? <>Waitlisted <Check size={18} /></> : <><Bell size={18} /> Notify Me When Available</>}
                   </button>
                 ) : (
                   <>
                     <div className="flex items-center border border-gray-300 rounded-lg w-24 justify-between px-2 shrink-0">
                       <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 text-gray-500 hover:text-rose-600 cursor-pointer"><Minus size={16} /></button>
                       <span className="text-sm font-medium">{quantity}</span>
                       <button 
                         onClick={() => {
                           if (quantity + existingCartQty < currentStock) {
                             setQuantity(quantity + 1);
                           } else {
                             triggerStockAlert(`Only ${currentStock} units available. (${existingCartQty} in cart).`);
                           }
                         }} 
                         className={`p-1 ${quantity + existingCartQty >= currentStock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-rose-600 cursor-pointer'}`}
                       >
                         <Plus size={16} />
                       </button>
                     </div>
                     
                     <button onClick={handleAddToCart} className={`flex-1 font-bold uppercase tracking-widest text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 border cursor-pointer ${isAdded ? "bg-green-600 text-white border-green-600" : "bg-white text-rose-600 border-rose-600 hover:bg-rose-50"}`}>
                       {isAdded ? <>Added <Check size={18} /></> : <>Add to Cart <ShoppingBag size={18}/></>}
                     </button>

                     <button onClick={handleBuyNow} className="flex-1 bg-rose-600 text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 cursor-pointer">
                       Buy Now
                     </button>
                   </>
                 )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
               <label className="text-xs font-bold uppercase tracking-wider mb-2 block">Check Delivery</label>
               <form onSubmit={handlePincodeCheck} className="flex gap-2 relative">
                 <input type="text" maxLength={6} placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-rose-500" />
                 <button disabled={pincode.length !== 6} className="text-rose-600 text-xs font-bold px-4 hover:bg-rose-100 rounded disabled:text-gray-400 cursor-pointer">CHECK</button>
               </form>
               {isPincodeChecked && <p className="mt-2 text-xs text-green-700 flex items-center gap-1"><Truck size={12} /> Delivery by <b>Tomorrow</b></p>}
            </div>

            <div className="border-t border-gray-100 pt-2">
               <AccordionItem title="Product Description">
                 {product.detail_description ? (
                   <div 
                     className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_a]:text-rose-600 [&_a]:underline [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-bold"
                     dangerouslySetInnerHTML={{ __html: product.detail_description }} 
                   />
                 ) : (
                   <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                     {product.description || `Handcrafted with love, this ${product.name} is made from 925 Sterling Silver.`}
                   </p>
                 )}
               </AccordionItem>
               
               <AccordionItem title="Product Specifications">
                 <ul className="text-sm text-gray-500 space-y-2">
                   <li><strong>Material:</strong> 925 Sterling Silver</li>
                 </ul>
               </AccordionItem>
               
               <AccordionItem title="Shipping & Returns"><p className="text-sm text-gray-500">Free shipping on orders above ₹999. Easy 30-day returns.</p></AccordionItem>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-serif text-lg text-gray-900 mb-4">You May Also Like</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {similarProducts.map((p, idx) => (
                  <Link key={idx} to={`/product/${p.id}`} className="min-w-[160px] max-w-[160px] group block border border-gray-100 rounded-lg p-2 hover:shadow-md transition-shadow">
                    <div className="relative aspect-square bg-gray-50 rounded mb-2 overflow-hidden"><img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                    <h4 className="text-xs font-medium text-gray-900 truncate">{p.name}</h4><p className="text-xs font-bold text-gray-900">₹{p.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* MOBILE ADD TO CART / NOTIFY ME */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-50 p-3 border-t border-gray-100 flex gap-3 lg:hidden shadow-[0_-4px_15px_rgba(0,0,0,0.05)] pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
         {isOutOfStock ? (
           <button 
             onClick={handleNotifyMe} 
             disabled={isNotified}
             className={`flex-1 text-white font-bold uppercase tracking-widest text-xs rounded-lg py-3.5 shadow-lg flex items-center justify-center gap-2 ${
               isNotified
                 ? "bg-green-600 border-green-600 cursor-default"
                 : "bg-stone-900 hover:bg-stone-800 cursor-pointer"
             }`}
           >
             {isNotified ? <>Waitlisted <Check size={16} /></> : <><Bell size={16} /> Notify Me</>}
           </button>
         ) : (
           <>
             <button 
               onClick={handleAddToCart} 
               className={`flex-1 font-bold uppercase tracking-widest text-xs rounded-lg border py-3.5 transition-colors cursor-pointer ${isAdded ? "bg-green-600 text-white border-green-600" : "bg-white text-rose-600 border-rose-200"}`}
             >
               {isAdded ? "Added" : "Add to Cart"}
             </button>
             <button 
               onClick={handleBuyNow} 
               className="flex-1 bg-rose-600 text-white font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg shadow-rose-100 py-3.5 cursor-pointer"
             >
               Buy Now
             </button>
           </>
         )}
      </div>

      <AnimatePresence>
        {showNotifyPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 lg:bottom-10 left-1/2 bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center gap-3 z-[100] whitespace-nowrap"
          >
            <div className="bg-rose-50 p-2 rounded-full border border-rose-100">
              <Check size={16} className="text-rose-600" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-wide">You've been added to the waitlist!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stockAlertMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 lg:bottom-10 left-1/2 bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center gap-3 z-[100] whitespace-nowrap"
          >
            <div className="bg-amber-50 p-2 rounded-full border border-amber-100">
              <Info size={16} className="text-amber-500" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-wide">{stockAlertMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ProductReviews productId={product.id} />

      <Footer />
    </div>
  );
};

const AccordionItem = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-none">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-4 text-left font-medium text-sm text-gray-900 hover:text-rose-600 transition-colors cursor-pointer">
        {title}
        <ChevronRight size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key="content" initial="collapsed" animate="open" exit="collapsed"
            variants={{ open: { opacity: 1, height: "auto", marginBottom: 16 }, collapsed: { opacity: 0, height: 0, marginBottom: 0 } }}
            transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="text-xs text-gray-500 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;