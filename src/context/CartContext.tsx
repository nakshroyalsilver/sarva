import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  qty: number;
  size?: string;
}

interface CartContextType {
  // Cart State
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;

  // Wishlist State (NEW)
  wishlistItems: Product[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // --- CART STATE ---
  // CHANGED: Initialize from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("sarvaa_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // CHANGED: Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("sarvaa_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, size: string = "Standard") => {
    setCartItems((prev) => {
      // CHANGED: Check for BOTH product.id and size
      const existing = prev.find((item) => item.id === product.id && item.size === size);
      
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === size ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, size }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, qty: Math.max(1, item.qty + delta) };
        }
        return item;
      })
    );
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // --- WISHLIST STATE (NEW) ---
  // CHANGED: Initialize from localStorage
  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    const savedWishlist = localStorage.getItem("sarvaa_wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // CHANGED: Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("sarvaa_wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const wishlistCount = wishlistItems.length;

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, cartCount, addToCart, removeFromCart, updateQty, 
        wishlistItems, wishlistCount, toggleWishlist 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};