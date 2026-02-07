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
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">Just Dropped</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
              New Arrivals
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="p-2 border border-border rounded-full hover:bg-secondary transition-colors text-foreground"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="p-2 border border-border rounded-full hover:bg-secondary transition-colors text-foreground"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
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
