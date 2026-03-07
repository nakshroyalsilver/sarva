import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, Heart, ShoppingBag, User, Menu, X, 
  ChevronRight, ChevronDown, MapPin, 
  TrendingUp, Sparkles, FolderSearch, Package,
  Edit2, Trash2, Check 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext"; 
import { supabase } from "../../../supabase"; 

const staticLeftCategories = [
  { name: "New Arrivals", path: "/category/new", highlight: true, featuredImg: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400&q=80" },
];

const staticRightCategories = [
  { name: "Gifts", path: "/category/gifts", highlight: true, featuredImg: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&q=80" },
  { name: "Corporate", path: "/corporate", featuredImg: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=400&q=80" },
];

const searchPlaceholders = ["Search for Rings...", "Search for Diamonds...", "Search for Necklaces...", "Search for 925 Silver..."];

const Navbar = () => {
  const { cartCount, wishlistCount } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pincode, setPincode] = useState(localStorage.getItem("user_pincode") || "Select Location");
  const [tempPincode, setTempPincode] = useState("");

  // --- NEW: PROFILE MODAL STATES ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ firstName: "", lastName: "", flat: "", street: "", city: "", state: "", pincode: "" });

  const [navCategories, setNavCategories] = useState<any[]>([...staticLeftCategories, ...staticRightCategories]);
  const [categoryLinks, setCategoryLinks] = useState<{name: string, path: string}[]>([]);

  // Search Logic
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Search States
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [allAvailableSuggestions, setAllAvailableSuggestions] = useState<string[]>([]); 

  // Announcement Bar Logic
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: true });
      if (data) setAnnouncements(data);
    }
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return; 
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [announcements.length]);

  useEffect(() => {
    async function fetchNavData() {
      const { data: catData } = await supabase.from('categories').select('*').eq('is_visible', true).order('created_at', { ascending: true });

      let catNames: string[] = [];
      if (catData) {
        const dbCategories = catData.map(cat => ({
          name: cat.name,
          path: `/category/${cat.slug}`,
          featuredImg: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80", 
          subCats: null 
        }));

        const combinedNav = [...staticLeftCategories, ...dbCategories, ...staticRightCategories];
        setNavCategories(combinedNav);
        setCategoryLinks(combinedNav.map(c => ({ name: c.name, path: c.path })));
        catNames = catData.map(c => c.name);
      }

      const { data: allProds } = await supabase.from('products').select('title');
      if (allProds) {
        const productNames = allProds.map(p => p.title);
        setAllAvailableSuggestions([...new Set([...catNames, ...productNames])]);
      }

      const { data: prodData } = await supabase
        .from('products')
        .select('id, title, price, image_url, image_urls, categories(name)')
        .order('created_at', { ascending: false }) 
        .limit(10);

      if (prodData) {
        const formattedProducts = prodData.slice(0, 4).map((p: any) => ({
          id: p.id,
          name: p.title,
          price: `₹${p.price?.toLocaleString() || 0}`,
          category: Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name || "",
          img: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
        }));
        setTrendingProducts(formattedProducts);
      }

      const { data: trendingSearches } = await supabase
        .from('search_analytics')
        .select('search_term')
        .order('search_count', { ascending: false })
        .limit(5);

      if (trendingSearches && trendingSearches.length > 0) {
        setPopularSearches(trendingSearches.map(s => s.search_term));
      } else {
        setPopularSearches(["Diamond Rings", "Gold Chains", "Bridal Sets", "Mangalsutra"]);
      }
    }
    fetchNavData();
  }, []);

 useEffect(() => {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) setUser(JSON.parse(storedUser));

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    // Check if we are in a recovery flow RIGHT NOW
    const isRecovering = window.location.hash.includes("type=recovery") || 
                         window.location.search.includes("reset=true");

    if (event === 'SIGNED_IN' && session?.user) {
      // IF RECOVERING: Do NOT save to localStorage. Just stay quiet.
      if (isRecovering) return; 

      const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
      const userData = { name: userName, email: session.user.email };
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isLoggedIn");
    }
  });
  return () => subscription.unsubscribe();
}, []);
  const handleLogout = async () => {
    // 1. Instantly clear the frontend so the UI feels blazing fast
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    setUser(null);
    setIsProfileModalOpen(false);
    navigate("/"); 

    // 2. Tell Supabase to sign out in the background (with a 2-second crash-proof timeout)
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
      ]);
    } catch (err) {
      console.warn("Supabase backend logout skipped due to lock, but local session cleared.");
    }
  };

  useEffect(() => {
    const handlePincodeUpdate = () => {
      const savedPin = localStorage.getItem("user_pincode");
      if (savedPin) setPincode(savedPin);
    };
    window.addEventListener("pincodeUpdated", handlePincodeUpdate);
    return () => window.removeEventListener("pincodeUpdated", handlePincodeUpdate);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3500); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPincode.length === 6) {
      localStorage.setItem("user_pincode", tempPincode);
      setPincode(tempPincode);
      setIsLocationModalOpen(false);
      setTempPincode("");
      window.dispatchEvent(new Event("pincodeUpdated"));
    }
  };

  const logSearchQuery = async (term: string) => {
    if (!term || term.trim() === "") return;
    try {
      await supabase.rpc('increment_search_count', { term_input: term.toLowerCase().trim() });
    } catch (e) {}
  };

  const handleSearchSubmit = (e?: React.FormEvent, selectedPath?: string, exactTerm?: string) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    setMobileSearchOpen(false); 

    const termToLog = exactTerm || searchQuery;
    if (termToLog) logSearchQuery(termToLog);

    if (selectedPath) {
      navigate(selectedPath); 
    } else {
      if (searchQuery.trim() !== "") {
         navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
      }
    }
    setSearchQuery(""); 
  };

  // --- NEW: PROFILE MODAL HANDLERS ---
  const openProfileModal = () => {
    const address = localStorage.getItem("saved_shipping_address");
    if (address) {
      const parsed = JSON.parse(address);
      setSavedAddress(parsed);
      setAddressForm(parsed);
    }
    setIsProfileModalOpen(true);
    setMobileMenuOpen(false); 
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("saved_shipping_address", JSON.stringify(addressForm));
    setSavedAddress(addressForm);
    setIsEditingAddress(false);
  };

  const handleDeleteAddress = () => {
    localStorage.removeItem("saved_shipping_address");
    setSavedAddress(null);
    setAddressForm({ firstName: "", lastName: "", flat: "", street: "", city: "", state: "", pincode: "" });
  };

  const filteredSearches = searchQuery 
    ? allAvailableSuggestions.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : popularSearches.slice(0, 4); 

  const filteredCategories = searchQuery
    ? categoryLinks.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : categoryLinks.slice(0, 3);

  const filteredProducts = searchQuery
    ? trendingProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : trendingProducts.slice(0, 3);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 font-sans">
        
        {announcements.length > 0 && (
          <div className="bg-gradient-to-r from-rose-50 via-[#FFF0F5] to-rose-50 text-rose-950 text-center text-xs sm:text-sm tracking-widest font-bold border-b border-rose-100 overflow-hidden relative h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={announcementIndex}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                className="absolute w-full"
              >
                {announcements[announcementIndex]?.message}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className="container mx-auto px-6 relative z-30 bg-white">
          <div className="flex lg:hidden items-center justify-between h-14">
            <button 
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileSearchOpen(false); }} 
              className="text-gray-800 p-1 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
            <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-logo">Sarvaa</h1>
            </Link>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileMenuOpen(false); }} 
                className="text-gray-800 cursor-pointer"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <Link to="/wishlist"><Heart size={20} strokeWidth={1.5} /></Link>
              <Link to="/cart" className="relative">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
              </Link>
            </div>
          </div>

          {/* MOBILE SEARCH BAR DROPDOWN */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden"
              >
                 <div className="py-3 border-t border-gray-100">
                   <form 
                     onSubmit={(e) => { setMobileSearchOpen(false); handleSearchSubmit(e); }} 
                     className="relative"
                   >
                     <input 
                       type="text"
                       autoFocus
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Search for jewelry..."
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-rose-400"
                     />
                     <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                   </form>

                   {searchQuery && filteredSearches.length > 0 && (
                     <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-sm p-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredSearches.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setMobileSearchOpen(false);
                              handleSearchSubmit(undefined, `/search-results?q=${encodeURIComponent(suggestion)}`, suggestion);
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-rose-50 rounded-lg flex items-center gap-3 cursor-pointer transition-colors"
                          >
                            <Search size={12} className="text-gray-300" />
                            <span><span className="font-bold text-rose-600">{suggestion.substring(0, searchQuery.length)}</span>{suggestion.substring(searchQuery.length)}</span>
                          </button>
                        ))}
                     </div>
                   )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden lg:flex items-center justify-between h-20 gap-6">
            <div className="w-56 flex-shrink-0">
              <Link to="/" className="inline-block">
                <h1 className="text-logo hover:opacity-80 transition-opacity">
                  Sarvaa
                </h1>
              </Link>
            </div>

            <div className="flex-1 flex justify-center relative" ref={searchContainerRef}>
              <div className="w-full max-w-xl relative">
                <form 
                  onSubmit={handleSearchSubmit}
                  className={`w-full h-11 bg-gray-50 rounded-full border flex items-center overflow-hidden relative transition-all z-50 ${isSearchFocused ? 'border-rose-500 bg-white shadow-md ring-4 ring-rose-50' : 'border-gray-300'}`}
                >
                  <div className="absolute inset-0 flex items-center pl-5 pointer-events-none">
                    <AnimatePresence mode="wait">
                      {!searchQuery && !isSearchFocused && (
                        <motion.span
                          key={searchPlaceholders[placeholderIndex]}
                          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                          className="text-gray-400 text-sm"
                        >
                          {searchPlaceholders[placeholderIndex]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full pl-5 pr-12 bg-transparent text-gray-900 text-sm outline-none relative z-10 placeholder-transparent font-medium"
                    placeholder={isSearchFocused ? "Search for rings, earrings, diamonds..." : ""}
                  />
                  <button type="submit" className="absolute right-1 w-9 h-9 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-all z-20 cursor-pointer">
                    <Search size={16} strokeWidth={2} />
                  </button>
                </form>

                <AnimatePresence>
                  {isSearchFocused && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-40 flex flex-col gap-5"
                    >
                      {(filteredSearches.length > 0) && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-rose-500" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              {searchQuery ? "Suggested for you" : "Trending Searches"}
                            </h4>
                          </div>
                          <ul className="space-y-1">
                            {filteredSearches.map((suggestion, idx) => (
                              <li key={idx}>
                                <button
                                  type="button"
                                  onClick={() => handleSearchSubmit(undefined, `/search-results?q=${encodeURIComponent(suggestion)}`, suggestion)} 
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors flex items-center gap-3 cursor-pointer"
                                >
                                  <Search size={12} className="text-gray-300" />
                                  {searchQuery ? (
                                    <span><span className="font-bold text-rose-600">{suggestion.substring(0, searchQuery.length)}</span>{suggestion.substring(searchQuery.length)}</span>
                                  ) : suggestion}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(filteredCategories.length > 0) && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FolderSearch size={14} className="text-rose-500" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Categories</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {filteredCategories.map((cat, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSearchSubmit(undefined, cat.path)} 
                                className="px-3 py-1.5 bg-gray-50 border border-gray-100 hover:border-rose-200 text-xs font-semibold text-gray-600 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-2 mb-3 mt-1">
                          <Sparkles size={14} className="text-rose-500" />
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {searchQuery ? "Matching Products" : "Trending Products"}
                          </h4>
                        </div>
                        {filteredProducts.length > 0 ? (
                          <div className="space-y-3">
                            {filteredProducts.map((product) => (
                              <button 
                                key={product.id}
                                onClick={() => handleSearchSubmit(undefined, `/product/${product.id}`)} 
                                className="w-full flex items-center gap-4 group text-left px-2 py-1.5 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              >
                                <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                                  <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-800 group-hover:text-rose-600 transition-colors line-clamp-1">{product.name}</h5>
                                  <p className="text-xs font-bold text-rose-600 mt-0.5">{product.price}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center py-4">
                            <p className="text-gray-400 text-sm">No products found for "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="w-auto flex-shrink-0 flex items-center justify-end gap-6">
              <button 
                onClick={() => setIsLocationModalOpen(true)} 
                className="flex items-center gap-2 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-rose-100"
              >
                <div className="text-gray-500 group-hover:text-rose-600 transition-colors">
                  <MapPin size={22} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Deliver to</span>
                  <span className="text-[13px] font-bold text-gray-900 group-hover:text-rose-700 leading-none">
                    {pincode !== "Select Location" ? pincode : "Select Pincode"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-gray-400 group-hover:text-rose-600 mt-3" />
              </button>

              <div className="w-px h-8 bg-gray-200 mx-1"></div>

              <div className="flex items-center gap-5">
                {user ? (
                  <div className="group relative flex items-center gap-1 cursor-pointer py-2">
                    <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-sm font-bold uppercase border border-rose-200 transition-colors group-hover:bg-rose-600 group-hover:text-white">
                      {user.name.charAt(0)}
                    </div>
                    {/* DROPDOWN MENU */}
                    <div className="absolute top-full right-0 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Welcome</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                      </div>
                      
                      {/* --- NEW: OPENS MODAL DIRECTLY FROM DROPDOWN --- */}
                      <button onClick={openProfileModal} className="w-full text-left block px-4 py-2 text-xs font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
                        Profile & Address
                      </button>
                      {/* ------------------------------------------------ */}

                      <Link to="/my-orders" className="block px-4 py-2 text-xs font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-600">My Orders</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-gray-50 mt-1 pt-3 cursor-pointer">Logout</button>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="text-gray-700 hover:text-rose-600 transition-colors">
                    <User size={24} strokeWidth={1.5} />
                  </Link>
                )}
                <Link to="/wishlist" className="text-gray-700 hover:text-rose-600 transition-colors relative">
                  <Heart size={24} strokeWidth={1.5} />
                  {wishlistCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">{wishlistCount}</span>}
                </Link>
                <Link to="/cart" className="text-gray-700 hover:text-rose-600 transition-colors relative">
                  <ShoppingBag size={24} strokeWidth={1.5} />
                  {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">{cartCount}</span>}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <nav className="hidden lg:block border-t border-gray-200 relative bg-white z-10" onMouseLeave={() => setActiveCategory(null)}>
          <div className="container mx-auto px-6 flex items-center justify-center h-12">
            <ul className="flex items-center gap-8">
              {navCategories.map((cat) => (
                <li key={cat.path} className="h-12 flex items-center" onMouseEnter={() => setActiveCategory(cat.name)}>
                  <Link to={cat.path} className={`text-xs uppercase tracking-wider font-bold transition-all duration-200 hover:text-rose-600 relative py-3 flex items-center gap-0.5 group ${cat.highlight ? "text-rose-600" : "text-gray-700"}`}>
                    {cat.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-rose-500 group-hover:w-full transition-all duration-200 ease-out" />
                    {cat.subCats && <ChevronDown size={12} className={`transition-transform duration-200 text-gray-400 group-hover:text-rose-600 ${activeCategory === cat.name ? "rotate-180" : ""}`} />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <AnimatePresence>
            {activeCategory && navCategories.find(c => c.name === activeCategory)?.subCats && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-2xl py-10 z-0">
                <div className="container mx-auto px-12">
                  <div className="flex justify-center gap-24">
                    <div className="w-56">
                      <h3 className="text-xs font-extrabold text-rose-950 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">By Category</h3>
                      <ul className="space-y-4">
                        {navCategories.find(c => c.name === activeCategory)?.subCats?.map((sub: string) => (
                          <li key={sub}><Link to="#" className="text-sm text-gray-700 hover:text-rose-600 font-semibold">{sub}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-56">
                      <h3 className="text-xs font-extrabold text-rose-950 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">By Price</h3>
                      <ul className="space-y-4">
                        {["Under ₹999", "₹1000 - ₹2999", "₹3000 - ₹4999", "Above ₹5000"].map((price) => (
                          <li key={price}><Link to="#" className="text-sm text-gray-700 hover:text-rose-600 font-semibold">{price}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-72 h-52 rounded-xl overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                      <img src={navCategories.find(c => c.name === activeCategory)?.featuredImg} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-colors" />
                      <div className="absolute bottom-5 left-5 text-white">
                        <p className="text-sm font-bold uppercase tracking-widest mb-1 drop-shadow-md">Best Seller</p>
                        <div className="flex items-center gap-2"><span className="text-xs font-medium">Shop Now</span><ChevronRight size={14} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="lg:hidden fixed inset-0 top-[110px] bg-white z-50 overflow-y-auto pb-20 border-t border-gray-100">
              {user ? (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold uppercase">{user.name.charAt(0)}</div>
                       <div>
                         <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Welcome Back</p>
                         <p className="text-sm font-bold text-gray-900">{user.name}</p>
                       </div>
                    </div>
                    <button onClick={handleLogout} className="text-xs font-bold text-rose-600 px-3 py-1.5 bg-rose-50 rounded-md hover:bg-rose-100 cursor-pointer">Logout</button>
                  </div>
                  
                  {/* --- NEW: MOBILE OPENS MODAL DIRECTLY --- */}
                  <button onClick={openProfileModal} className="w-full px-6 py-3.5 bg-white border-b border-gray-100 text-sm font-bold text-gray-700 hover:text-rose-600 flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2"><User size={16} className="text-rose-500"/> Profile & Address</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                  {/* ----------------------------------------- */}

                  <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="block px-6 py-3.5 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-700 hover:text-rose-600 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Package size={16} className="text-rose-500"/> Track My Orders</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                </>
              ) : (
                <div className="p-4 border-b border-gray-100 bg-white">
                   <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full bg-rose-600 hover:bg-rose-700 transition-colors text-white font-bold text-sm py-2.5 rounded-lg flex items-center justify-center">Login / Sign Up</Link>
                </div>
              )}
              
              <div className="bg-gray-50 mx-4 my-4 rounded-xl p-3.5 flex items-center justify-between border border-gray-200 cursor-pointer active:bg-gray-100 transition-colors" onClick={() => setIsLocationModalOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 border border-gray-100">
                      <MapPin size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Delivery Location</span>
                      <span className="text-sm font-extrabold text-gray-900">{pincode !== "Select Location" ? pincode : "Select Pincode"}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-lg">Change</span>
              </div>

              <div className="flex flex-col p-6 space-y-2">
                {navCategories.map((cat) => (
                  <div key={cat.path} className="border-b border-gray-50 last:border-none">
                    <Link to={cat.path} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-4 text-gray-800 hover:text-rose-600 transition-colors">
                      <span className={`text-base tracking-wide font-medium ${cat.highlight ? "text-rose-600" : ""}`}>{cat.name}</span>
                      <ChevronRight size={18} className="text-gray-300" />
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- NEW: PROFILE & ADDRESS MODAL --- */}
      <AnimatePresence>
        {isProfileModalOpen && user && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 font-sans">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#FCFCFC] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
              
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
                 <h3 className="font-serif text-xl text-gray-900">My Profile</h3>
                 <button onClick={() => setIsProfileModalOpen(false)} className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-colors cursor-pointer"><X size={18}/></button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                 {/* User Info Card */}
                 <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
                   <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-xl font-bold uppercase border border-rose-100 shrink-0">
                     {user.name.charAt(0)}
                   </div>
                   <div>
                     <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Account Details</p>
                     <p className="font-bold text-gray-900 text-base">{user.name}</p>
                     <p className="text-sm text-gray-500">{user.email}</p>
                   </div>
                 </div>

                 {/* Address Section */}
                 <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                       <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest flex items-center gap-1.5"><MapPin size={12}/> Saved Address</p>
                       {!isEditingAddress && savedAddress && (
                         <button onClick={()=>setIsEditingAddress(true)} className="text-[10px] text-rose-600 font-bold uppercase tracking-widest hover:text-rose-700 flex items-center gap-1 cursor-pointer">
                           <Edit2 size={12}/> Edit
                         </button>
                       )}
                    </div>

                    { !isEditingAddress ? (
                       savedAddress ? (
                         <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg relative group">
                           <button onClick={handleDeleteAddress} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Remove Address">
                             <Trash2 size={16}/>
                           </button>
                           <p className="font-bold text-gray-900 text-sm mb-1">{savedAddress.firstName} {savedAddress.lastName}</p>
                           <p className="text-sm text-gray-600 leading-relaxed">
                             {savedAddress.flat}, {savedAddress.street}<br/>
                             {savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}
                           </p>
                         </div>
                       ) : (
                         <div className="border border-dashed border-gray-300 p-6 rounded-lg text-center bg-gray-50/50">
                           <p className="text-sm text-gray-500 mb-4 font-medium">No delivery address saved yet.</p>
                           <button onClick={()=>setIsEditingAddress(true)} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm cursor-pointer">Add New Address</button>
                         </div>
                       )
                    ) : (
                       <form onSubmit={handleSaveAddress} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input required type="text" placeholder="First Name" value={addressForm.firstName} onChange={(e) => setAddressForm({...addressForm, firstName: e.target.value})} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-rose-500 bg-gray-50 focus:bg-white" />
                            <input type="text" placeholder="Last Name" value={addressForm.lastName} onChange={(e) => setAddressForm({...addressForm, lastName: e.target.value})} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-rose-500 bg-gray-50 focus:bg-white" />
                          </div>
                          <input required type="text" placeholder="Flat, House no., Building" value={addressForm.flat} onChange={(e) => setAddressForm({...addressForm, flat: e.target.value})} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-rose-500 bg-gray-50 focus:bg-white" />
                          <input required type="text" placeholder="Area, Street, Sector" value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-rose-500 bg-gray-50 focus:bg-white" />
                          <div className="grid grid-cols-3 gap-3">
                            <input required type="text" maxLength={6} placeholder="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value.replace(/\D/g, '')})} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-rose-500 bg-gray-50 focus:bg-white" />
                            <input required type="text" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-rose-500 bg-gray-50 focus:bg-white" />
                            <input required type="text" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm outline-none focus:border-rose-500 bg-gray-50 focus:bg-white" />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => setIsEditingAddress(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-200 cursor-pointer transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"><Check size={14}/> Save</button>
                          </div>
                       </form>
                    )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOCATION PINCODE MODAL (Unchanged) */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLocationModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-center">
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-1 transition-colors cursor-pointer"><X size={20} strokeWidth={2.5}/></button>
              </div>
              <div className="p-8 pt-10 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MapPin size={28} className="text-rose-600" strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-2xl text-gray-900 mb-2">Where are we shipping?</h4>
                <p className="text-gray-500 text-xs mb-8 px-4 leading-relaxed">Enter your pincode to check estimated delivery times and product availability.</p>
                <form onSubmit={handleLocationUpdate}>
                  <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1.5 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-50 transition-all">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit Pincode" 
                      maxLength={6} 
                      className="flex-1 bg-transparent px-4 py-2.5 text-sm font-bold text-gray-900 tracking-widest outline-none placeholder:font-medium placeholder:tracking-normal" 
                      value={tempPincode} 
                      onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))} 
                      autoFocus 
                    />
                    <button type="submit" disabled={tempPincode.length !== 6} className="bg-rose-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rose-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors cursor-pointer shadow-md">Apply</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;