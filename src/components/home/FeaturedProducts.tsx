import ProductCard from "@/components/ProductCard";
import { bestSellers } from "@/data/products";

const FeaturedProducts = () => {
  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-1.5">Curated for You</p>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
            Best Sellers
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
