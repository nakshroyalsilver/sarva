import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "../../supabase"; 
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";

const PriceFilteredPage = () => {
  const { maxPrice } = useParams<{ maxPrice: string }>();
  const limit = maxPrice ? parseInt(maxPrice) : 0;

  // 1. SCROLL TO TOP FIX
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [limit]);

  // 2. UPDATED LOGIC: Always start from 0 to show "Everything under X"
  const minLimit = 0; 

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-under-price", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lte("price", limit) // Less than or equal to the selected price
        .eq("is_archived", false) // <--- THE FIX: Hides archived products!
        .order("price", { ascending: false }); // DESCENDING ORDER (Highest to lowest)

      if (error) throw error;
      
      return data.map((p: any) => ({
        ...p,
        name: p.title || p.name,
        image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
        stock_quantity: p.stock_quantity !== null && p.stock_quantity !== undefined ? Number(p.stock_quantity) : 0,
        rating: p.rating || 4.8, 
        reviews: p.reviews || 124,
        originalPrice: p.compare_at_price || p.originalPrice || null
      }));
    },
    enabled: !!limit,
  });

  const displayTitle = `Under ₹${limit.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>{`Jewelry ${displayTitle} | Sarvaa Fine Jewelry`}</title>
        <meta name="description" content={`Shop luxury jewelry ${displayTitle} at Sarvaa Fine Jewelry.`} />
      </Helmet>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-10 text-center">
          <p className="text-[10px] tracking-[0.25em] text-rose-600 uppercase font-bold mb-2">
            Curated Collections
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">
            {displayTitle}
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-xl border border-gray-100" />
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No pieces found under this price point yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PriceFilteredPage;