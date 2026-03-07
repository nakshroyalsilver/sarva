import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <-- Added useNavigate
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../supabase"; 
import { 
  Instagram, Facebook, Twitter, Mail, Phone, MapPin, 
  Truck, ShieldCheck, RefreshCcw, ArrowRight, ChevronDown, Plus, Minus, Loader2
} from "lucide-react";

// --- FAQ DATA ---
const faqs = [
  {
    question: "Will the silver jewelry tarnish over time?",
    answer: "Yes, 925 Sterling Silver naturally tarnishes when exposed to air and moisture. However, it's easy to clean! We provide a free silver polishing cloth with every order to keep your jewelry shining."
  },
  {
    question: "Is your jewelry authentic 925 Sterling Silver?",
    answer: "Absolutely. Every piece of jewelry we sell is crafted from high-quality 925 Sterling Silver and comes with an authenticity certificate and 925 hallmark."
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a 30-day 'No Questions Asked' return policy. If you don't love it, simply initiate a return from your profile, and we will pick it up for free."
  },
  {
    question: "How can I track my order?",
    answer: "Once shipped, you will receive a tracking link via SMS and Email. You can also track your order status in real-time from the 'My Orders' section in your profile."
  },
  {
    question: "Do you offer gift wrapping options?",
    answer: "Yes! You can select 'Make it a Gift' at checkout. We pack it in our premium signature box with a personalized message card for just ₹50 extra."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-[#FDFBF9] py-8 border-t border-rose-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-6">
          <h3 className="font-serif text-2xl md:text-3xl text-gray-900 mb-2">Frequently Asked Questions</h3>
          <p className="text-sm text-gray-500">Got questions? We've got answers.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm transition-all hover:border-rose-200">
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left cursor-pointer"
                >
                  <span className={`font-medium text-sm md:text-base ${isOpen ? 'text-rose-600' : 'text-gray-800'}`}>
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-rose-50 text-rose-600' : 'text-gray-400'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-50 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate(); // <-- Added router hook for smart navigation

  // Support Links
  const supportLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Shipping & Returns', path: '/shipping-returns' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Track Order', path: '/track-order' } // We will intercept this one
  ];

  // --- NEW: Smart Track Order Handler ---
  const handleTrackOrder = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Ask Supabase if the user is currently logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Logged in! Send them to their profile/orders page
        navigate('/profile'); 
      } else {
        // Not logged in! Send them to the login page
        navigate('/login'); 
      }
    } catch (error) {
      console.error("Auth check failed", error);
      navigate('/login'); // Fallback to login if something goes wrong
    }
  };

  // Newsletter Submission Function
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error("You are already subscribed!");
        }
        throw error;
      }

      setStatus("success");
      setMessage("Thanks for subscribing!");
      setEmail(""); 

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);

    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
      
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    }
  };

  return (
    <footer className="bg-white font-sans text-gray-600">
      
      {/* 1. FAQ SECTION */}
      <FAQSection />

      {/* 2. ASSURANCE / SERVICE PROMISE */}
      <div className="bg-rose-950 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 text-center divide-x divide-white/10">
            <div className="flex flex-col items-center gap-3 group px-2">
              <Truck size={28} strokeWidth={1.5} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-1">Free Shipping</h4>
                <p className="text-[10px] opacity-60">On all orders above ₹5000</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 group px-2">
              <ShieldCheck size={28} strokeWidth={1.5} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-1">6-Month Warranty</h4>
                <p className="text-[10px] opacity-60">On plating & stones</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 group px-2">
              <RefreshCcw size={28} strokeWidth={1.5} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-1">Easy Returns</h4>
                <p className="text-[10px] opacity-60">7-day policy</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 group px-2">
              <ShieldCheck size={28} strokeWidth={1.5} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-1">100% Certified</h4>
                <p className="text-[10px] opacity-60">Authentic 925 Silver</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN FOOTER LINKS */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <h3 className="text-logo">Sarvaa</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Designed for the modern muse. Crafting timeless silver jewelry that celebrates your unique sparkle every day.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-[0.15em] mb-6">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              {['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'New Arrivals', 'Gifting'].map((item) => (
                <li key={item}>
                  <Link to={`/category/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-rose-600 hover:pl-2 transition-all block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-[0.15em] mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  {/* --- NEW: Intercept 'Track Order' to run the auth check --- */}
                  {item.name === 'Track Order' ? (
                    <button 
                      onClick={handleTrackOrder} 
                      className="hover:text-rose-600 hover:pl-2 transition-all block text-left cursor-pointer w-full"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link to={item.path} className="hover:text-rose-600 hover:pl-2 transition-all block">
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-[0.15em] mb-6">Stay in the Loop</h4>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Subscribe to receive updates, access to exclusive deals, and more.
              </p>
              
              {/* Newsletter Form */}
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  required
                  disabled={status === "loading"}
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all pr-10 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={status === "loading"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors cursor-pointer disabled:bg-rose-400"
                >
                  {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                </button>
              </form>
              
              {/* Feedback Message */}
              {message && (
                <p className={`mt-2 text-xs font-medium ${status === "error" ? "text-red-500" : "text-green-600"}`}>
                  {message}
                </p>
              )}
            </div>
            
            <div className="mt-6 text-sm text-gray-500 space-y-2">
              <p className="flex items-center gap-2"><Phone size={14} className="text-rose-600"/> +91 98765 43210</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-rose-600"/> nakshroyalsilver@gmail.com</p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. BOTTOM BAR */}
      <div className="border-t border-gray-100 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-gray-400 font-medium">
            © 2026 Sarvaa Jewelry. Designed with <span className="text-rose-500">♥</span> in India.
          </p>
          
          <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-5" />
            <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="Mastercard" className="h-5" />
            <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" alt="PayPal" className="h-5" />
            <img src="https://cdn-icons-png.flaticon.com/512/5968/5968269.png" alt="UPI" className="h-5" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;