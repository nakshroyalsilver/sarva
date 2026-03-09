declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const logEvent = (eventName: string, eventParams?: object) => {
  // 👇 ADD THIS LINE RIGHT HERE
  console.log(`📡 Sending to Google: ${eventName}`, eventParams); 

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

export const analytics = {
  trackProductView: (product: any) => {
    logEvent("view_item", {
      currency: "INR",
      value: product.price,
      items: [{ item_id: product.id, item_name: product.title || product.name, price: product.price }]
    });
  },
  trackAddToCart: (product: any, quantity: number) => {
    logEvent("add_to_cart", {
      currency: "INR",
      value: product.price * quantity,
      items: [{ item_id: product.id, item_name: product.title || product.name, quantity: quantity }]
    });
  },
  trackBeginCheckout: (cartTotal: number, cartItems: any[]) => {
    logEvent("begin_checkout", {
      currency: "INR",
      value: cartTotal,
      items: cartItems.map(item => ({ item_id: item.id, item_name: item.title || item.name, quantity: item.qty || 1, price: item.price }))
    });
  },
  trackWhatsAppOrder: (orderId: string, total: number) => {
    logEvent("purchase", {
      transaction_id: orderId,
      currency: "INR",
      value: total,
      payment_type: "whatsapp_manual"
    });
  },

  // --- NEW EVENTS ADDED BELOW ---

  // For CartPage.tsx
  trackViewCart: (cartTotal: number, cartItems: any[]) => {
    logEvent("view_cart", {
      currency: "INR",
      value: cartTotal,
      items: cartItems.map(item => ({ item_id: item.id, item_name: item.title || item.name, quantity: item.qty, price: item.price }))
    });
  },
  
  // For CategoryPage.tsx
  trackViewCategory: (categoryName: string, items: any[]) => {
    logEvent("view_item_list", {
      item_list_id: categoryName,
      item_list_name: categoryName,
      items: items.slice(0, 10).map(item => ({ item_id: item.id, item_name: item.title || item.name, price: item.price }))
    });
  },

  // For SearchResultsPage.tsx
  trackSearch: (searchTerm: string) => {
    logEvent("search", {
      search_term: searchTerm
    });
  },

  // For LoginPage.tsx
  trackLogin: (method: string = "Email") => {
    logEvent("login", { method: method });
  },
  trackSignUp: (method: string = "Email") => {
    logEvent("sign_up", { method: method });
  }
};