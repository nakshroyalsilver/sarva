import ProductCard from "@/components/ProductCard";
import { bestSellers } from "@/data/products";

const FeaturedProducts = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">Curated for You</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
            Best Sellers
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
