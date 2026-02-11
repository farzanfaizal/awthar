import { Search, MessageCircle, Calendar, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse Services",
    description: "Search for the services you need. Filter by category, location, price, and ratings to find the perfect match.",
  },
  {
    icon: MessageCircle,
    title: "Connect with Providers",
    description: "Message providers directly to discuss your requirements, ask questions, and get quotes.",
  },
  {
    icon: Calendar,
    title: "Book & Schedule",
    description: "Book a convenient time slot. Our system prevents double-bookings and ensures a smooth scheduling experience.",
  },
  {
    icon: Star,
    title: "Review & Rate",
    description: "After the service is completed, leave a review to help others find great providers.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">How Awthar Works</h1>
      <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        Finding and booking trusted service providers in the UAE has never been easier.
      </p>

      <div className="space-y-12">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <step.icon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-primary mb-1">Step {index + 1}</div>
              <h2 className="text-2xl font-semibold mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
