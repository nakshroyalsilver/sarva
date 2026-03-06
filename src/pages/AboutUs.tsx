import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar"; 
import Footer from "@/components/layout/Footer"; 

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>About Us | SARVAA Fine Jewelry</title>
        <meta name="description" content="SARVAA is modern silver jewelry designed for the way you move through the world." />
      </Helmet>

      <Navbar />

      <main className="flex-grow">
        {/* COMPACT HERO SECTION */}
        <section className="bg-[#FDFBF9] py-12 md:py-16 text-center px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">About Us</h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light">
              SARVAA is modern silver jewelry designed for the way you move through the world.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="py-12 md:py-16 px-6">
          <div className="max-w-3xl mx-auto space-y-16">
            
            {/* What We Make & Why Silver */}
            <div className="grid md:grid-cols-2 gap-10 md:gap-12">
              <div>
                <h2 className="font-serif text-2xl text-gray-900 mb-4">What We Make</h2>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Sterling silver pieces that balance elegance with intelligence. Not trend-driven. Not heavy with embellishment. Just clean, considered design.
                  <br /><br />
                  We create jewelry for women who value simplicity without sacrificing presence — pieces that work as well in a boardroom as they do over weekend coffee.
                </p>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-gray-900 mb-4">Why Silver</h2>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Silver is understated. It doesn't compete. It complements.
                  <br /><br />
                  In a world of excess, we choose restraint. Every piece in our collection is crafted in 925 sterling silver — timeless, versatile, and built to last.
                </p>
              </div>
            </div>

            {/* How We Work */}
            <div className="border-y border-gray-100 py-12 text-center">
              <h2 className="font-serif text-2xl text-gray-900 mb-6">How We Work</h2>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
                Each piece is handcrafted in India with attention to detail and quality. We don't mass-produce. We don't chase trends. We design jewelry that remains relevant season after season.
                <br /><br />
                <span className="font-medium text-gray-900">SARVAA is a curated collection, not a catalog. Fewer pieces, more thought.</span>
              </p>
            </div>

            {/* Our Approach (Grid) */}
            <div>
              <h2 className="font-serif text-2xl text-gray-900 mb-8 text-center">Our Approach</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <h3 className="font-bold tracking-widest uppercase text-xs text-gray-900 mb-3">Intelligent Design</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We design for real life — pieces that layer, transition, and move with you. Functional elegance.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <h3 className="font-bold tracking-widest uppercase text-xs text-gray-900 mb-3">Quality First</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Every piece is inspected before it reaches you. We stand behind our craftsmanship.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <h3 className="font-bold tracking-widest uppercase text-xs text-gray-900 mb-3">Honest Pricing</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    No inflated markups. No constant sales. Just fair pricing for quality silver jewelry.
                  </p>
                </div>
              </div>
            </div>

            {/* For Whom & Contact */}
            <div className="bg-rose-950 text-white rounded-3xl p-10 md:p-16 text-center">
              <h2 className="font-serif text-2xl md:text-3xl mb-6">For Whom</h2>
              <p className="text-rose-100 leading-relaxed text-sm md:text-base max-w-2xl mx-auto mb-10">
                SARVAA is for women who appreciate design that doesn't shout. Who value craft over decoration. Who want jewelry that feels like a considered choice, not an impulse.
                <br /><br />
                If you move through the world with intention, SARVAA is for you.
              </p>
              
              <div className="inline-block border border-rose-800/50 bg-rose-900/30 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Get in Touch</h3>
                <p className="text-sm text-rose-200 mb-4">We're building something thoughtful here. If you have questions, ideas, or just want to talk about design, reach out.</p>
                <a href="mailto:nakshroyalsilver@gmail.com" className="text-white font-medium hover:text-rose-200 transition-colors underline underline-offset-4 decoration-rose-500/50">
                  nakshroyalsilver@gmail.com
                </a>
              </div>

              <p className="mt-12 text-sm italic text-rose-300 font-serif">
                "Silver for the way you move through the world."
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;