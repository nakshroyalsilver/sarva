export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
};

const genericReviews: Review[] = [
  { id: "g1", author: "Aisha P.", rating: 5, date: "2 weeks ago", title: "Absolutely stunning", content: "The craftsmanship is incredible. It arrived beautifully packaged and looks exactly like the photos.", verified: true },
  { id: "g2", author: "Meera S.", rating: 5, date: "1 month ago", title: "Perfect gift", content: "I bought this for my sister's birthday and she was completely blown away. The silver quality is top-notch.", verified: true },
  { id: "g3", author: "Priya R.", rating: 4, date: "3 months ago", title: "Beautiful design", content: "Very elegant and minimalist. It feels sturdy but looks delicate.", verified: true },
  { id: "g4", author: "Sonia V.", rating: 5, date: "3 weeks ago", title: "Exceptional quality", content: "This is my third purchase from Sarvaa and I am never disappointed. The polish is perfect.", verified: true },
  { id: "g5", author: "Neha K.", rating: 4, date: "4 months ago", title: "Elegant packaging", content: "The jewelry box it comes in makes it feel so special. The presentation is 10/10.", verified: false },
  { id: "g6", author: "Ritu M.", rating: 5, date: "5 days ago", title: "Value for money", content: "I was skeptical about buying silver online, but the hallmark is clear and the weight is perfect.", verified: true },
  { id: "g7", author: "Ankita J.", rating: 5, date: "1 month ago", title: "Timeless", content: "I've worn this every day for a month including in the shower, and it hasn't lost its shine at all.", verified: true },
  { id: "g8", author: "Ishita D.", rating: 5, date: "12 days ago", title: "Pure Elegance", content: "The finish is so smooth. It doesn't look like cheap silver at all, has that white gold glow.", verified: true },
  { id: "g9", author: "Sanya L.", rating: 5, date: "2 months ago", title: "Highly recommend", content: "If you are looking for authentic 925 silver, this is the place. Very happy with the purchase.", verified: true }
];

const pendantReviews: Review[] = [
  { id: "p1", author: "Isha B.", rating: 5, date: "1 week ago", title: "Detailed carving", content: "The details on this pendant are much finer than I expected. It looks very premium.", verified: true },
  { id: "p2", author: "Kavita D.", rating: 5, date: "2 weeks ago", title: "Perfect size", content: "Not too big, not too small. It's the perfect statement piece for the office.", verified: true },
  { id: "p3", author: "Anjali F.", rating: 4, date: "1 month ago", title: "Lovely shine", content: "The silver has a beautiful mirror-like finish. Looks great on a silver chain.", verified: true },
  { id: "p4", author: "Surbhi W.", rating: 5, date: "2 months ago", title: "Truly unique", content: "I haven't seen a design like this anywhere else. It feels like a boutique piece.", verified: true },
  { id: "p5", author: "Ridhi G.", rating: 5, date: "3 months ago", title: "Solid silver", content: "Has a good weight to it. You can tell it's high-quality 925 silver.", verified: true },
  { id: "p6", author: "Aditi L.", rating: 5, date: "10 days ago", title: "Dainty & Classy", content: "It's so elegant. I paired it with a thin snake chain and it looks like white gold.", verified: true },
  { id: "p7", author: "Pooja H.", rating: 5, date: "3 weeks ago", title: "Obsessed!", content: "The way the light hits the engraving on this pendant is just magical.", verified: true },
  { id: "p8", author: "Sanjana V.", rating: 4, date: "2 months ago", title: "Gift for mom", content: "My mom loved the intricate design. The silver is very high grade.", verified: true },
  { id: "p9", author: "Komal Y.", rating: 5, date: "5 days ago", title: "Perfect Charm", content: "The size is just right for my daily chain. It's subtle but noticeable.", verified: true }
];

const necklaceReviews: Review[] = [
  { id: "n1", author: "Kritika M.", rating: 5, date: "3 weeks ago", title: "Sits perfectly", content: "The chain length is exactly what I wanted. It rests beautifully on the collarbone.", verified: true },
  { id: "n2", author: "Sneha D.", rating: 4, date: "1 month ago", title: "Elegant piece", content: "The design is dainty but very detailed. I haven't taken it off since I bought it.", verified: true },
  { id: "n3", author: "Roshni P.", rating: 5, date: "2 weeks ago", title: "Sturdy chain", content: "I usually worry about thin silver chains snapping, but this one feels incredibly strong.", verified: true },
  { id: "n4", author: "Jaya S.", rating: 5, date: "2 months ago", title: "Perfect layering", content: "I bought this to layer with my other necklaces and it looks amazing.", verified: true },
  { id: "n5", author: "Divya C.", rating: 4, date: "3 months ago", title: "Beautiful finish", content: "The polish on this necklace is like a mirror. It really stands out.", verified: false },
  { id: "n6", author: "Vanshika T.", rating: 5, date: "1 week ago", title: "Everyday staple", content: "I've been looking for a necklace that doesn't feel heavy. This is perfect.", verified: true },
  { id: "n7", author: "Barkha L.", rating: 5, date: "2 months ago", title: "Doesn't tangle", content: "The links are so smooth they don't get caught in my hair at the back.", verified: true },
  { id: "n8", author: "Shweta M.", rating: 5, date: "3 days ago", title: "Great Clasp", content: "Finally a necklace with a sturdy clasp that I can put on myself without help!", verified: true },
  { id: "n9", author: "Rina J.", rating: 4, date: "1 month ago", title: "Shiny silver", content: "Beautifully polished. It looks much more expensive than the price paid.", verified: true }
];

