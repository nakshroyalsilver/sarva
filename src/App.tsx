import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // <-- SEO Import Added Here

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import { CartProvider } from "./context/CartContext";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import CorporatePage from "./pages/CorporatePage";
import SearchPage from "./pages/SearchPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import PincodeModal from "../src/components/home/PincodeModal";
import MyOrders from "./pages/MyOrders"; 
import PriceFilteredPage from "./pages/PriceFilteredPage";
import GiftCollectionPage from "./pages/GiftCollectionPage";
import AboutUs from "./pages/AboutUs";
import ShippingReturns from "./pages/ShippingReturns";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  // --- HELMET PROVIDER WRAPPING EVERYTHING ---
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartProvider>
            {/* --- PINCODE MODAL ADDED HERE --- */}
            <PincodeModal /> 

            <Routes>
              <Route path="/corporate" element={<CorporatePage />} />
              <Route path="/" element={<Index />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/search-results" element={<SearchResultsPage />} />
              <Route path="/shop/price/:maxPrice" element={<PriceFilteredPage />} />
              <Route path="/gifts/curated" element={<GiftCollectionPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              
              {/* --- ADDED MY ORDERS ROUTE --- */}
              <Route path="/my-orders" element={<MyOrders />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;