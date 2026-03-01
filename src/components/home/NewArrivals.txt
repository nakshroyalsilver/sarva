import ProductCard from "@/components/ProductCard";
import { newArrivals } from "@/data/products";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NewArrivals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    }
  };

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

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {newArrivals.map((product) => (
            <div key={product.id} className="min-w-[45%] md:min-w-[23%] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
