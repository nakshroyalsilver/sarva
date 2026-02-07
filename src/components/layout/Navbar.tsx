import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navCategories = [
  { name: "Rings", path: "/category/rings" },
  { name: "Necklaces & Pendants", path: "/category/necklaces" },
  { name: "Earrings", path: "/category/earrings" },
  { name: "Bracelets & Bangles", path: "/category/bracelets" },
];

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center text-xs py-1.5 tracking-wider font-light">
        FREE SHIPPING ON ORDERS ABOVE ₹999 | 925 STERLING SILVER
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-serif tracking-[0.15em] text-foreground">
              LUMIÈRE
            </h1>
          </Link>

          {/* Desktop search */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for silver jewelry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary text-foreground text-sm rounded-full border-none outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring transition-all"
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button
              className="lg:hidden p-2 text-foreground hover:text-muted-foreground transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button className="p-2 text-foreground hover:text-muted-foreground transition-colors" aria-label="Wishlist">
              <Heart size={20} />
            </button>
            <button className="p-2 text-foreground hover:text-muted-foreground transition-colors relative" aria-label="Cart">
              <ShoppingBag size={20} />
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </button>
            <button className="p-2 text-foreground hover:text-muted-foreground transition-colors" aria-label="Account">
              <User size={20} />
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden pb-3"
            >
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for silver jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary text-foreground text-sm rounded-full border-none outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop category nav */}
      <nav className="hidden lg:block border-t border-border">
        <div className="container mx-auto px-4 flex items-center justify-center gap-8 h-11">
          {navCategories.map((cat) => (
            <Link
              key={cat.path}
              to={cat.path}
              className="text-sm text-muted-foreground hover:text-foreground tracking-wide transition-colors relative group"
            >
              {cat.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-border overflow-hidden bg-background"
          >
            <div className="py-3 px-4 space-y-1">
              {navCategories.map((cat) => (
                <Link
                  key={cat.path}
                  to={cat.path}
                  className="block py-2.5 text-sm text-muted-foreground hover:text-foreground tracking-wide transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
