import { useState, useEffect, useMemo } from "react";
import { Star, MessageSquare, CheckCircle2, User } from "lucide-react"; // <-- Added User icon here
import { supabase } from "../../../supabase"; 
import { motion, AnimatePresence } from "framer-motion";
// Ensure this helper exists in your project
import { getReviewsForProduct } from "@/data/mockReviews"; 

interface ProductReviewsProps {
  productId: string;
  categoryName?: string; // Passed from ProductDetailPage
}

const ProductReviews = ({ productId, categoryName = "" }: ProductReviewsProps) => {
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUserName(JSON.parse(storedUser).name);
    }
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDbReviews(data);
    }
    setLoading(false);
  };

  // --- LOGIC: Combine DB reviews with Category-Specific Mock reviews ---
  const allReviews = useMemo(() => {
    // 1. Get the 3 category-specific mock reviews
    const mocks = getReviewsForProduct(productId, categoryName);
    
    // 2. Format Mocks to match your Database schema
    const formattedMocks = mocks.map(m => ({
      id: m.id,
      user_name: m.author,
      rating: m.rating,
      comment: m.content,
      created_at: new Date(Date.now() - 1000000).toISOString(),
      is_mock: true, // Flag to identify them
      verified: m.verified
    }));

    // 3. Merge: Real reviews first, then Mocks
    return [...dbReviews, ...formattedMocks];
  }, [dbReviews, productId, categoryName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !userName.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('reviews').insert([{
      product_id: productId,
      user_name: userName,
      rating: rating,
      comment: comment
    }]);

    if (!error) {
      setComment("");
      setRating(5);
      setShowForm(false);
      fetchReviews();
    }
    setIsSubmitting(false);
  };

  const averageRating = allReviews.length > 0 
    ? (allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="border-t border-gray-100 py-12 mt-12 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-3">
              <div className="flex text-rose-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} strokeWidth={1.5} className={i < Math.round(Number(averageRating)) ? "" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">{averageRating} out of 5</span>
              <span className="text-xs text-gray-400 font-medium">({allReviews.length} Reviews)</span>
            </div>
          </div>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors w-fit cursor-pointer"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        </div>

        {/* WRITE REVIEW FORM */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-10">
              <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-100 p-6 md:p-8 rounded-2xl">
                <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setRating(star)} className="cursor-pointer">
                        <Star size={24} fill={star <= rating ? "#e11d48" : "none"} className={star <= rating ? "text-rose-600" : "text-gray-300"} />
                      </button>
                    ))}
                </div>
                <input required type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your Name" className="w-full mb-4 p-3 rounded-xl border border-gray-200 outline-none focus:border-rose-500 bg-white" />
                <textarea required value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your Thoughts..." rows={4} className="w-full mb-6 p-3 rounded-xl border border-gray-200 outline-none focus:border-rose-500 bg-white resize-none" />
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="bg-rose-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50">
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REVIEWS LIST */}
        <div className="grid md:grid-cols-2 gap-6">
          {loading ? (
            <p className="col-span-2 text-center text-sm text-gray-400 py-10">Loading reviews...</p>
          ) : allReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-stone-200 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  
                  {/* --- NEW PREMIUM AVATAR REPLACEMENT --- */}
                  <div className="w-10 h-10 rounded-full bg-stone-50 text-stone-400 flex items-center justify-center border border-stone-100 shrink-0">
                    <User size={18} strokeWidth={1.5} />
                  </div>
                  {/* --------------------------------------- */}

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      {review.user_name}
                      {review.verified && (
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {review.is_mock ? 'Recent Purchase' : new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-rose-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} className={i < review.rating ? "" : "text-gray-300"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">"{review.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;