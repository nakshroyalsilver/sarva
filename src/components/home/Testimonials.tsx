import { Star } from "lucide-react";

const reviews = [
  {
    name: "Priya Sharma",
    rating: 5,
    review: "Absolutely stunning quality! The silver is so pure and the design is exquisite. Received so many compliments!",
    product: "Celestial Moon Ring",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
  },
  {
    name: "Ananya Reddy",
    rating: 5,
    review: "Fast delivery and beautiful packaging. The earrings are even more gorgeous in person. Highly recommend!",
    product: "Crystal Stud Earrings",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
  },
  {
    name: "Riya Patel",
    rating: 5,
    review: "Amazing customer service and authentic 925 silver. The necklace is perfect for daily wear. Love it!",
    product: "Dainty Chain Pendant",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riya"
  },
  {
    name: "Meera Singh",
    rating: 5,
    review: "Best jewelry purchase! The quality is outstanding and the price is so reasonable. Will definitely buy again!",
    product: "Silver Chain Bracelet",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera"
  }
];

const Testimonials = () => {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-1.5">What Our Customers Say</p>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
            Trusted by Thousands
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full bg-gray-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{review.name}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-3">{review.review}</p>
              <p className="text-[10px] text-gray-400 italic">Purchased: {review.product}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
