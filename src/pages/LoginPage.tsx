import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ShieldCheck, Loader2, User, Users, Lock, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "../../supabase"; 
import { Helmet } from "react-helmet-async";
import { analytics } from "@/lib/analytics"; // <-- NEW: Analytics Import

// --- 1. SUPER INITIALIZATION: Catch the clue before Supabase erases it ---
if (typeof window !== "undefined") {
  const url = window.location.href;
  if (url.includes("type=recovery") || url.includes("reset=true")) {
    sessionStorage.setItem("isRecovering", "true");
  }
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Instantly initialize from our bulletproof memory check
  const [isUpdatePassword, setIsUpdatePassword] = useState(() => {
    return sessionStorage.getItem("isRecovering") === "true";
  }); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", gender: ""
  });

  // --- 2. TAB-ISOLATED LISTENER ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const isRecovering = sessionStorage.getItem("isRecovering") === "true";

      if (event === 'PASSWORD_RECOVERY') {
        if (isRecovering) {
          setIsUpdatePassword(true);
          setIsForgotPassword(false);
          setIsSignUp(false);
        }
      } else if (event === 'SIGNED_IN') {
        // Dynamic redirect: Catch Google Auth and standard logins instantly
        if (!isRecovering && !isForgotPassword) {
          handlePostLoginRouting();
        }
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, isForgotPassword]);

  // --- Handlers ---
  const handlePostLoginRouting = () => {
    const pendingShipping = localStorage.getItem("pending_save_shipping");
    if (pendingShipping) {
      localStorage.setItem("saved_shipping_address", pendingShipping);
      localStorage.removeItem("pending_save_shipping");
    }

    const pendingBilling = localStorage.getItem("pending_save_billing");
    if (pendingBilling) {
      localStorage.setItem("checkout_billing", pendingBilling);
      localStorage.removeItem("pending_save_billing");
    }

    const pendingSameAs = localStorage.getItem("pending_billing_same");
    if (pendingSameAs) {
      localStorage.setItem("checkout_billing_same", pendingSameAs);
      localStorage.removeItem("pending_billing_same");
    }

    localStorage.setItem("checkout_step", "3");

    // Redirect defaults to Home Page ("/")
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get("redirect") || "/"; 
    
    setTimeout(() => navigate(redirectUrl), 800);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/login?reset=true`, 
      });
      if (error) throw error;
      
      setSuccessMsg("Password reset link sent! Please check your email inbox (and spam folder).");
      
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
    } catch (err: any) {
      console.error("Reset Error:", err);
      if (err.message?.includes("rate limit")) {
        setError("You've requested too many emails. Please wait a few minutes and try again.");
      } else {
        setError(err.message || "Failed to send reset link. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;

      // Safely sign out the hidden session so they HAVE to log in manually
      try {
        await Promise.race([
          supabase.auth.signOut(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
        ]);
      } catch (err) {
        console.warn("Backend logout lock ignored.");
      }
      
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("isRecovering");

      if (window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      // 1. Switch back to the standard Login Form
      setIsUpdatePassword(false);
      setIsForgotPassword(false);
      setIsSignUp(false);
      setFormData({ name: "", email: "", password: "", gender: "" });
      
      // 2. Show the success message and STAY on this page
      setSuccessMsg("Password updated successfully! Please log in with your new password.");

    } catch (err: any) {
      console.error("Update Password Error:", err);
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email, 
          password: formData.password,
          options: {
            data: { full_name: formData.name } 
          }
        });
        
        if (signUpError) throw signUpError;

        if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
          setError("An account with this email already exists. Please log in.");
          setIsLoading(false);
          return;
        }

        if (authData.user && !authData.session) {
          setSuccessMsg("Success! Please check your email to verify your account.");
          setIsLoading(false);
          return; 
        }

        const userData = { email: formData.email, name: formData.name, gender: formData.gender };
        
        const { error: insertError } = await supabase.from('customers').insert([userData]);
        if (insertError) console.error("Profile creation sync warning:", insertError);

        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("isLoggedIn", "true");

        // --- NEW: Track Sign Up for Google Analytics ---
        analytics.trackSignUp("Email");

        setSuccessMsg("Account created! Redirecting...");
        handlePostLoginRouting();

      } else {
        // 1. Sign In
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email, password: formData.password,
        });
        if (signInError) throw signInError;

        // 2. Fetch the real name from the Database
        const { data: customerData } = await supabase.from('customers').select('*').eq('email', formData.email).single();

        // 3. Determine the correct name
        const realName = customerData?.name || authData.user?.user_metadata?.full_name || formData.email.split('@')[0];

        // 4. If Auth Metadata is missing the name, permanently fix it
        if (!authData.user?.user_metadata?.full_name && realName !== formData.email.split('@')[0]) {
           supabase.auth.updateUser({ data: { full_name: realName } }).catch(() => {});
        }

        // 5. Save the final, correct data
        const finalUserData = { email: formData.email, name: realName, ...(customerData || {}) };
        localStorage.setItem("currentUser", JSON.stringify(finalUserData));
        localStorage.setItem("isLoggedIn", "true");
        
        // --- NEW: Track Login for Google Analytics ---
        analytics.trackLogin("Email");

        setSuccessMsg("Welcome back! Redirecting...");
        handlePostLoginRouting();
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
        <title>{isUpdatePassword ? "Create New Password" : isForgotPassword ? "Reset Password" : isSignUp ? "Sign Up" : "Login"} | Sarvaa Fine Jewelry</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-[#FCFCFC]">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="bg-gradient-to-b from-rose-50 to-white pt-12 pb-6 text-center px-6">
              <h1 className="text-logo mb-2">Sarvaa</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-2">
                {isUpdatePassword ? "Secure your account" : isForgotPassword ? "Reset your password" : isSignUp ? "Create your account" : "Welcome to Luxury"}
              </p>
            </div>

            <div className="p-8 pt-2">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium">{error}</div>}
              {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-lg text-center font-medium">{successMsg}</div>}

              {/* Hide Google Login if we are in Reset OR Update mode */}
              {!isForgotPassword && !isUpdatePassword && (
                <>
                  <button onClick={handleGoogleLogin} disabled={isLoading} type="button" className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    <span className="text-sm">Continue with Google</span>
                  </button>

                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-100"></div>
                    <span className="px-3 text-[10px] uppercase font-bold text-gray-300 tracking-widest">or</span>
                    <div className="flex-1 border-t border-gray-100"></div>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM RENDERING */}
              {isUpdatePassword ? (
                /* --- UPDATE PASSWORD FORM --- */
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Enter New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input required type="password" placeholder="••••••••" minLength={6} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full mt-2 bg-rose-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Password"}
                  </button>

                  {/* CANCEL BUTTON: Kills Ghost Session */}
                  <div className="mt-4 text-center">
                    <button type="button" onClick={() => { 
                      setIsUpdatePassword(false); 
                      sessionStorage.removeItem("isRecovering");
                      if (window.history.replaceState) window.history.replaceState(null, "", window.location.pathname);
                      setError(""); 
                      setSuccessMsg(""); 
                      supabase.auth.signOut().catch(() => {});
                    }} className="text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                      <ArrowLeft size={14} /> Cancel Reset
                    </button>
                  </div>
                </form>

              ) : isForgotPassword ? (
                /* --- FORGOT PASSWORD FORM --- */
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Enter your Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input required type="email" placeholder="email@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full mt-2 bg-rose-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Send Reset Link"}
                  </button>

                  <div className="mt-4 text-center">
                    <button type="button" onClick={() => { setIsForgotPassword(false); setError(""); setSuccessMsg(""); }} className="text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer">
                      <ArrowLeft size={14} /> Back to Login
                    </button>
                  </div>
                </form>

              ) : (
                /* --- NORMAL LOGIN / SIGNUP FORM --- */
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input required type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input required type="email" placeholder="email@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between pl-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                      {!isSignUp && (
                        <button 
                          type="button" 
                          onClick={() => { setIsForgotPassword(true); setError(""); setSuccessMsg(""); }} 
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input required type="password" placeholder="••••••••" minLength={6} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Gender</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all appearance-none bg-white font-medium text-gray-700 cursor-pointer" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                          <option value="">Select Gender</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} className="w-full mt-2 bg-rose-600 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
                  </button>
                </form>
              )}

              {/* Hide the toggle buttons if we are in Forgot Password or Update Password mode */}
              {!isForgotPassword && !isUpdatePassword && (
                <div className="mt-6 text-center">
                  <button onClick={() => { setIsSignUp(!isSignUp); setError(""); setFormData({ name: "", email: "", password: "", gender: "" }); }} className="text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors cursor-pointer">
                    {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center gap-2 text-green-700 bg-green-50 py-2 rounded-xl mx-[-10px] mb-[-10px]">
                <ShieldCheck size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Secure SSL Encryption</span>
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