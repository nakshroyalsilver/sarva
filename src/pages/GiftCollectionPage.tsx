import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "../../supabase"; 
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";

const GiftCollectionPage = () => {

  // Auto-scroll to top when clicking the gift links
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: randomizedGifts, isLoading } = useQuery({
    queryKey: ["curated-gifts-randomized"],
    queryFn: async () => {
      // 1. Get the items you explicitly marked as New Arrivals in Admin
      const { data: adminData } = await supabase
        .from("products")
        .select("*")
        .eq("is_new_arrival", true)
        .limit(10);

      // 2. Get a pool of random items from the database to mix in
      const { data: randomData } = await supabase
        .from("products")
        .select("*")
        .limit(40);

      // 3. Combine both lists
      const combined = [...(adminData || []), ...(randomData || [])];
      
      // 4. Remove any duplicate items
      const uniqueProducts = Array.from(
        new Map(combined.map(item => [item.id, item])).values()
      );

      // 5. Shuffle the array mathematically so it's different every time
      const shuffled = uniqueProducts.sort(() => 0.5 - Math.random());

      // 6. Format them for your ProductCard component
      return shuffled.map((p: any) => ({
        ...p,
        name: p.title || p.name,
        image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
      }));
    },
    // Force this page to re-fetch and re-shuffle every single time they visit it
    staleTime: 0, 
    refetchOnMount: true,
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>Curated Gifts | Sarvaa Fine Jewelry</title>
        <meta name="description" content="Discover hand-selected jewelry pieces perfect for gifting." />
      </Helmet>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-10 text-center">
          <p className="text-[10px] tracking-[0.25em] text-rose-600 uppercase font-bold mb-2">
            The Gifting Studio
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">
            Curated Just For You
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            A hand-picked selection of our finest pieces, perfect for celebrating special moments.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse rounded-xl border border-gray-100" />
            ))}
          </div>
        ) : randomizedGifts?.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No pieces available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {randomizedGifts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GiftCollectionPage;