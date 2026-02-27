import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { bestSellers } from "@/data/products";
import { supabase } from "../../../supabase";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('is_featured', true)
          .limit(8);

        if (error) throw error;

        if (data && data.length > 0) {
          setProducts(data.map(p => ({
            ...p,
            name: p.title,
            image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
            price: p.price || 0,
            category: p.categories?.slug || 'uncategorized',
            rating: p.rating ?? 4.8,
            reviews: p.reviews ?? 0,
          })));
        } else {
          // Fallback to static data until is_featured is set in admin
          setProducts(bestSellers as any[]);
        }
      } catch {
        setProducts(bestSellers as any[]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-1.5">Curated for You</p>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
            Best Sellers
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3"></div>
                <div className="h-3 bg-gray-100 w-3/4 mb-2 rounded"></div>
                <div className="h-3 bg-gray-100 w-1/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
