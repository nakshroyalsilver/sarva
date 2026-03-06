import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ShippingReturns = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>Shipping & Returns | SARVAA Fine Jewelry</title>
        <meta name="description" content="Learn about SARVAA's shipping timelines, return policies, and jewelry care instructions." />
      </Helmet>

      <Navbar />

      <main className="flex-grow">
        <section className="bg-[#FDFBF9] py-12 md:py-16 text-center px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Shipping & Returns</h1>
            <p className="text-gray-500 font-light">Everything you need to know about your order.</p>
          </div>
        </section>

        <section className="py-10 md:py-16 px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Shipping Section */}
            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-6 border-b border-gray-100 pb-3">Shipping</h2>
              <p className="text-gray-600 mb-4">We deliver carefully packaged jewelry across India.</p>
              
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mt-6 mb-3">Delivery Timeline</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-6 marker:text-rose-300">
                <li><strong>Tier 1 cities:</strong> 1–5 business days</li>
                <li><strong>Tier 2, 3, 4 cities:</strong> 3–7 business days</li>
              </ul>

              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mt-6 mb-3">Shipping Costs</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-4 marker:text-rose-300">
                <li><strong>Free shipping</strong> on orders above ₹2,999</li>
                <li>Standard shipping charges apply for orders below ₹2,999</li>
              </ul>
              <p className="text-gray-600 text-sm italic">
                *International shipping is available. Delivery timelines and costs vary by destination.
              </p>
            </div>

            {/* Returns Section */}
            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-6 border-b border-gray-100 pb-3">Returns and Exchanges</h2>
              <p className="text-gray-600 mb-4">We accept exchanges within 7 days of delivery for damaged or defective products only.</p>

              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-3">Important Notes</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm marker:text-rose-400">
                  <li>We do not offer refunds at this time — <strong>exchanges only</strong>.</li>
                  <li><strong>Earrings cannot be returned or exchanged</strong> due to hygiene reasons.</li>
                  <li>Customer is responsible for return shipping costs.</li>
                  <li>Exchanges are processed within 5–7 business days of receiving the returned product.</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-3">Eligibility</h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm marker:text-gray-300">
                    <li>Product must be unworn and in original condition</li>
                    <li>Original packaging, tags, and certificate must be intact</li>
                    <li>Return request must be initiated within 24 hours of receiving</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-3">What qualifies as defective</h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm marker:text-gray-300">
                    <li>Manufacturing defects</li>
                    <li>Broken clasps or chains</li>
                    <li>Missing or loose stones</li>
                    <li>Tarnished or discolored finish upon arrival</li>
                  </ul>
                </div>
              </div>

              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mt-8 mb-3">Exchange Process</h3>
              <ol className="list-decimal pl-5 text-gray-600 space-y-2 marker:text-gray-400 font-medium">
                <li><span className="font-normal">Contact us at <strong>nakshroyalsilver@gmail.com</strong> within 24 hours of delivery.</span></li>
                <li><span className="font-normal">Provide order number and photos of the damaged product.</span></li>
                <li><span className="font-normal">Our team will review and approve the exchange.</span></li>
                <li><span className="font-normal">Return the product in original packaging.</span></li>
                <li><span className="font-normal">Replacement will be shipped once we receive and verify the returned item.</span></li>
              </ol>
            </div>

            {/* Care Instructions */}
            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-6 border-b border-gray-100 pb-3">Care Instructions</h2>
              <p className="text-gray-600 mb-4">All SARVAA jewelry is crafted in authentic 925 sterling silver. To maintain the finish:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2 marker:text-rose-300">
                <li>Store in a cool, dry place away from moisture</li>
                <li>Keep in the provided pouch or box when not worn</li>
                <li>Avoid contact with perfumes, lotions, or harsh chemicals</li>
                <li>Clean gently with a soft cloth after each wear</li>
                <li>Remove before bathing, swimming, or exercising</li>
              </ul>
              <p className="text-gray-500 mt-6 italic text-sm">
                Silver naturally tarnishes over time. This is normal and can be restored with proper care. For questions about your order, contact us at nakshroyalsilver@gmail.com.
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingReturns;