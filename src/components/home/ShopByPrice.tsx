import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const priceRanges = [
  { label: "Under", price: "1999", link: "/price/1999" },
  { label: "Under", price: "3999", link: "/price/3999" },
  { label: "Under", price: "5999", link: "/price/5999" },
  { label: "Under", price: "9999", link: "/price/9999" }
];

const ShopByPrice = () => {
  return (
    <section className="py-16 bg-[#FCFCFC]">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] text-rose-600 uppercase font-bold mb-2">
            Curated Collections
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
            Luxury Within Reach
          </h2>
        </div>

        {/* 4-Card Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {priceRanges.map((range, idx) => (
            <Link
              key={idx}
              to={range.link}
              // Made shadow-rose-100 and shadow-lg permanent for a soft glow. Added a border-rose-100.
              className="group relative bg-white border border-rose-100 rounded-2xl p-8 flex flex-col items-center justify-center overflow-hidden shadow-rose-100/50 shadow-lg hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            >
              {/* Subtle Permanent Rose Gradient on the card itself */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none" />
              
              {/* Content */}
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 relative z-10">
                {range.label}
              </span>
              <span className="font-serif text-3xl md:text-4xl text-gray-900 relative z-10 mb-4">
                ₹{range.price}
              </span>

              {/* View Arrow - Still slides on hover, but text is rose by default now */}
              <div className="relative z-10 flex items-center text-[10px] font-bold uppercase tracking-widest text-rose-500 group-hover:text-rose-600 transition-colors">
                <span>Shop</span>
                <ArrowRight size={14} className="ml-1 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default ShopByPrice;