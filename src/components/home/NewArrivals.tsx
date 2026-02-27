import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { newArrivals as staticNewArrivals } from "@/data/products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../../supabase";

const NewArrivals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .order('created_at', { ascending: false })
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
          setProducts(staticNewArrivals as any[]);
        }
      } catch {
        setProducts(staticNewArrivals as any[]);
      } finally {
        setLoading(false);
      }
    }

    fetchNewArrivals();
  }, []);

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-1.5">Just Dropped</p>
            <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
              New Arrivals
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 md:gap-5 overflow-hidden animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[45%] md:min-w-[23%]">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3"></div>
                <div className="h-3 bg-gray-100 w-3/4 mb-2 rounded"></div>
                <div className="h-3 bg-gray-100 w-1/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {products.map((product) => (
              <div key={product.id} className="min-w-[45%] md:min-w-[23%] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
