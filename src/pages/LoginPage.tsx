import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Mail, ShieldCheck, Loader2, ArrowRight, User, Users, Lock 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "../../supabase"; 
import { Helmet } from "react-helmet-async";

const LoginPage = () => {
  const navigate = useNavigate();
  
  // --- States ---
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: ""
  });

  // --- Handlers ---

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        // 1. Sign Up using Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;

        // 2. Save additional details to your custom 'customers' table
        const userData = {
          email: formData.email,
          name: formData.name,
          gender: formData.gender
        };

        const { error: insertError } = await supabase
          .from('customers')
          .insert([userData]);
        
        if (insertError) console.error("Error saving customer profile:", insertError);

        // 3. Keep local storage active for your existing app logic
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("isLoggedIn", "true");

        setSuccessMsg("Account created! Taking you to the store...");
        setTimeout(() => navigate("/"), 1000);

      } else {
        // 1. Log In using Supabase Auth
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        // 2. Fetch their details from the customers table
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('email', formData.email)
          .single();

        // 3. Keep local storage active
        localStorage.setItem("currentUser", JSON.stringify(customerData || { email: formData.email, name: formData.email.split('@')[0] }));
        localStorage.setItem("isLoggedIn", "true");

        navigate("/");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
       <Helmet>
         <title>{isSignUp ? "Sign Up" : "Login"} | Sarvaa Fine Jewelry</title>
         <meta name="robots" content="noindex, nofollow" />
       </Helmet>

      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-[#FCFCFC]">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            
            {/* Header section */}
            <div className="bg-gradient-to-b from-rose-50 to-white pt-12 pb-6 text-center px-6">
              <h1 className="font-serif text-3xl text-gray-900 mb-2 italic">Sarvaa</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                {isSignUp ? "Create your account" : "Welcome to Luxury"}
              </p>
            </div>

            <div className="p-8 pt-2">
              
              {/* Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-lg text-center font-medium">
                  {successMsg}
                </div>
              )}

              {/* Google Button */}
              <button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span className="text-sm">Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-100"></div>
                <span className="px-3 text-[10px] uppercase font-bold text-gray-300 tracking-widest">or</span>
                <div className="flex-1 border-t border-gray-100"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required 
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      required 
                      type="email" 
                      placeholder="email@example.com" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      required 
                      type="password" 
                      placeholder="••••••••" 
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Gender</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select 
                        required 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all appearance-none bg-white font-medium text-gray-700 cursor-pointer"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="">Select Gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full mt-2 bg-rose-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
                </button>
              </form>

              {/* Toggle Login/Signup */}
              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setFormData({ name: "", email: "", password: "", gender: "" });
                  }}
                  className="text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                </button>
              </div>

              {/* SSL Badge */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center gap-2 text-green-700 bg-green-50 py-2 rounded-xl mx-[-10px] mb-[-10px]">
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