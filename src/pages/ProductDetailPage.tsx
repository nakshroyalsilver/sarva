import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Truck, RefreshCw, ShieldCheck, ChevronRight, Minus, Plus, Share2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar"; // Ensure path matches your folder structure
import Footer from "@/components/layout/Footer"; // Ensure path matches your folder structure
import { products } from "@/data/products"; 

const ProductDetailPage = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [isPincodeChecked, setIsPincodeChecked] = useState(false);

  // Find product (Mock logic)
  const product = products.find((p) => p.id === id) || products[0];

  // Mock Images
  const images = [
    product.image,
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80", // Side view
    "https://images.unsplash.com/photo-1515562141589-67f0d569b03e?w=800&q=80", // Model view
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80", // Packaging
  ];

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) setIsPincodeChecked(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
        
        {/* Breadcrumbs */}
        <div className="text-xs text-gray-500 mb-8 uppercase tracking-widest flex items-center gap-2">
          <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link> 
          <ChevronRight size={10} />
          <Link to={`/category/${product.category}`} className="hover:text-rose-600 transition-colors capitalize">{product.category}</Link>
          <ChevronRight size={10} />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* 1. IMAGE GALLERY SECTION */}
          <div className="lg:w-1/2">
            <div className="flex flex-col-reverse lg:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible hide-scrollbar pb-2 lg:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? "border-rose-500" : "border-transparent hover:border-rose-200"
                    }`}
                  >
                    <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 relative aspect-square bg-gray-50 rounded-xl overflow-hidden group">
                 <img 
                   src={images[activeImage]} 
                   alt={product.name} 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in" 
                 />
                 <button className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-rose-600 transition-colors shadow-sm z-10">
                   <Heart size={20} />
                 </button>
                 <button className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-blue-600 transition-colors shadow-sm lg:hidden z-10">
                   <Share2 size={20} />
                 </button>
              </div>
            </div>
          </div>

          {/* 2. PRODUCT DETAILS SECTION */}
          <div className="lg:w-1/2">
            
            {/* Title & Rating */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                   <span className="text-green-700 font-bold text-sm mr-1">{product.rating}</span>
                   <Star size={12} className="fill-green-700 text-green-700" />
                   <span className="text-gray-400 text-xs ml-1 border-l border-gray-300 pl-1">{product.reviews} Reviews</span>
                </div>
                {product.badge && (
                  <span className="text-xs text-rose-500 font-medium px-2 py-1 bg-rose-50 rounded">{product.badge}</span>
                )}
              </div>

              <div className="flex items-end gap-3">
                <span className="text-3xl font-medium text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-sm font-bold text-green-600 mb-1.5">
                       {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Size Selector (Only if Ring) */}
            {product.category === 'rings' && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-sm font-bold uppercase tracking-wider">Select Size</span>
                   <button className="text-xs text-rose-600 underline hover:text-rose-800">Size Guide</button>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {['6', '7', '8', '9', '10', '11'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
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
                {selectedSize === null && <p className="text-xs text-rose-500 mt-2">Please select a size</p>}
              </div>
            )}

            {/* Delivery Checker */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
               <label className="text-xs font-bold uppercase tracking-wider mb-2 block">Delivery Options</label>
               <form onSubmit={handlePincodeCheck} className="flex gap-2 relative">
                 <input 
                   type="text" 
                   maxLength={6}
                   placeholder="Enter Pincode"
                   value={pincode}
                   onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                   className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-rose-500 outline-none transition-colors"
                 />
                 <button 
                   disabled={pincode.length !== 6}
                   className="text-rose-600 text-sm font-bold px-4 hover:bg-rose-50 rounded disabled:text-gray-400 transition-colors"
                 >
                   Check
                 </button>
               </form>
               {isPincodeChecked && (
                 <motion.div 
                   initial={{ opacity: 0, y: -5 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-3 flex items-center gap-2 text-xs text-green-700"
                 >
                    <Truck size={14} />
                    <span>Estimated Delivery by <span className="font-bold">Wed, 14 Feb</span></span>
                 </motion.div>
               )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
               <div className="flex items-center border border-gray-300 rounded-lg h-12">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full text-gray-500 hover:text-rose-600 transition-colors"><Minus size={16} /></button>
                 <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="px-4 h-full text-gray-500 hover:text-rose-600 transition-colors"><Plus size={16} /></button>
               </div>
               <button className="flex-1 bg-rose-600 text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 h-12">
                 Add to Cart
               </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mb-8">
               <div className="flex flex-col items-center gap-2 p-3 border border-gray-100 rounded-lg text-center hover:bg-gray-50 transition-colors">
                 <img src="https://cdn-icons-png.flaticon.com/512/3500/3500833.png" alt="Silver" className="w-6 h-6 opacity-60" />
                 <span className="text-[10px] text-gray-500 font-medium">925 Silver</span>
               </div>
               <div className="flex flex-col items-center gap-2 p-3 border border-gray-100 rounded-lg text-center hover:bg-gray-50 transition-colors">
                 <ShieldCheck size={24} className="text-gray-400" />
                 <span className="text-[10px] text-gray-500 font-medium">6 Month Warranty</span>
               </div>
               <div className="flex flex-col items-center gap-2 p-3 border border-gray-100 rounded-lg text-center hover:bg-gray-50 transition-colors">
                 <RefreshCw size={24} className="text-gray-400" />
                 <span className="text-[10px] text-gray-500 font-medium">Easy Returns</span>
               </div>
            </div>

            {/* Accordion Details */}
            <div className="border-t border-gray-100">
               <AccordionItem title="Product Description">
                 <p className="text-sm text-gray-500 leading-relaxed">
                   Handcrafted with love, this {product.name} is made from 925 Sterling Silver. 
                   It comes with a rhodium finish to prevent tarnish. Perfect for sensitive skin.
                 </p>
               </AccordionItem>
               <AccordionItem title="Material & Care">
                 <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 ml-1">
                   <li>925 Sterling Silver</li>
                   <li>Rhodium e-coat to prevent tarnish</li>
                   <li>Store in a ziplock bag when not in use</li>
                   <li>Keep away from perfumes and chemicals</li>
                 </ul>
               </AccordionItem>
               <AccordionItem title="Shipping & Returns">
                 <p className="text-sm text-gray-500 leading-relaxed">
                   Free shipping on orders above ₹999. We offer a 30-day no-questions-asked return policy for unused items with original tags.
                 </p>
               </AccordionItem>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ==========================================
// Helper Accordion Component (Fixed)
// ==========================================
const AccordionItem = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-left font-medium text-gray-900 hover:text-rose-600 transition-colors"
      >
        {title}
        <ChevronRight size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto", marginBottom: 16 },
              collapsed: { opacity: 0, height: 0, marginBottom: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="text-sm text-gray-500 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;