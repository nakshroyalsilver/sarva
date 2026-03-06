import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>Terms of Service | SARVAA Fine Jewelry</title>
      </Helmet>

      <Navbar />

      <main className="flex-grow">
        <section className="bg-[#FDFBF9] py-12 md:py-16 text-center px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Terms of Service</h1>
            <p className="text-gray-500 font-light">Effective Date: March 1, 2025</p>
          </div>
        </section>

        <section className="py-10 md:py-16 px-6">
          <div className="max-w-3xl mx-auto space-y-10 text-gray-600 leading-relaxed text-sm md:text-base">
            
            <p>
              Welcome to SARVAA. By accessing or using our website and purchasing our products, you agree to these Terms of Service. Please read them carefully.
            </p>

            <div>
              <h2 className="font-serif text-xl text-gray-900 mb-3 border-b border-gray-100 pb-2">General Terms</h2>
              <p>These terms apply to all visitors, users, and customers of SARVAA ("we," "us," or "our"). By placing an order, you confirm that you are at least 18 years old and legally capable of entering into binding contracts.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-gray-900 mb-3 border-b border-gray-100 pb-2">Products and Pricing</h2>
              <h3 className="font-bold text-gray-900 mt-4 mb-2">Product Information</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-gray-300">
                <li>All SARVAA jewelry is crafted in 925 sterling silver.</li>
                <li>Product descriptions, images, and specifications are provided for reference and may vary slightly.</li>
                <li>We make every effort to display accurate colors and details, but variations may occur due to screen settings.</li>
              </ul>

              <h3 className="font-bold text-gray-900 mt-6 mb-2">Pricing</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-gray-300">
                <li>All prices are listed in Indian Rupees (₹).</li>
                <li>Prices are subject to change without notice.</li>
                <li>Prices include applicable GST (Goods and Services Tax).</li>
                <li>The price at the time of order placement is the final price charged.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl text-gray-900 mb-3 border-b border-gray-100 pb-2">Orders and Payment</h2>
              <ul className="list-disc pl-5 space-y-2 marker:text-gray-300">
                <li><strong>Order Acceptance:</strong> We reserve the right to refuse or cancel any order for any reason, including product unavailability or suspected fraud. If cancelled, payment will be refunded within 7–10 business days.</li>
                <li><strong>Payment:</strong> Payment must be completed at the time of order placement. We accept credit/debit cards, UPI, and net banking. We do not store your payment details.</li>
                <li><strong>Order Processing:</strong> Orders are processed within 1–2 business days. Shipping timelines begin after order processing is complete.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl text-gray-900 mb-3 border-b border-gray-100 pb-2">Product Quality and Warranty</h2>
              <p className="mb-2"><strong>Material:</strong> All jewelry is made from 925 sterling silver. Sterling silver naturally tarnishes over time — this is not a defect.</p>
              <p><strong>Warranty:</strong> We stand behind the quality of our craftsmanship. Manufacturing defects reported within 7 days of delivery will be exchanged. Normal wear and tear, damage from misuse, or tarnishing due to improper care are not covered.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <div>
                <h2 className="font-serif text-lg text-gray-900 mb-2 border-b border-gray-100 pb-1">Intellectual Property</h2>
                <p className="text-sm">All content on this website, including images, text, logos, and designs, is the property of SARVAA and protected by copyright. You may not reproduce content without written permission.</p>
              </div>
              <div>
                <h2 className="font-serif text-lg text-gray-900 mb-2 border-b border-gray-100 pb-1">Limitation of Liability</h2>
                <p className="text-sm">SARVAA is not liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Liability is limited to the purchase price of the product.</p>
              </div>
              <div>
                <h2 className="font-serif text-lg text-gray-900 mb-2 border-b border-gray-100 pb-1">Governing Law</h2>
                <p className="text-sm">These Terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.</p>
              </div>
              <div>
                <h2 className="font-serif text-lg text-gray-900 mb-2 border-b border-gray-100 pb-1">Contact Us</h2>
                <p className="text-sm">If you have questions about these terms, contact us at: <a href="mailto:nakshroyalsilver@gmail.com" className="text-rose-600 hover:underline">nakshroyalsilver@gmail.com</a></p>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;