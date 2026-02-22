import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const priceRanges = [
  {
    range: "Under ₹999",
    description: "Affordable daily wear pieces",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80",
    link: "/price/under-999",
    bgColor: "from-blue-50 to-blue-100"
  },
  {
    range: "₹1,000 - ₹2,999",
    description: "Premium everyday jewelry",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
    link: "/price/1000-2999",
    bgColor: "from-purple-50 to-purple-100"
  },
  {
    range: "₹3,000 - ₹4,999",
    description: "Designer statement pieces",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
    link: "/price/3000-4999",
    bgColor: "from-rose-50 to-rose-100"
  },
  {
    range: "Above ₹5,000",
    description: "Luxury bridal collection",
    image: "https://images.unsplash.com/photo-1515562141589-67f0d569b03e?w=400&q=80",
    link: "/price/above-5000",
    bgColor: "from-amber-50 to-amber-100"
  }
];

const ShopByPrice = () => {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-1.5">Find Within Your Budget</p>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
            Shop by Price
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {priceRanges.map((range, idx) => (
            <Link
              key={idx}
              to={range.link}
              className="group relative rounded-lg overflow-hidden h-64 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${range.bgColor} opacity-90`}></div>
              <img
                src={range.image}
                alt={range.range}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
              />
              <div className="relative h-full flex flex-col justify-end p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{range.range}</h3>
                <p className="text-xs text-gray-700 mb-3">{range.description}</p>
                <div className="flex items-center text-xs font-medium text-gray-900 group-hover:text-rose-600 transition-colors">
                  Explore <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByPrice;
