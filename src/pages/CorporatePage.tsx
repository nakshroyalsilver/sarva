import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const CorporatePage: React.FC = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 🛡️ BULLETPROOF SCROLL FIX
  useEffect(() => {
    const scrollToTop = () => {
      topRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      window.scrollTo(0, 0);
    };
    scrollToTop();
    const timeoutId = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would normally send this to your backend/database
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <>
      <div ref={topRef} className="absolute top-0 left-0 w-full h-0 pointer-events-none" aria-hidden="true" />
      
      <div className="min-h-screen flex flex-col bg-[#FCFCFC] font-sans text-gray-900">
        <Navbar />

        {/* --- HERO SECTION --- */}
        <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-24 px-6 relative overflow-hidden">
          
          {/* Subtle Background Accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-50/50 rounded-full blur-[100px] pointer-events-none -z-10"></div>

          <div className="max-w-3xl w-full text-center bg-white border border-gray-100 p-10 md:p-16 shadow-xl shadow-rose-900/5 relative z-10">
            
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
              <Briefcase size={24} strokeWidth={1.5} />
            </div>

            <div className="mb-6">
              <span className="text-[10px] font-bold tracking-[0.3em] text-rose-600 uppercase">
                Corporate & B2B
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 tracking-wide leading-tight">
              Elevate Your Corporate Gifting.
            </h1>

            {/* Minimalist Divider */}
            <div className="w-12 h-[1px] bg-gray-300 mx-auto mb-8"></div>

            <p className="text-gray-500 text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed">
              We are currently crafting an exclusive corporate portal designed for seamless bulk ordering, bespoke customization, and dedicated account management. 
            </p>

            {/* --- EMAIL CAPTURE FORM --- */}
            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={32} className="text-emerald-500" />
                <div>
                  <h3 className="font-serif text-lg tracking-wide mb-1">Thank you.</h3>
                  <p className="text-xs font-medium tracking-wide uppercase text-emerald-600/80">
                    Our concierge team will reach out to you shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
                  Request a consultation
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Business Email" 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-11 py-3.5 focus:outline-none focus:border-rose-400 focus:bg-white transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-rose-600 transition-colors shrink-0"
                  >
                    Submit <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center justify-center gap-4">
              <p className="text-xs text-gray-400">
                Need immediate assistance?
              </p>
              <Link 
                to="/contact" 
                className="text-xs font-bold uppercase tracking-[0.1em] text-gray-900 border-b border-gray-900 pb-0.5 hover:text-rose-600 hover:border-rose-600 transition-colors"
              >
                Contact Us Directly
              </Link>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CorporatePage;