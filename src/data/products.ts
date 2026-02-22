export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "rings" | "necklaces" | "earrings" | "bracelets";
  badge?: string;
  rating: number;
  reviews: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
}

export const categories: Category[] = [
  { id: "1", name: "Rings", slug: "rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop", count: 48 },
  { id: "2", name: "Necklaces & Pendants", slug: "necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop", count: 36 },
  { id: "3", name: "Earrings", slug: "earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop", count: 52 },
  { id: "4", name: "Bracelets & Bangles", slug: "bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop", count: 29 },
];

export const products: Product[] = [
  // Rings
  { id: "r1", name: "Twisted Silver Band", price: 1299, originalPrice: 1799, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop", category: "rings", badge: "Best Seller", rating: 4.8, reviews: 124 },
  { id: "r2", name: "Minimalist Stacking Ring", price: 899, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop", category: "rings", rating: 4.6, reviews: 89 },
  { id: "r3", name: "Celestial Moon Ring", price: 1599, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop", category: "rings", badge: "New", rating: 4.9, reviews: 32 },
  { id: "r4", name: "Vintage Filigree Ring", price: 2199, originalPrice: 2799, image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop", category: "rings", rating: 4.7, reviews: 67 },

  // Necklaces
  { id: "n1", name: "Dainty Chain Pendant", price: 1499, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop", category: "necklaces", badge: "Trending", rating: 4.9, reviews: 156 },
  { id: "n2", name: "Layered Silver Necklace", price: 2499, originalPrice: 2999, image: "https://images.unsplash.com/photo-1515562141589-67f0d569b03e?w=400&h=400&fit=crop", category: "necklaces", rating: 4.7, reviews: 98 },
  { id: "n3", name: "Heart Locket Pendant", price: 1899, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop", category: "necklaces", badge: "New", rating: 4.5, reviews: 45 },
  { id: "n4", name: "Pearl Drop Necklace", price: 3299, image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop", category: "necklaces", rating: 4.8, reviews: 73 },

  // Earrings
  { id: "e1", name: "Silver Hoop Earrings", price: 999, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop", category: "earrings", badge: "Best Seller", rating: 4.8, reviews: 203 },
  { id: "e2", name: "Crystal Stud Earrings", price: 799, originalPrice: 1099, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop", category: "earrings", rating: 4.6, reviews: 145 },
  { id: "e3", name: "Dangling Leaf Earrings", price: 1399, image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop", category: "earrings", badge: "New", rating: 4.7, reviews: 28 },
  { id: "e4", name: "Geometric Drop Earrings", price: 1199, image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop", category: "earrings", rating: 4.5, reviews: 61 },

  // Bracelets
  { id: "b1", name: "Silver Chain Bracelet", price: 1699, image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop", category: "bracelets", badge: "Trending", rating: 4.9, reviews: 87 },
  { id: "b2", name: "Charm Bangle Set", price: 2199, originalPrice: 2799, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop", category: "bracelets", rating: 4.7, reviews: 112 },
  { id: "b3", name: "Minimalist Cuff Bracelet", price: 1899, image: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?w=400&h=400&fit=crop", category: "bracelets", badge: "New", rating: 4.6, reviews: 34 },
  { id: "b4", name: "Woven Silver Bracelet", price: 1499, image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&h=400&fit=crop", category: "bracelets", rating: 4.8, reviews: 56 },
];

export const bestSellers = products.filter((p) => p.badge === "Best Seller" || p.badge === "Trending");
export const newArrivals = products.filter((p) => p.badge === "New");
