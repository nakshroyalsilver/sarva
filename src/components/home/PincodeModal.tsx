import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, ChevronRight, Truck } from "lucide-react";

export default function PincodeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    // Check if pincode already exists in localStorage
    const savedPincode = localStorage.getItem("user_pincode");
    if (!savedPincode) {
      // Small delay for better UX (pops up after site loads)
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pincode.length === 6) {
      localStorage.setItem("user_pincode", pincode);
      setIsOpen(false);
      // Optional: Dispatch a custom event to notify other components (like Product Page)
      window.dispatchEvent(new Event("pincodeUpdated"));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <MapPin size={32} className="text-rose-500" />
              </div>

              <h2 className="font-serif text-2xl text-stone-900 mb-2">Check Delivery Availability</h2>
              <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                Enter your pincode to see accurate delivery dates and jewelry availability for your location.
              </p>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="w-full border-2 border-stone-100 focus:border-rose-500 rounded-xl px-5 py-4 outline-none text-lg font-medium tracking-[0.2em] transition-all placeholder:tracking-normal placeholder:font-normal"
                  />
                  <button 
                    type="submit"
                    disabled={pincode.length !== 6}
                    className="absolute right-2 top-2 bottom-2 bg-stone-900 text-white px-4 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-stone-400 px-1 pt-2">
                  <Truck size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Free Shipping on all orders</span>
                </div>
              </form>
            </div>

            <div className="bg-stone-50 p-4 text-center">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-stone-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
                >
                  I'll do it later
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}