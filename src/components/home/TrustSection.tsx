import { Shield, Truck, Award, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const trustItems = [
  { icon: Shield, title: "925 Sterling Silver", desc: "Certified pure silver" },
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
  { icon: Award, title: "Quality Assured", desc: "BIS hallmarked jewelry" },
  { icon: RotateCcw, title: "Easy Returns", desc: "15-day return policy" },
];

const TrustSection = () => {
  return (
    <section className="py-14 border-t border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <item.icon size={28} className="mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
              <h4 className="text-sm font-medium text-foreground tracking-wide">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
