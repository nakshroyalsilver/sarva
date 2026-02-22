import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const LoginPage = () => {
  const navigate = useNavigate();
  
  // --- States ---
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");

  // Refs for OTP inputs to manage focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Timer Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- Handlers ---

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    
    setError("");
    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      setTimer(30);
      // Auto-focus first OTP input after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1000);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate Verification
    setTimeout(() => {
      setIsLoading(false);
      // Login Successful -> Redirect to Home
      navigate("/"); 
    }, 1500);
  };

  // Handle OTP Input Logic (Type & Backspace)
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); 
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-[#FCFCFC]">
        <div className="w-full max-w-sm">
          
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
            
            {/* Back Button (Only visible in OTP step) */}
            {step === 'OTP' && (
              <button 
                onClick={() => setStep('PHONE')}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            {/* Header Section */}
            <div className="bg-gradient-to-b from-rose-50 to-white pt-10 pb-6 text-center px-6">
              <h1 className="font-serif text-2xl text-gray-900 mb-2">
                {step === 'PHONE' ? "Unlock Best Prices" : "Verify OTP"}
              </h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                {step === 'PHONE' 
                  ? "Log in to access your wishlist & orders" 
                  : `Sent to +91 ${phoneNumber}`
                }
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8 pt-2">
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium text-center">
                  {error}
                </div>
              )}

              {step === 'PHONE' ? (
                /* --- STEP 1: PHONE FORM --- */
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Mobile Number</label>
                    <div className="relative group">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium border-r border-gray-300 pr-3 pl-3">+91</span>
                      <input 
                        type="tel" 
                        maxLength={10}
                        placeholder="Enter 10-digit number" 
                        className="w-full pl-14 pr-4 py-3.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all bg-white text-gray-900 font-medium placeholder-gray-300"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/\D/g, ''));
                          setError("");
                        }}
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading || phoneNumber.length !== 10}
                    className="w-full bg-rose-600 text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-100 active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
                  </button>

                  {/* Social Login Dividers */}
                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <span className="relative bg-white px-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">Or Login With</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-lg hover:bg-[#F0FDF4] hover:border-green-200 transition-all text-xs font-semibold text-gray-600 hover:text-green-700">
                      <MessageCircle size={16} className="text-green-600" /> WhatsApp
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-lg hover:bg-[#EFF6FF] hover:border-blue-200 transition-all text-xs font-semibold text-gray-600 hover:text-blue-700">
                      <Mail size={16} className="text-blue-600" /> Google
                    </button>
                  </div>
                </form>
              ) : (
                /* --- STEP 2: OTP FORM --- */
                <form onSubmit={handleVerifyOtp} className="space-y-8">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        className={`w-12 h-14 border rounded-xl text-center text-xl font-bold outline-none transition-all ${
                          digit 
                            ? "border-rose-500 bg-rose-50/30 text-rose-600" 
                            : "border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-50"
                        }`}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                      />
                    ))}
                  </div>

                  <div className="text-center space-y-4">
                      <button 
                        type="submit" 
                        disabled={isLoading || otp.join("").length !== 4}
                        className="w-full bg-rose-600 text-white py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Verify & Login"}
                      </button>
                      
                      <div className="text-xs text-gray-500 font-medium">
                        {timer > 0 ? (
                          <span>Resend code in <span className="text-rose-600 font-bold">00:{timer < 10 ? `0${timer}` : timer}</span></span>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => { setTimer(30); /* Trigger resend API */ }}
                            className="text-rose-600 font-bold hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                  </div>
                </form>
              )}

              {/* Secure Footer */}
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-2 text-green-700 bg-green-50/50 py-2 rounded-lg mx-[-10px] mb-[-10px]">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wide">100% Secure Login</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Help Text */}
          <p className="text-center text-[10px] text-gray-400 mt-6">
            By continuing, you agree to our <Link to="/terms" className="underline hover:text-gray-600">Terms</Link> & <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;