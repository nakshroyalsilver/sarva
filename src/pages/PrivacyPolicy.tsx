import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>Privacy Policy | SARVAA Fine Jewelry</title>
      </Helmet>

      <Navbar />

      <main className="flex-grow">
        <section className="bg-[#FDFBF9] py-12 md:py-16 text-center px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-500 font-light">Effective Date: March 1, 2025</p>
          </div>
        </section>

        <section className="py-10 md:py-16 px-6">
          <div className="max-w-3xl mx-auto space-y-10 text-gray-600 leading-relaxed">
            
            <p>
              SARVAA ("we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website or place an order.
            </p>

            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-4 border-b border-gray-100 pb-2">Information We Collect</h2>
              <p className="mb-3">When you place an order or create an account, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 marker:text-gray-300">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Shipping address</li>
                <li>Billing address (if different from shipping)</li>
              </ul>
              <p className="mt-4 italic text-sm">We do not store payment card information. All payment transactions are processed securely through our payment gateway partners.</p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-4 border-b border-gray-100 pb-2">How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2 marker:text-gray-300">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to customer service inquiries</li>
                <li>Improve our website and services</li>
                <li>Send occasional updates about new products or collections (you may opt out at any time)</li>
              </ul>
              <p className="mt-4 font-medium text-gray-800">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="font-serif text-xl text-gray-900 mb-3 border-b border-gray-100 pb-2">Data Security</h2>
                <p className="text-sm">Your personal information is stored securely on encrypted servers. We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or misuse.</p>
              </div>
              <div>
                <h2 className="font-serif text-xl text-gray-900 mb-3 border-b border-gray-100 pb-2">Cookies & Analytics</h2>
                <p className="text-sm">Our website may use cookies to improve your browsing experience. We may also use analytics tools to understand how visitors use our site. This data is collected anonymously.</p>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-4 border-b border-gray-100 pb-2">Third-Party Services</h2>
              <p className="mb-3">We may share your information with trusted third-party service providers who assist us in operating our website, processing payments, or fulfilling orders. Examples include:</p>
              <ul className="list-disc pl-5 space-y-1 marker:text-gray-300">
                <li><strong>Payment gateways</strong> (for secure transactions)</li>
                <li><strong>Shipping carriers</strong> (for order delivery)</li>
                <li><strong>Email service providers</strong> (for order confirmations and updates)</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-4 border-b border-gray-100 pb-2">Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 marker:text-gray-300 mb-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal obligations)</li>
                <li>Opt out of marketing communications at any time</li>
              </ul>
              <p>To exercise any of these rights, contact us at <a href="mailto:nakshroyalsilver@gmail.com" className="text-rose-600 hover:underline">nakshroyalsilver@gmail.com</a></p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;