import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-10 text-center">
          <h3 className="font-serif text-xl tracking-wide mb-2">Stay in the Loop</h3>
          <p className="text-primary-foreground/70 text-sm mb-5 max-w-md mx-auto">
            Subscribe for exclusive launches, offers, and silver care tips.
          </p>
          <div className="flex max-w-sm mx-auto gap-2">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-primary-foreground/10 text-primary-foreground text-sm rounded-full border border-primary-foreground/20 outline-none placeholder:text-primary-foreground/40 focus:border-primary-foreground/40 transition-colors"
            />
            <button className="px-6 py-2.5 bg-primary-foreground text-primary text-sm font-medium rounded-full hover:bg-primary-foreground/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-serif text-sm tracking-wider mb-4">SHOP</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/60">
              <li><Link to="/category/rings" className="hover:text-primary-foreground transition-colors">Rings</Link></li>
              <li><Link to="/category/necklaces" className="hover:text-primary-foreground transition-colors">Necklaces</Link></li>
              <li><Link to="/category/earrings" className="hover:text-primary-foreground transition-colors">Earrings</Link></li>
              <li><Link to="/category/bracelets" className="hover:text-primary-foreground transition-colors">Bracelets</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm tracking-wider mb-4">HELP</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/60">
              <li><Link to="/faq" className="hover:text-primary-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-foreground transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="hover:text-primary-foreground transition-colors">Returns</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm tracking-wider mb-4">ABOUT</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/60">
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">Our Story</Link></li>
              <li><Link to="/blog" className="hover:text-primary-foreground transition-colors">Blog</Link></li>
              <li><Link to="/sustainability" className="hover:text-primary-foreground transition-colors">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm tracking-wider mb-4">FOLLOW US</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full border border-primary-foreground/20 text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 rounded-full border border-primary-foreground/20 text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 rounded-full border border-primary-foreground/20 text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 rounded-full border border-primary-foreground/20 text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/40 transition-colors">
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-primary-foreground/40">
          © 2026 Lumière Silver. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
