import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../../supabase"; // Adjust path to your supabase config
import { useQuery } from "@tanstack/react-query";
import { allMockReviews } from "@/data/mockReviews"; // Adjust path to your mock file

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch real reviews & merge with mock reviews using TanStack Query
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['landing-reviews'],
    queryFn: async () => {
      // 1. Fetch the latest real reviews from Supabase
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          user_name,
          rating,
          comment,
          products ( title )
        `)
        .order('created_at', { ascending: false })
        .limit(10); 

      if (error) console.error("Failed to fetch real reviews:", error);

      // 2. Format Real Reviews
      const realReviews = (data || []).map((r: any) => ({
        id: r.id,
        name: r.user_name,
        rating: r.rating,
        review: r.comment,
        product: r.products?.title || "Signature Piece", 
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.user_name)}`
      }));

      // 3. Format Mock Reviews to match the exact same UI structure
      const formattedMocks = allMockReviews.map((m) => ({
        id: m.id,
        name: m.author,
        rating: m.rating,
        review: m.content,
        // Using a generic nice title for the landing page mocks
        product: "Signature Collection", 
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.author)}`
      }));

      // 4. Merge: Put real customer reviews first, followed by all the mock reviews
      return [...realReviews, ...formattedMocks];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes for blazing fast navigation
  });

  // Slider Navigation Logic
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 bg-gray-50 overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-2">What Our Customers Say</p>
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-wide">
            Trusted by Thousands
          </h2>
        </div>

        <div className="relative group">
          {/* Left Scroll Button */}
          {!isLoading && reviews.length > 0 && (
            <button 
              onClick={() => scroll("left")}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:scale-105 transition-all hidden md:flex opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Sliding Container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >
            {isLoading ? (
              // --- LOADING SKELETONS ---
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="min-w-[280px] md:min-w-[320px] snap-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              // --- COMBINED REVIEWS MAP ---
              reviews.map((review: any) => (
                <div 
                  key={review.id} 
                  className="min-w-[280px] md:min-w-[320px] snap-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{review.name}</h4>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed italic flex-grow">
                    "{review.review}"
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Purchased: <span className="text-gray-700 font-medium normal-case tracking-normal">{review.product}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Scroll Button */}
          {!isLoading && reviews.length > 0 && (
            <button 
              onClick={() => scroll("right")}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:scale-105 transition-all hidden md:flex opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;