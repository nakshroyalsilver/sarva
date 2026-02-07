import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronRight, ChevronDown, MapPin, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Data Structures ---
const navCategories = [
  { 
    name: "New Arrivals", 
    path: "/category/new", 
    highlight: true, 
    featuredImg: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400&q=80" 
  },
  { 
    name: "Rings", 
    path: "/category/rings", 
    subCats: ["Solitaire Rings", "Couple Rings", "Cocktail Rings", "Promise Rings", "Band Rings"], 
    featuredImg: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80" 
  },
  { 
    name: "Earrings", 
    path: "/category/earrings", 
    subCats: ["Studs", "Jhumkas", "Hoops", "Danglers", "Ear Cuffs"], 
    featuredImg: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80" 
  },
  { 
    name: "Necklaces", 
    path: "/category/necklaces", 
    subCats: ["Pendants", "Chains", "Chokers", "Lariat", "Mangalsutra"], 
    featuredImg: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80" 
  },
  { 
    name: "Bracelets", 
    path: "/category/bracelets", 
    subCats: ["Chain", "Cuff", "Bangles", "Charm"], 
    featuredImg: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80" 
  },
  { 
    name: "Gifts", 
    path: "/category/gifts", 
    highlight: true, 
    featuredImg: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&q=80" 
  },
];

