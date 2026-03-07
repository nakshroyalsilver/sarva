import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AddToCartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  // The specific product they just clicked "Add to Cart" on
  product: {
    title: string;
    price: number;
    image: string;
    size?: string;
  } | null;
  // Total number of items currently in the cart
  cartCount: number; 
}

export default function AddToCartPopup({ isOpen, onClose, product, cartCount }: AddToCartPopupProps) {
  const navigate = useNavigate();

  // Automatically close the popup after 5 seconds so it doesn't block the screen forever
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-24 right-4 md:right-8 z-[150] w-[340px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-stone-100 overflow-hidden font-sans"
        >
          {/* Header - Success Message */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-green-50/80 border-b border-green-100/50">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 size={16} className="text-green-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Added to Cart</span>
            </div>
            <button onClick={onClose} className="text-green-600/60 hover:text-green-800 transition-colors cursor-pointer p-1">
              <X size={16} />
            </button>
          </div>

          {/* Body - Product Details */}
          <div className="p-5 flex gap-4">
            <div className="w-16 h-20 bg-stone-50 rounded-lg border border-stone-100 overflow-hidden flex-shrink-0">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center flex-1">
              {/* Using font-serif here to match your elegant jewelry vibe */}
              <h4 className="text-sm font-serif text-stone-900 line-clamp-2 leading-snug pr-2">{product.title}</h4>
              {product.size && <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Size: {product.size}</p>}
              <p className="text-sm font-bold text-stone-900 mt-2">₹{product.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="px-5 pb-5 space-y-2.5">
            <button 
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
              // Added your signature Rose color for the hover state!
              className="w-full py-3 bg-white border border-stone-200 text-stone-700 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all cursor-pointer"
            >
              View cart ({cartCount})
            </button>
            
            <button 
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
              className="w-full py-3 bg-stone-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Lock size={14} /> Checkout securely
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}