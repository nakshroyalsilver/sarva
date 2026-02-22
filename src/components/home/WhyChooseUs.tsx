import { Shield, Award, Truck, RefreshCcw } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "BIS Hallmarked",
    description: "100% Certified 925 Sterling Silver"
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Handcrafted by Expert Artisans"
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On All Orders Above ₹999"
  },
  {
    icon: RefreshCcw,
    title: "30-Day Returns",
    description: "No Questions Asked Policy"
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-8 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                  <Icon size={24} className="text-rose-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
