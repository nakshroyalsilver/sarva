import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, TrendingUp, FolderSearch, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { supabase } from "../../supabase"; // <-- ADDED SUPABASE IMPORT

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // --- LIVE BACKEND STATES ---
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM SUPABASE ---
  useEffect(() => {
    async function fetchSearchData() {
      setLoading(true);
      try {
        // 1. Fetch Live Categories
        const { data: catData } = await supabase.from('categories').select('name, slug').limit(8);
        if (catData) {
          setCategories(catData);
        }

        // 2. Fetch Live Trending Products (Newest 10 to extract search names, displaying top 3)
        const { data: prodData } = await supabase
          .from('products')
          .select('id, title, price, image_url, image_urls')
          .order('created_at', { ascending: false })
          .limit(10);

        if (prodData) {
          // Format top 3 for the product cards
          const formattedProducts = prodData.slice(0, 3).map(p => ({
            id: p.id,
            name: p.title,
            price: p.price || 0,
            img: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : p.image_url,
          }));
          setTrendingProducts(formattedProducts);

          // Use the titles of the recent products as "Popular Searches"
          const searches = prodData.map(p => p.title);
          setPopularSearches(searches);
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSearchData();
  }, []);

  // --- DYNAMIC FILTERING ---
  const filteredSearches = query 
    ? popularSearches.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : popularSearches.slice(0, 5);

  const filteredCategories = query
    ? categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : categories.slice(0, 4);

  const displayProducts = trendingProducts;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Helmet>
        <title>Search | Sarvaa Fine Jewelry</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-12 max-w-5xl">
        
        {/* Page Title */}
        <div className="mb-10 border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-serif text-gray-900">
            {query ? (
              <>Search results for <span className="text-rose-600 font-bold">"{query}"</span></>
            ) : (
              "Discover Jewelry"
            )}
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4 text-rose-400" />
            <p className="text-sm">Curating suggestions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN: Keyword & Category Suggestions */}
            <div className="md:col-span-5 space-y-10">
              
              {/* 1. Keyword Suggestions */}
              {(filteredSearches.length > 0 || !query) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-rose-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      {query ? "Suggested Searches" : "Popular Searches"}
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {filteredSearches.map((suggestion, idx) => (
                      <li key={idx}>
                        <button 
                          // Navigate to actual search results
                          onClick={() => navigate(`/search-results?q=${encodeURIComponent(suggestion)}`)}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 text-gray-700 hover:text-rose-600 font-medium transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span className="flex items-center gap-3 truncate pr-4">
                            <Search size={14} className="text-gray-300 group-hover:text-rose-400 shrink-0" />
                            {/* Highlight matching text */}
                            {query ? (
                              <span className="truncate">
                                <span className="font-bold text-rose-600">
                                  {suggestion.substring(0, query.length)}
                                </span>
                                {suggestion.substring(query.length)}
                              </span>
                            ) : (
                              <span className="truncate">{suggestion}</span>
                            )}
                          </span>
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 2. Category Suggestions */}
              {(filteredCategories.length > 0 || !query) && (
                <div>
                  <div className="flex items-center gap-2 mb-4 border-t border-gray-50 pt-8">
                    <FolderSearch size={16} className="text-rose-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Category Suggestions
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filteredCategories.map((cat, idx) => (
                      <button 
                        key={idx}
                        // Navigate directly to the category page
                        onClick={() => navigate(`/category/${cat.slug}`)}
                        className="px-5 py-2.5 bg-gray-50 border border-gray-100 hover:border-rose-200 hover:bg-rose-50 text-sm font-semibold text-gray-700 hover:text-rose-600 rounded-xl transition-colors shadow-sm cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Trending Products */}
            <div className="md:col-span-7 pl-0 md:pl-8 md:border-l border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={16} className="text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Trending Products
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {displayProducts.map((product) => (
                  <button 
                    key={product.id}
                    // Navigate directly to the product detail page
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group flex flex-col text-left cursor-pointer"
                  >
                    <div className="aspect-[4/5] rounded-2xl bg-gray-50 overflow-hidden relative mb-3 border border-gray-100 shadow-sm group-hover:shadow-lg transition-all w-full">
                      <img 
                        src={product.img} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 truncate w-full group-hover:text-rose-600 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-sm font-bold text-rose-600">₹{product.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;