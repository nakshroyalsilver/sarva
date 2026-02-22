import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronRight, ChevronDown, MapPin, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext"; 

const navCategories = [
  { name: "New Arrivals", path: "/category/new", highlight: true, featuredImg: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400&q=80" },
  { name: "Rings", path: "/category/rings", subCats: ["Solitaire Rings", "Couple Rings", "Cocktail Rings", "Promise Rings", "Band Rings"], featuredImg: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80" },
  { name: "Earrings", path: "/category/earrings", subCats: ["Studs", "Jhumkas", "Hoops", "Danglers", "Ear Cuffs"], featuredImg: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80" },
  { name: "Necklaces", path: "/category/necklaces", subCats: ["Pendants", "Chains", "Chokers", "Lariat", "Mangalsutra"], featuredImg: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80" },
  { name: "Bracelets", path: "/category/bracelets", subCats: ["Chain", "Cuff", "Bangles", "Charm"], featuredImg: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80" },
  { name: "Gifts", path: "/category/gifts", highlight: true, featuredImg: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&q=80" },
];

const searchPlaceholders = [
  "Search for Rings",
  "Search for Diamonds",
  "Search for Necklaces",
  "Search for 925 Silver",
  "Search for Gifts",
];

const Navbar = () => {
  const { cartCount, wishlistCount } = useCart();

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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 font-sans">

        {/* Top Announcement Bar - Compact */}
        <div className="bg-gradient-to-r from-rose-50 via-[#FFF0F5] to-rose-50 text-rose-950 text-center text-[10px] py-1.5 tracking-wider font-medium border-b border-rose-100">
          FLAT 10% OFF ON YOUR FIRST ORDER | USE CODE: <span className="font-bold">NEW10</span>
        </div>

        {/* Main Header Row - Compact Tanishq-style */}
        <div className="container mx-auto px-6 relative z-20 bg-white">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between h-14">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-800 p-1">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-xl font-serif tracking-widest text-gray-900">Sarvaa</h1>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/wishlist"><Heart size={20} /></Link>
              <Link to="/cart" className="relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Header - Compact Three Column */}
          <div className="hidden lg:flex items-center h-16 gap-6">
            {/* Left: Logo */}
            <div className="w-32">
              <Link to="/" className="inline-block">
                <h1 className="text-2xl font-serif tracking-[0.3em] text-gray-900 font-medium hover:opacity-80 transition-opacity">
                  Sarvaa
                </h1>
              </Link>
            </div>

            {/* Center: Search Bar - Tanishq Style */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-lg">
                <div className="w-full h-10 bg-gray-50 rounded-full border border-gray-300 flex items-center overflow-hidden relative focus-within:border-rose-500 transition-all">
                  <div className="absolute inset-0 flex items-center pl-4 pointer-events-none">
                    <AnimatePresence mode="wait">
                      {!searchQuery && (
                        <motion.span
                          key={searchPlaceholders[placeholderIndex]}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full pl-4 pr-11 bg-transparent text-gray-900 text-sm outline-none relative z-10 placeholder-transparent"
                    placeholder=""
                  />
                  <button className="absolute right-0.5 w-9 h-9 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-all">
                    <Search size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Pincode + Icons - Compact */}
            <div className="w-32 flex items-center justify-end gap-4">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1 hover:text-rose-600 transition-colors group"
              >
                <MapPin size={14} className="text-gray-600 group-hover:text-rose-600" />
                <span className="text-xs font-semibold text-gray-700 group-hover:text-rose-600">{pincode}</span>
              </button>

              <div className="flex items-center gap-3.5">
                 
                <Link to="/login" className="text-gray-700 hover:text-rose-600 transition-colors">
                  <User size={20} strokeWidth={1.8} />
                </Link>

                <Link to="/wishlist" className="text-gray-700 hover:text-rose-600 transition-colors relative">
                  <Heart size={20} strokeWidth={1.8} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="text-gray-700 hover:text-rose-600 transition-colors relative">
                  <ShoppingBag size={20} strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Mega Menu - Compact */}
        <nav
          className="hidden lg:block border-t border-gray-200 relative bg-white z-10"
          onMouseLeave={() => setActiveCategory(null)}
        >
          <div className="container mx-auto px-6 flex items-center justify-center h-11">
            <ul className="flex items-center gap-8">
              {navCategories.map((cat) => (
                <li
                  key={cat.path}
                  className="h-11 flex items-center"
                  onMouseEnter={() => setActiveCategory(cat.name)}
                >
                  <Link
                    to={cat.path}
                    className={`text-[11px] uppercase tracking-wider font-bold transition-all duration-200 hover:text-rose-600 relative py-3 flex items-center gap-0.5 group
                      ${cat.highlight ? "text-rose-600" : "text-gray-700"}`}
                  >
                    {cat.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-rose-500 group-hover:w-full transition-all duration-200 ease-out" />
                    {cat.subCats && (
                      <ChevronDown size={11} className={`transition-transform duration-200 text-gray-400 group-hover:text-rose-600 ${activeCategory === cat.name ? "rotate-180" : ""}`} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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
                    <div className="w-56">
                      <h3 className="text-xs font-extrabold text-rose-950 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">By Category</h3>
                      <ul className="space-y-4">
                        {navCategories.find(c => c.name === activeCategory)?.subCats?.map((sub) => (
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

        {/* Mobile Menu & Location Modal */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
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

      {/* Location Modal */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLocationModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-serif text-lg font-medium text-gray-900">Choose your location</h3>
                <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
              </div>
              <div className="p-6">
                <p className="text-gray-500 text-sm mb-4">Select a delivery location to see product availability.</p>
                <form onSubmit={handleLocationUpdate}>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter Pincode" maxLength={6} className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" value={tempPincode} onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))} autoFocus />
                    <button type="submit" disabled={tempPincode.length !== 6} className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-rose-700 disabled:bg-gray-300 transition-colors">Apply</button>
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