import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Updated with verified, high-quality jewelry specific images
const giftCollections = [
  { 
    title: "For Her", 
    subtitle: "Gifts she'll adore forever",
    // Image: Elegant woman wearing silver necklace
    img: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80", 
    link: "/gifts/her" 
  },
  { 
    title: "For Mom", 
    subtitle: "Timeless elegance",
    // Image: Sophisticated pearl/silver close-up
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80", 
    link: "/gifts/mom" 
  },
  { 
    title: "For Him", 
    subtitle: "Bold & Minimalist",
    // Image: Man wearing silver rings/chain (Urban style)
    img: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80", 
    link: "/gifts/him" 
  },
  { 
    title: "For Sister", 
    subtitle: "Trendy & Fun",
    // Image: Stacked bracelets/charms (Youthful vibe)
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80", 
    link: "/gifts/sister" 
  },
];

const GiftingSection = () => {
  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-rose-50/30">
      <div className="container mx-auto px-6">

        {/* Section Header - Compact */}
        <div className="text-center mb-6">
          <span className="text-rose-600 font-bold text-[10px] uppercase tracking-[0.25em] mb-1.5 block">
            The Gifting Studio
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-2">
            Find the Perfect Gift
          </h2>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
            Celebrate your loved ones with something as precious as they are.
          </p>
        </div>

        {/* Grid Layout - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {giftCollections.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="group relative h-[250px] md:h-[320px] rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500"
            >
              {/* Background Image with Zoom Effect */}
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-serif text-xl md:text-2xl mb-1">
                  {item.title}
                </h3>
                <p className="text-rose-100 text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {item.subtitle}
                </p>
                
                {/* Pseudo Button */}
                <div className="mt-4 inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest border-b border-white/50 pb-1 group-hover:border-white transition-colors">
                  Shop Now <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* "Shop by Price" Mini Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
           {["Under ₹999", "₹1000 - ₹2999", "Premium Gifts"].map((tag) => (
             <Link 
               key={tag} 
               to={`/search?q=${tag}`} 
               className="px-6 py-2.5 bg-white border border-rose-100 text-rose-900 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm"
             >
               Gifts {tag}
             </Link>
           ))}
        </div>

      </div>
    </section>
  );
};

export default GiftingSection;