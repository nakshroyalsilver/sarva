import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; 

import { CartProvider } from "./context/CartContext";
import PincodeModal from "../src/components/home/PincodeModal";
import RouteTracker from "./components/RouteTracker";

//  Code Splitting: Pages are now lazily loaded
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const CorporatePage = lazy(() => import("./pages/CorporatePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const MyOrders = lazy(() => import("./pages/MyOrders")); 
const PriceFilteredPage = lazy(() => import("./pages/PriceFilteredPage"));
const GiftCollectionPage = lazy(() => import("./pages/GiftCollectionPage"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ShippingReturns = lazy(() => import("./pages/ShippingReturns"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
         
          <RouteTracker />
          
          <CartProvider>
            <PincodeModal /> 

            {/* Suspense is required by React for lazy loading, but fallback={null} means NO spinner */}
            <Suspense fallback={null}>
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
                <Route path="/my-orders" element={<MyOrders />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;