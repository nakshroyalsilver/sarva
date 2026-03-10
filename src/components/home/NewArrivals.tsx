import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../supabase"; // Adjust path if needed
import ProductCard from "@/components/ProductCard";


const giftCollections = [
  { 
    title: "For Her", 
    subtitle: "Gifts she'll adore forever",
    img: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80", 
    link: "/gifts/curated" 
  },
  { 
    title: "For Mom", 
    subtitle: "Timeless elegance",
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80", 
    link: "/gifts/curated" 
  },
  { 
    title: "For Him", 
    subtitle: "Bold & Minimalist",
    img: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80", 
    link: "/artistry-takes-time" 
  },
  { 
    title: "For Sister", 
    subtitle: "Trendy & Fun",
    img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80", 
    link: "/gifts/curated" 
  },
];

export const GiftingSection = () => {
  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-rose-50/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <span className="text-rose-600 font-bold text-[10px] uppercase tracking-[0.25em] mb-1.5 block">
            The Gifting Studio
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-2">
            Find the Perfect Gift
          </h2>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
            Celebrate your loved ones with something as precious as they are.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {giftCollections.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="group relative h-[250px] md:h-[320px] rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500"
            >
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-serif text-xl md:text-2xl mb-1">
                  {item.title}
                </h3>
                <p className="text-rose-100 text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {item.subtitle}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest border-b border-white/50 pb-1 group-hover:border-white transition-colors">
                  Shop Now <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export const NewArrivals = () => {
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
      const { data: adminData, error: adminError } = await supabase
        .from("products")
        .select("*")
        .eq("is_new_arrival", true) 
        .eq("is_archived", false) // 🚀 ADDED: Keep archived items out of new arrivals
        .limit(10);

      if (adminError) throw adminError;

      // 2. Fetch a pool of random products to keep the section feeling fresh
      const { data: randomData, error: randomError } = await supabase
        .from("products")
        .select("*")
        .eq("is_archived", false) // 🚀 ADDED: Keep archived items out of the random pool
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