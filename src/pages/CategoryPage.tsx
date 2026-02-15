import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Truck, Check, Gift, Tag, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { products } from "@/data/products"; 
import { useCart } from "@/context/CartContext"; 

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [isPincodeChecked, setIsPincodeChecked] = useState(false);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  
  // Feedback States
  const [isAdded, setIsAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const product = products.find((p) => p.id === id) || products[0];
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  // MOCK DATA
  const similarProducts = [...products, ...products].filter(p => p.category === product.category && p.id !== product.id).slice(0, 8);
  const recentlyViewed = [...products, ...products].filter(p => p.id !== product.id).slice(0, 8);

  const images = [
    product.image,
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80", 
    "https://images.unsplash.com/photo-1515562141589-67f0d569b03e?w=800&q=80", 
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80", 
  ];

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) setIsPincodeChecked(true);
  };

  const validateAndGetSize = () => {
    if (product.category === 'rings' && !selectedSize) {
      setSizeError(true);
      return false;
    }
    setSizeError(false);
    return true;
  };

  const handleAddToCart = () => {
    if (!validateAndGetSize()) return;

    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize || "Standard");
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // --- UPDATED BUY NOW LOGIC (Links to Checkout) ---
  const handleBuyNow = () => {
    if (!validateAndGetSize()) return;
    
    // 1. Add to cart (optional, depending on your flow)
    // addToCart(product, selectedSize || "Standard");

    // 2. Navigate to Checkout with the item data
    navigate("/checkout", { 
      state: { 
        directPurchase: { ...product, qty: quantity, size: selectedSize || "Standard" } 
      } 
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [id]);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10">
        
        {/* Breadcrumbs */}
        <div className="text-xs text-gray-500 mb-6 uppercase tracking-widest flex items-center gap-2">
          <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link> 
          <ChevronRight size={10} />
          <Link to={`/category/${product.category}`} className="hover:text-rose-600 transition-colors capitalize">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 relative items-start">
          
          {/* =================================================
              LEFT COLUMN: STICKY IMAGES (SMALLER & COMPACT)
             ================================================= */}
          {/* Reduced width to 40% to make it smaller */}
          <div className="lg:w-[40%] lg:sticky lg:top-24 lg:h-fit self-start">
            <div className="flex flex-col gap-3">
              
              {/* Main Image - Reduced aspect ratio to square (1:1) to save vertical space */}
              <div className="flex-1 relative aspect-square bg-gray-50 rounded-xl overflow-hidden group border border-gray-100">
                 <img 
                   src={images[activeImage]} 
                   alt={product.name} 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in" 
                 />
                 <button 
                   onClick={() => toggleWishlist(product)}
                   className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-rose-600 transition-colors shadow-sm z-10"
                 >
                   <Heart size={18} className={isWishlisted ? "fill-rose-600 text-rose-600" : ""} />
                 </button>
                 
                 <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800 shadow-sm">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span>{product.rating} | {product.reviews}</span>
                 </div>
              </div>

              {/* Thumbnails - Below & Compact */}
              <div className="flex gap-2 overflow-x-auto lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-1 lg:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    // Smaller thumbnails (w-16 h-16) to ensure visibility above the fold
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? "border-rose-500 ring-1 ring-rose-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                 <button className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center bg-gray-50">
                    <span className="text-[10px] text-gray-400 font-medium">Video</span>
                 </button>
              </div>

            </div>
          </div>

          {/* =================================================
              RIGHT COLUMN: CONTENT (60%)
             ================================================= */}
          {/* Increased width to 60% */}
          <div className="lg:w-[60%] flex flex-col gap-8 pb-20">
            
            {/* 1. HEADER INFO */}
            <div className="border-b border-gray-100 pb-6">
              <h1 className="font-serif text-2xl md:text-3xl text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-end gap-3">
                <span className="text-2xl font-medium text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-sm font-bold text-green-600 mb-1.5">
                       {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            {/* 2. OFFERS */}
            <div className="bg-rose-50/50 border border-dashed border-rose-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-rose-600" />
                <span className="text-sm font-bold text-gray-900">Available Offers</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5 ml-6 list-disc marker:text-rose-400">
                <li>Flat 10% off on your first order. Use Code: <strong>NEW10</strong></li>
                <li>Get ₹500 off on orders above ₹2999.</li>
                <li>Pay via UPI and get ₹50 cashback.</li>
              </ul>
            </div>

            {/* 3. SIZE & QUANTITY */}
            <div>
              {product.category === 'rings' && (
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-3">
                     <span className={`text-sm font-bold uppercase tracking-wider ${sizeError ? "text-red-500" : ""}`}>Select Size</span>
                     <button className="text-xs text-rose-600 underline">Size Guide</button>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {['6', '7', '8', '9', '10'].map((size) => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center text-sm font-medium transition-all ${
                          selectedSize === size 
                            ? "border-rose-600 bg-rose-600 text-white" 
                            : "border-gray-200 text-gray-600 hover:border-rose-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {sizeError && <p className="text-xs text-red-500 mt-2 font-medium">Please select a size</p>}
                </div>
              )}

              {/* 4. GIFT WRAP */}
              <div 
                className={`mb-6 border rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors ${isGiftWrapped ? "border-rose-200 bg-rose-50" : "border-gray-200 hover:border-rose-200"}`} 
                onClick={() => setIsGiftWrapped(!isGiftWrapped)}
              >
                 <div className="flex items-center gap-3">
                   <div className="bg-white p-2 rounded-full text-rose-500 shadow-sm border border-rose-100">
                     <Gift size={20} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-900">Make it a Gift</p>
                     <p className="text-[10px] text-gray-500">Premium wrap + Message card (₹50)</p>
                   </div>
                 </div>
                 <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${isGiftWrapped ? "bg-rose-600 border-rose-600" : "border-gray-300"}`}>
                   {isGiftWrapped && <Check size={12} className="text-white" />}
                 </div>
              </div>

              {/* 5. ADD TO CART & BUY NOW BUTTONS */}
              <div className="flex gap-3 h-12">
                 {/* Quantity */}
                 <div className="flex items-center border border-gray-300 rounded-lg w-24 justify-between px-2 shrink-0">
                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 text-gray-500 hover:text-rose-600"><Minus size={16} /></button>
                   <span className="text-sm font-medium">{quantity}</span>
                   <button onClick={() => setQuantity(quantity + 1)} className="p-1 text-gray-500 hover:text-rose-600"><Plus size={16} /></button>
                 </div>
                 
                 {/* Add to Cart */}
                 <button 
                   onClick={handleAddToCart}
                   className={`flex-1 font-bold uppercase tracking-widest text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 border ${
                     isAdded 
                       ? "bg-green-600 text-white border-green-600" 
                       : "bg-white text-rose-600 border-rose-600 hover:bg-rose-50"
                   }`}
                 >
                   {isAdded ? <>Added <Check size={18} /></> : <>Add to Cart <ShoppingBag size={18}/></>}
                 </button>

                 {/* Buy Now (Linked to Checkout) */}
                 <button 
                   onClick={handleBuyNow}
                   className="flex-1 bg-rose-600 text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                 >
                   Buy Now
                 </button>
              </div>
            </div>

            {/* 6. DELIVERY CHECK */}
            <div className="bg-gray-50 p-4 rounded-lg">
               <label className="text-xs font-bold uppercase tracking-wider mb-2 block">Check Delivery</label>
               <form onSubmit={handlePincodeCheck} className="flex gap-2 relative">
                 <input 
                   type="text" maxLength={6} placeholder="Enter Pincode"
                   value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-rose-500"
                 />
                 <button disabled={pincode.length !== 6} className="text-rose-600 text-xs font-bold px-4 hover:bg-rose-100 rounded disabled:text-gray-400">CHECK</button>
               </form>
               {isPincodeChecked && (
                 <p className="mt-2 text-xs text-green-700 flex items-center gap-1"><Truck size={12} /> Delivery by <b>Wed, 14 Feb</b></p>
               )}
            </div>

            {/* 7. DESCRIPTION ACCORDIONS */}
            <div className="border-t border-gray-100 pt-2">
               <AccordionItem title="Product Description">
                 <p className="text-sm text-gray-500 leading-relaxed">Handcrafted with love, this {product.name} is made from 925 Sterling Silver. It features a brilliant rhodium finish for long-lasting shine.</p>
               </AccordionItem>
               <AccordionItem title="Material & Quality">
                 <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                   <li>925 Sterling Silver (Hallmarked)</li>
                   <li>Hypoallergenic & Nickel-free</li>
                   <li>AAA+ Quality Zircons</li>
                 </ul>
               </AccordionItem>
               <AccordionItem title="Shipping & Returns">
                 <p className="text-sm text-gray-500">Free shipping on orders above ₹999. Easy 30-day returns.</p>
               </AccordionItem>
            </div>

            {/* 8. CUSTOMER REVIEWS */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-gray-900">Reviews ({product.reviews})</h3>
                <button className="text-xs font-bold text-rose-600 underline">View All</button>
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-[10px] font-bold text-rose-700">A</div>
                        <span className="text-xs font-bold text-gray-900">Anjali S.</span>
                      </div>
                      <div className="flex"><Star size={10} className="fill-amber-400 text-amber-400" /><Star size={10} className="fill-amber-400 text-amber-400" /><Star size={10} className="fill-amber-400 text-amber-400" /><Star size={10} className="fill-amber-400 text-amber-400" /><Star size={10} className="fill-amber-400 text-amber-400" /></div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">"Absolutely stunning! Looks even better in person. The packaging was so premium."</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. SIMILAR PRODUCTS (Medium Size Cards: 180px) */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-serif text-lg text-gray-900 mb-4">You May Also Like</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {similarProducts.map((p, idx) => (
                  <Link key={idx} to={`/product/${p.id}`} className="min-w-[180px] max-w-[180px] group block border border-gray-100 rounded-lg p-2 hover:shadow-md transition-shadow">
                    <div className="relative aspect-square bg-gray-50 rounded mb-2 overflow-hidden">
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="text-xs font-medium text-gray-900 truncate">{p.name}</h4>
                    <p className="text-xs font-bold text-gray-900">₹{p.price.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* 10. RECENTLY VIEWED (Medium Size Cards: 180px) */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-serif text-lg text-gray-900 mb-4">Recently Viewed</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {recentlyViewed.map((p, idx) => (
                  <Link key={idx} to={`/product/${p.id}`} className="min-w-[180px] max-w-[180px] group block border border-gray-100 rounded-lg p-2 hover:shadow-md transition-shadow">
                    <div className="relative aspect-square bg-gray-50 rounded mb-2 overflow-hidden">
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="text-xs font-medium text-gray-900 truncate">{p.name}</h4>
                    <p className="text-xs font-bold text-gray-900">₹{p.price.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Accordion Component
const AccordionItem = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-none">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-4 text-left font-medium text-sm text-gray-900 hover:text-rose-600 transition-colors">
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