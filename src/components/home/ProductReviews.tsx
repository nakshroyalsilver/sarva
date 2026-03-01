import { useState, useEffect } from "react";
import { Star, User, MessageSquare } from "lucide-react";
import { supabase } from "../../../supabase"; 
import { motion, AnimatePresence } from "framer-motion";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Auto-fill name if logged in
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
      setReviews(data);
    }
    setLoading(false);
  };

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
      fetchReviews(); // Refresh the list
    } else {
      alert("Failed to submit review. Please try again.");
    }
    setIsSubmitting(false);
  };

  // Calculate Average Rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
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
              <span className="text-xs text-gray-400 font-medium">({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
            </div>
          </div>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors w-fit"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        </div>

        {/* WRITE REVIEW FORM */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-10"
            >
              <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-100 p-6 md:p-8 rounded-2xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-6">Share Your Experience</h3>
                
                <div className="mb-6">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-2">Overall Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                        <Star size={28} fill={star <= rating ? "#e11d48" : "none"} className={star <= rating ? "text-rose-600" : "text-gray-300"} strokeWidth={1} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-2">Your Name *</label>
                    <input required type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="How should we call you?" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-500 transition-colors" />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-2">Your Review *</label>
                  <textarea required value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you love about this piece?" rows={4} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-500 transition-colors resize-none" />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="bg-rose-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-md shadow-rose-200">
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REVIEWS LIST */}
        <div className="space-y-6">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-10">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" strokeWidth={1.5} />
              <p className="text-gray-500 text-sm font-medium">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-rose-100 hover:shadow-lg hover:shadow-rose-50/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold uppercase border border-rose-100">
                        {review.user_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{review.user_name}</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">
                          {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-rose-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} className={i < review.rating ? "" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductReviews;