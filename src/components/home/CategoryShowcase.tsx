import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/data/products";

const CategoryShowcase = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">Collections</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={`/category/${cat.slug}`}
                className="group block relative overflow-hidden rounded-lg aspect-[3/4]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="font-serif text-background text-lg md:text-xl tracking-wide">{cat.name}</h3>
                  <p className="text-background/70 text-xs mt-1">{cat.count} Products</p>
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
