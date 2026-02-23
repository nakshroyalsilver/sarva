import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Mail, ShieldCheck, 
  Loader2, ArrowRight, User, Users 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Steps for the flow
type LoginStep = 'PHONE' | 'OTP' | 'DETAILS';

const LoginPage = () => {
  const navigate = useNavigate();
  
  // --- States ---
  const [step, setStep] = useState<LoginStep>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");

  // User Profile State
  const [details, setDetails] = useState({
    name: "",
    email: "",
    gender: ""
  });

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- Handlers ---

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      setTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      const existingUser = localStorage.getItem(`user_${phoneNumber}`);
      if (existingUser) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", existingUser);
        navigate("/");
      } else {
        setStep('DETAILS');
      }
    }, 1200);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const userData = {
      mobile: phoneNumber,
      ...details,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      localStorage.setItem(`user_${phoneNumber}`, JSON.stringify(userData));
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
      setIsLoading(false);
      navigate("/"); 
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); 
    setOtp(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-[#FCFCFC]">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            
            {step !== 'PHONE' && (
              <button 
                onClick={() => setStep(step === 'DETAILS' ? 'OTP' : 'PHONE')}
                className="absolute top-5 left-5 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <div className="bg-gradient-to-b from-rose-50 to-white pt-12 pb-6 text-center px-6">
              <h1 className="font-serif text-3xl text-gray-900 mb-2 italic">Sarvaa</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                {step === 'PHONE' && "Welcome to Luxury"}
                {step === 'OTP' && "Verify Identity"}
                {step === 'DETAILS' && "Create Account"}
              </p>
            </div>

            <div className="p-8 pt-2">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium">
                  {error}
                </div>
              )}

              {step === 'PHONE' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Mobile Number</label>
                    <div className="relative group">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold border-r border-gray-200 pr-3 pl-3">+91</span>
                      <input 
                        type="tel" maxLength={10} placeholder="00000 00000" 
                        className="w-full pl-14 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all font-medium"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading || phoneNumber.length !== 10} className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 disabled:bg-gray-100 flex items-center justify-center gap-2 transition-all">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Get OTP <ArrowRight size={16} /></>}
                  </button>
                </form>
              )}

              {step === 'OTP' && (
                <form onSubmit={handleVerifyOtp} className="space-y-8">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx} ref={(el) => (otpRefs.current[idx] = el)}
                        type="text" maxLength={1}
                        className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold outline-none transition-all ${digit ? "border-rose-500 bg-rose-50/30 text-rose-600" : "border-gray-100 focus:border-rose-500"}`}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                      />
                    ))}
                  </div>
                  <div className="space-y-4 text-center">
                    <button type="submit" disabled={isLoading || otp.join("").length !== 4} className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 disabled:bg-gray-100 flex items-center justify-center gap-2 transition-all">
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Verify & Continue"}
                    </button>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {timer > 0 ? `Resend in ${timer}s` : <button type="button" onClick={() => setTimer(30)} className="text-rose-600 font-bold hover:underline transition-all">Resend Code</button>}
                    </p>
                  </div>
                </form>
              )}

              {step === 'DETAILS' && (
                <form onSubmit={handleSaveDetails} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required type="text" placeholder="Full Name" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all"
                        value={details.name}
                        onChange={(e) => setDetails({...details, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required type="email" placeholder="email@example.com" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all"
                        value={details.email}
                        onChange={(e) => setDetails({...details, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Gender</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select 
                        required 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all appearance-none bg-white font-medium text-gray-700"
                        value={details.gender}
                        onChange={(e) => setDetails({...details, gender: e.target.value})}
                      >
                        <option value="">Select Gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full mt-4 bg-rose-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 flex items-center justify-center gap-2 transition-all">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Complete Profile"}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-2 text-green-700 bg-green-50 py-2 rounded-xl mx-[-10px] mb-[-10px]">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure SSL Login</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;