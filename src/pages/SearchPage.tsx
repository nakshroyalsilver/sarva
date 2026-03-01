import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, TrendingUp, FolderSearch, Sparkles, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// --- SMART SEARCH DATA ---
const popularSearches = [
  "Diamond Rings", "Gold Chains", "Bridal Sets", "Platinum Bands", 
  "Mangalsutra", "Stud Earrings", "Chokers", "Silver Rings", "Couple Rings"
];

const categoryLinks = [
  "Rings", "Earrings", "Necklaces", "Bracelets", "Gifts", "Coins"
];

const trendingProducts = [
  { id: 1, name: "Rose Gold Solitaire", price: "₹25,999", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&q=80" },
  { id: 2, name: "Kundan Choker", price: "₹12,999", img: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=200&q=80" },
  { id: 3, name: "Gold Jhumkas", price: "₹8,499", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80" },
];

const SearchPage = () => {
  const navigate = useNavigate();
  
  // Gets the search query from the Navbar's URL (e.g., /search?q=ri)
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // --- REDIRECT LOGIC ---
  // When user clicks a suggestion or product, redirect to the main page "/"
  const handleItemClick = () => {
    navigate("/"); 
  };

  // --- FILTERING ---
  const filteredSearches = query 
    ? popularSearches.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : popularSearches.slice(0, 5);

  const filteredCategories = query
    ? categoryLinks.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : categoryLinks.slice(0, 4);

  // Always show top 3 trending products
  const displayProducts = trendingProducts.slice(0, 3);

  return (
    <>
      <Helmet>
        <title>Search Jewelry | Sarvaa Sterling Silver</title>
        <meta name="description" content="Search our complete collection of handcrafted 925 sterling silver jewelry. Rings, earrings, necklaces, bracelets, and more." />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://sarvaa.com/search" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Search Jewelry | Sarvaa Sterling Silver" />
        <meta property="og:description" content="Discover handcrafted 925 sterling silver jewelry. Search our complete collection." />
        <meta property="og:url" content="https://sarvaa.com/search" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
        <Navbar />

      <main className="flex-grow container mx-auto px-6 py-12 max-w-5xl">
        
        {/* Page Title showing what they searched for via Navbar */}
        <div className="mb-10 border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-serif text-gray-900">
            {query ? (
              <>Search results for <span className="text-rose-600 font-bold">"{query}"</span></>
            ) : (
              "Discover Jewelry"
            )}
          </h1>
        </div>

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
                        onClick={handleItemClick}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 text-gray-700 hover:text-rose-600 font-medium transition-colors flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-3">
                          <Search size={14} className="text-gray-300 group-hover:text-rose-400" />
                          {/* Highlight matching text */}
                          {query ? (
                            <span>
                              <span className="font-bold text-rose-600">
                                {suggestion.substring(0, query.length)}
                              </span>
                              {suggestion.substring(query.length)}
                            </span>
                          ) : (
                            suggestion
                          )}
                        </span>
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
                      onClick={handleItemClick}
                      className="px-5 py-2.5 bg-gray-50 border border-gray-100 hover:border-rose-200 hover:bg-rose-50 text-sm font-semibold text-gray-700 hover:text-rose-600 rounded-xl transition-colors shadow-sm"
                    >
                      {cat}
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
                  onClick={handleItemClick}
                  className="group flex flex-col text-left cursor-pointer"
                >
                  <div className="aspect-[4/5] rounded-2xl bg-gray-50 overflow-hidden relative mb-3 border border-gray-100 shadow-sm group-hover:shadow-lg transition-all">
                    <img 
                      src={product.img} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-rose-600 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-sm font-bold text-rose-600">{product.price}</p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
      </div>
    </>
  );
};

export default SearchPage;