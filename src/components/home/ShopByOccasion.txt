import { Link } from "react-router-dom";

const occasions = [
  {
    title: "Wedding",
    image: "https://images.unsplash.com/photo-1515562141589-67f0d569b03e?w=400&q=80",
    link: "/occasion/wedding"
  },
  {
    title: "Engagement",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
    link: "/occasion/engagement"
  },
  {
    title: "Party",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
    link: "/occasion/party"
  },
  {
    title: "Daily Wear",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
    link: "/occasion/daily"
  },
  {
    title: "Festival",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
    link: "/occasion/festival"
  },
  {
    title: "Office Wear",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=80",
    link: "/occasion/office"
  }
];

const ShopByOccasion = () => {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-1.5">Find Your Perfect Piece</p>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
            Shop by Occasion
          </h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {occasions.map((occasion, idx) => (
            <Link
              key={idx}
              to={occasion.link}
              className="group flex flex-col items-center"
            >
              <div className="w-full aspect-square rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-rose-500 transition-all mb-3">
                <img
                  src={occasion.image}
                  alt={occasion.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <p className="text-xs font-medium text-gray-700 group-hover:text-rose-600 transition-colors">
                {occasion.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasion;
