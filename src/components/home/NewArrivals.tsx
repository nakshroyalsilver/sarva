import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../supabase"; 
import ProductCard from "@/components/ProductCard";

const NewArrivals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    }
  };

  // FETCH: ADMIN CHOICES + RANDOMIZED MIX
  const { data: randomizedProducts, isLoading } = useQuery({
    queryKey: ["mixed-new-arrivals"],
    queryFn: async () => {
      
      // 1. Fetch the products you explicitly marked in the Admin Panel
      // NOTE: Change 'is_new_arrival' to whatever column name your admin panel uses! 
      // (It might be 'is_new', 'badge', etc.)
      const { data: adminData, error: adminError } = await supabase
        .from("products")
        .select("*")
        .eq("is_new_arrival", true) 
        .limit(10);

      if (adminError) throw adminError;

      // 2. Fetch a pool of random products to keep the section feeling fresh
      const { data: randomData, error: randomError } = await supabase
        .from("products")
        .select("*")
        .limit(30);

      if (randomError) throw randomError;

      // 3. Combine both lists
      const combined = [...(adminData || []), ...(randomData || [])];

      // 4. Remove any duplicates (in case a random product is also an admin-selected product)
      const uniqueProducts = Array.from(
        new Map(combined.map(item => [item.id, item])).values()
      );

      // 5. Shuffle the final list so the order is different every time!
      const shuffled = uniqueProducts.sort(() => 0.5 - Math.random());

      // 6. Return the top 10 to 12 items for the slider
      return shuffled.slice(0, 12).map((p: any) => ({
        ...p,
        name: p.title || p.name,
        image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
      }));
    },
    // Force it to shuffle every single time the component loads
    staleTime: 0,
    refetchOnMount: true,
  });

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
              className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[45%] md:min-w-[23%] aspect-[3/4] bg-gray-50 animate-pulse rounded-lg border border-gray-100 shrink-0"></div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {randomizedProducts?.map((product) => (
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