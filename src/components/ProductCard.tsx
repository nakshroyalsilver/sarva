import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full">
              {product.badge}
            </span>
          )}

          {/* Discount */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] tracking-wider px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}

          {/* Hover actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-background text-foreground text-xs py-2.5 rounded-full hover:bg-background/90 transition-colors"
            >
              <ShoppingBag size={14} />
              Add to Cart
            </button>
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="p-2.5 bg-background text-foreground rounded-full hover:bg-background/90 transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart size={14} />
            </button>
          </div>
        </div>
      </Link>

      <div className="px-1">
        <h3 className="text-sm text-foreground font-medium truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-foreground">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">★ {product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
