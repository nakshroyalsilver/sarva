import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../supabase"; 

// --- NEW: Define the Product type here instead of importing from fake data ---
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  [key: string]: any; // Allows for any extra fields coming from Supabase
}

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
  clearCart: () => void; 

  // Wishlist State
  wishlistItems: Product[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  
  // --- STATE INITIALIZATION ---
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("sarvaa_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    const savedWishlist = localStorage.getItem("sarvaa_wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  //  THE MAGIC: GUEST-TO-USER MERGE LISTENER
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const userEmail = session.user.email;
        
        // 1. Check if there is an active guest cart waiting to be merged
        if (localStorage.getItem("guest_data_active") === "true") {
          const guestCart = JSON.parse(localStorage.getItem("sarvaa_cart") || "[]");
          const guestWishlist = JSON.parse(localStorage.getItem("sarvaa_wishlist") || "[]");

          const userCart = JSON.parse(localStorage.getItem(`sarvaa_cart_${userEmail}`) || "[]");
          const userWishlist = JSON.parse(localStorage.getItem(`sarvaa_wishlist_${userEmail}`) || "[]");

          // Merge Carts: Combine quantities for identical items
          let mergedCart = [...userCart];
          guestCart.forEach((gItem: CartItem) => {
            const existing = mergedCart.find((uItem: CartItem) => uItem.id === gItem.id && uItem.size === gItem.size);
            if (existing) {
              existing.qty += gItem.qty;
            } else {
              mergedCart.push(gItem);
            }
          });

          // Merge Wishlists: Prevent duplicates
          let mergedWishlist = [...userWishlist];
          guestWishlist.forEach((gItem: Product) => {
            if (!mergedWishlist.find((uItem: Product) => uItem.id === gItem.id)) {
              mergedWishlist.push(gItem);
            }
          });

          // Apply the merge to the screen immediately
          setCartItems(mergedCart);
          setWishlistItems(mergedWishlist);
          
          // Clear the flag so it doesn't double-merge if they hit refresh
          localStorage.removeItem("guest_data_active");

        } else {
           // 2. If no guest items were added, load their old saved cart (great for logging in on a new device)
           const activeCart = localStorage.getItem("sarvaa_cart");
           if (!activeCart || activeCart === "[]") {
              const savedUserCart = localStorage.getItem(`sarvaa_cart_${userEmail}`);
              if (savedUserCart) setCartItems(JSON.parse(savedUserCart));
              
              const savedUserWishlist = localStorage.getItem(`sarvaa_wishlist_${userEmail}`);
              if (savedUserWishlist) setWishlistItems(JSON.parse(savedUserWishlist));
           }
        }
      } else if (event === 'SIGNED_OUT') {
        // When they log out, wipe the cart so the next guest starts perfectly fresh!
        setCartItems([]);
        setWishlistItems([]);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  //  SAVE CART STATE (Maintains active cart AND backs it up to the User's profile)
  useEffect(() => {
    localStorage.setItem("sarvaa_cart", JSON.stringify(cartItems));
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const email = JSON.parse(userStr).email;
        if (email) localStorage.setItem(`sarvaa_cart_${email}`, JSON.stringify(cartItems));
      } catch (e) {}
    }
  }, [cartItems]);

  // SAVE WISHLIST STATE
  useEffect(() => {
    localStorage.setItem("sarvaa_wishlist", JSON.stringify(wishlistItems));
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const email = JSON.parse(userStr).email;
        if (email) localStorage.setItem(`sarvaa_wishlist_${email}`, JSON.stringify(wishlistItems));
      } catch (e) {}
    }
  }, [wishlistItems]);

  // Silently flags the browser when a guest is actively shopping
  const flagGuestData = () => {
    if (!localStorage.getItem("currentUser")) {
      localStorage.setItem("guest_data_active", "true");
    }
  };

  const addToCart = (product: Product, size: string = "Standard") => {
    flagGuestData();
    setCartItems((prev) => {
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
    flagGuestData();
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    flagGuestData();
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, qty: Math.max(1, item.qty + delta) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    flagGuestData();
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const toggleWishlist = (product: Product) => {
    flagGuestData();
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
        cartItems, cartCount, addToCart, removeFromCart, updateQty, clearCart,
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