const earringReviews: Review[] = [
  { id: "e1", author: "Riya T.", rating: 5, date: "Just now", title: "Lightweight!", content: "I have sensitive ears and these haven't bothered me at all. They are so light.", verified: true },
  { id: "e2", author: "Ananya J.", rating: 5, date: "4 months ago", title: "Beautiful drop", content: "These frame the face perfectly. The silver has kept its shine beautifully.", verified: true },
  { id: "e3", author: "Mehak B.", rating: 4, date: "1 month ago", title: "Secure backing", content: "The clasps on these are incredibly secure. I am not worried about them falling off.", verified: true },
  { id: "e4", author: "Simran K.", rating: 5, date: "2 weeks ago", title: "Very chic", content: "These instantly elevate any outfit. Wore them to a wedding and got so many compliments.", verified: true },
  { id: "e5", author: "Anita P.", rating: 5, date: "1 month ago", title: "No irritation", content: "Truly hypoallergenic. My ears usually react immediately, but these have been perfect.", verified: true },
  { id: "e6", author: "Trisha S.", rating: 5, date: "5 days ago", title: "Classic hoops", content: "The size is perfect for both Western and ethnic wear. Very versatile.", verified: true },
  { id: "e7", author: "Kaveri G.", rating: 5, date: "1 month ago", title: "Sparkle!", content: "The silver is so well-polished it looks like diamonds are set in them when the sun hits.", verified: true },
  { id: "e8", author: "Priti U.", rating: 5, date: "2 weeks ago", title: "Day to Night", content: "Perfect for the office but sparkly enough for dinner. My new favorites.", verified: true },
  { id: "e9", author: "Nidhi O.", rating: 4, date: "3 weeks ago", title: "Great design", content: "The craftsmanship is visible. Very detailed and the silver feels solid.", verified: true }
];

const braceletReviews: Review[] = [
  { id: "b1", author: "Vidya G.", rating: 4, date: "1 week ago", title: "Lovely stacker", content: "Perfect for stacking with my other silver pieces. The lock is very secure.", verified: true },
  { id: "b2", author: "Kavya M.", rating: 5, date: "3 weeks ago", title: "Fits my small wrist", content: "The adjustable clasp on this is perfect. It doesn't slide off like most bangles.", verified: true },
  { id: "b3", author: "Shreya L.", rating: 5, date: "2 months ago", title: "Smooth links", content: "The links are incredibly smooth. I wear lots of knits and it has never snagged.", verified: true },
  { id: "b4", author: "Ritu S.", rating: 4, date: "1 month ago", title: "Subtle elegance", content: "It's simple, shiny, and exactly what I needed for everyday wear at the office.", verified: true },
  { id: "b5", author: "Anjali D.", rating: 5, date: "3 months ago", title: "Amazing gift", content: "Gifted this to my best friend and she loved it. Looks way more expensive than it is.", verified: true },
  { id: "b6", author: "Deepika K.", rating: 5, date: "2 weeks ago", title: "Flexible & Strong", content: "I've snapped bracelets before but this one feels very well made and durable.", verified: true },
  { id: "b7", author: "Pooja K.", rating: 5, date: "10 days ago", title: "Bangle style", content: "The finish is impeccable. It looks great paired with a watch.", verified: true }
];

export const getReviewsForProduct = (productId: string | number, categoryName: string = ""): Review[] => {
  const idStr = String(productId);
  // Deterministic seed based on Product ID
  const idHash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let categoryPool = genericReviews;
  const lowerCat = categoryName.toLowerCase();

  // Category Matching
  if (lowerCat.includes('pendant')) categoryPool = pendantReviews;
  else if (lowerCat.includes('necklace') || lowerCat.includes('chain')) categoryPool = necklaceReviews;
  else if (lowerCat.includes('earring')) categoryPool = earringReviews;
  else if (lowerCat.includes('bracelet') || lowerCat.includes('bangle')) categoryPool = braceletReviews;

  const combinedPool = [...categoryPool, ...genericReviews];
  
  // Pick exactly 4 unique reviews starting from a different point for every product
  const startIndex = idHash % combinedPool.length;
  const selected: Review[] = [];
  
  for (let i = 0; i < 4; i++) {
    const index = (startIndex + i) % combinedPool.length;
    selected.push(combinedPool[index]);
  }

  return selected;
};

// --- NEW FIX: EXPORT ALL MOCK REVIEWS FOR THE TESTIMONIALS SLIDER ---
export const allMockReviews: Review[] = [
  ...genericReviews,
  ...pendantReviews,
  ...necklaceReviews,
  ...earringReviews,
  ...braceletReviews
];