const searchPlaceholders = [
  "Search for Rings",
  "Search for Diamonds",
  "Search for Necklaces",
  "Search for 925 Silver",
  "Search for Gifts",
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Location Logic
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pincode, setPincode] = useState("700001");
  const [tempPincode, setTempPincode] = useState("");

  // Search Animation Logic
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3500); 
    return () => clearInterval(interval);
  }, []);

  const handleLocationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPincode.length === 6) {
      setPincode(tempPincode);
      setIsLocationModalOpen(false);
      setTempPincode("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm font-sans">
        
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-rose-50 via-[#FFF0F5] to-rose-50 text-rose-950 text-center text-[10px] md:text-xs py-2 tracking-widest font-medium border-b border-rose-100">
          FLAT 10% OFF ON YOUR FIRST ORDER | USE CODE: <span className="font-bold">NEW10</span>
        </div>

        {/* Main Header Row */}
        <div className="container mx-auto px-4 md:px-6 relative z-20 bg-white">
          <div className="flex items-center justify-between h-24 gap-6">
            
            {/* Mobile Toggle */}
            <div className="flex items-center gap-4 lg:hidden flex-1">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-800 p-1 hover:bg-gray-100 rounded-full transition-colors">
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
              <Search size={24} className="text-gray-600" />
            </div>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center justify-center lg:justify-start">
              <h1 className="text-2xl md:text-4xl font-serif tracking-widest text-gray-900 font-medium hover:opacity-80 transition-opacity">
                Sarvaa
              </h1>
            </Link>

            {/* Deliver To Box */}
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex flex-col justify-center items-start leading-tight cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-md transition-colors group min-w-[140px] border border-transparent hover:border-gray-200"
            >
              <span className="text-[11px] text-gray-500 ml-5 group-hover:text-rose-600">Deliver to</span>
              <div className="flex items-center gap-1.5">
                <MapPin size={18} className="text-gray-900 group-hover:text-rose-600" />
                <span className="text-sm font-bold text-gray-900 group-hover:text-rose-600">
                  {pincode ? `India ${pincode}` : "Select Location"}
                </span>
              </div>
            </button>

            {/* Animated Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-4 relative">
               <div className="w-full h-12 bg-gray-50 rounded-full border border-gray-200 flex items-center overflow-hidden relative focus-within:ring-2 focus-within:ring-rose-100 focus-within:border-rose-300 focus-within:bg-white transition-all shadow-sm">
                
                {/* Animated Placeholder Text */}
                <div className="absolute inset-0 flex items-center pl-5 pointer-events-none">
                  <AnimatePresence mode="wait">
                    {!searchQuery && (
                      <motion.span
                        key={searchPlaceholders[placeholderIndex]}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="text-gray-400 text-sm font-medium"
                      >
                        {searchPlaceholders[placeholderIndex]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-5 pr-12 bg-transparent text-gray-900 text-sm outline-none relative z-10 placeholder-transparent"
                  placeholder="" 
                />

                <button className="absolute right-1 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-all shadow-md z-20">
                  <Search size={18} />
                </button>
               </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center justify-end gap-2 md:gap-6 flex-1 lg:flex-none">
              <div className="hidden md:flex items-center gap-5">
                 <button className="flex flex-col items-center justify-center text-gray-700 hover:text-rose-600 transition-colors group relative">
                  <User size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 whitespace-nowrap text-rose-600">
                    Profile
                  </span>
                </button>
                
                {/* Wishlist Link */}
                <Link to="/wishlist" className="flex flex-col items-center justify-center text-gray-700 hover:text-rose-600 transition-colors group relative">
                  <Heart size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300 group-hover:fill-rose-50" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 whitespace-nowrap text-rose-600">
                    Wishlist
                  </span>
                </Link>
              </div>

              {/* Cart Link */}
              <Link to="/cart" className="flex flex-col items-center justify-center text-gray-700 hover:text-rose-600 transition-colors relative group ml-2">
                <div className="relative">
                  <ShoppingBag size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                    2
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 whitespace-nowrap text-rose-600">
                  Cart
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Navigation with Mega Menu */}
        <nav 
          className="hidden lg:block border-t border-gray-100 relative bg-white z-10"
          onMouseLeave={() => setActiveCategory(null)}
        >
          <div className="container mx-auto px-4 flex items-center justify-center h-14">
            <ul className="flex items-center gap-10">
              {navCategories.map((cat) => (
                <li 
                  key={cat.path} 
                  className="h-14 flex items-center"
                  onMouseEnter={() => setActiveCategory(cat.name)}
                >
                  <Link
                    to={cat.path}
                    className={`text-[13px] uppercase tracking-[0.15em] font-bold transition-all duration-300 hover:text-rose-600 relative py-4 flex items-center gap-1 group
                      ${cat.highlight ? "text-rose-600" : "text-gray-700"}`}
                  >
                    {cat.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-rose-500 group-hover:w-full transition-all duration-300 ease-out rounded-full" />
                    {cat.subCats && (
                      <ChevronDown size={12} className={`transition-transform duration-300 text-gray-400 group-hover:text-rose-600 ${activeCategory === cat.name ? "rotate-180" : ""}`} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mega Menu Dropdown */}
          <AnimatePresence>
            {activeCategory && navCategories.find(c => c.name === activeCategory)?.subCats && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-2xl py-10 z-0"
              >
                <div className="container mx-auto px-12">
                  <div className="flex justify-center gap-24">
                    
                    {/* Column 1: Categories */}
                    <div className="w-56">
                      <h3 className="text-xs font-extrabold text-rose-950 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">
                        By Category
                      </h3>
                      <ul className="space-y-4">
                        {navCategories.find(c => c.name === activeCategory)?.subCats?.map((sub) => (
                          <li key={sub}>
                            <Link to="#" className="text-sm text-gray-700 hover:text-rose-600 hover:translate-x-2 transition-all inline-block font-semibold">
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 2: Shop By Price */}
                    <div className="w-56">
                      <h3 className="text-xs font-extrabold text-rose-950 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">
                        By Price
                      </h3>
                      <ul className="space-y-4">
                        {["Under ₹999", "₹1000 - ₹2999", "₹3000 - ₹4999", "Above ₹5000"].map((price) => (
                          <li key={price}>
                            <Link to="#" className="text-sm text-gray-700 hover:text-rose-600 hover:translate-x-2 transition-all inline-block font-semibold">
                              {price}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 3: Featured Image */}
                    <div className="w-72 h-52 rounded-xl overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                      <img 
                        src={navCategories.find(c => c.name === activeCategory)?.featuredImg} 
                        alt="Featured" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-colors" />
                      <div className="absolute bottom-5 left-5 text-white">
                        <p className="text-sm font-bold uppercase tracking-widest mb-1 drop-shadow-md">Best Seller</p>
                        <div className="flex items-center gap-2 opacity-100 group-hover:translate-x-2 transition-all">
                          <span className="text-xs font-medium">Shop Now</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-0 top-[110px] bg-white z-50 overflow-y-auto pb-20 border-t border-gray-100"
            >
              <div className="bg-gray-50 p-4 flex items-center gap-3 border-b border-gray-100" onClick={() => setIsLocationModalOpen(true)}>
                  <MapPin size={20} className="text-gray-600" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Deliver to</span>
                    <span className="text-sm font-bold text-gray-900">{pincode ? `India ${pincode}` : "Select Location"}</span>
                  </div>
              </div>

              <div className="flex flex-col p-6 space-y-2">
                {navCategories.map((cat) => (
                  <div key={cat.path} className="border-b border-gray-50 last:border-none">
                    <Link
                      to={cat.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-4 text-gray-800 hover:text-rose-600 transition-colors"
                    >
                      <span className={`text-base tracking-wide font-medium ${cat.highlight ? "text-rose-600" : ""}`}>
                        {cat.name}
                      </span>
                      <ChevronRight size={18} className="text-gray-300" />
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Location Modal */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-serif text-lg font-medium text-gray-900">Choose your location</h3>
                <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-gray-500 text-sm mb-4">
                  Select a delivery location to see product availability and delivery options.
                </p>
                <form onSubmit={handleLocationUpdate}>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Pincode" 
                      maxLength={6}
                      className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      value={tempPincode}
                      onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))} // Only numbers
                      autoFocus
                    />
                    <button 
                      type="submit"
                      disabled={tempPincode.length !== 6}
                      className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply
                    </button>
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