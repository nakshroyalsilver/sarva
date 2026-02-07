import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
// Assuming your data structure matches this. If not, update the import or the map.
import { categories } from "@/data/products"; 

const CategoryShowcase = () => {
  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-xs font-bold tracking-[0.3em] text-rose-500 uppercase mb-3 block"
          >
            Collections
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-5xl text-gray-900 tracking-wide"
          >
            Shop by Category
          </motion.h2>
        </div>

        {/* =========================================
            MOBILE VIEW: "Instagram Story" Circles
            (Visible on small screens, hidden on md+)
           ========================================= */}
        <div className="flex md:hidden gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x">
          {categories.map((cat, i) => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center flex-shrink-0 snap-center group"
            >
              {/* Circle Image Container with Gradient Border */}
              <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-rose-200 to-transparent group-hover:from-rose-500 group-hover:to-rose-300 transition-all duration-300">
                <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              
              {/* Category Name */}
              <span className="mt-3 text-xs font-medium text-gray-800 tracking-wide text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* =========================================
            DESKTOP VIEW: "Editorial" Vertical Cards
            (Hidden on mobile, visible on md+)
           ========================================= */}
        <div className="hidden md:grid grid-cols-4 gap-8 lg:gap-10">
          {categories.slice(0, 4).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link to={`/category/${cat.slug}`} className="group block cursor-pointer">
                
                {/* Image Container - Clean, No Dark Overlay */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-100 mb-5">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Subtle "Shop" Button that slides up */}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out flex justify-center">
                    <button className="bg-white/95 backdrop-blur-sm text-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-colors w-full justify-center">
                      View Collection <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Text Below Image (Editorial Style) */}
                <div className="text-center">
                  <h3 className="font-serif text-xl text-gray-900 group-hover:text-rose-600 transition-colors duration-300">
                    {cat.name}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-widest font-medium">
                    {cat.count} Products
                  </p>
                </div>

              </Link>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default CategoryShowcase;