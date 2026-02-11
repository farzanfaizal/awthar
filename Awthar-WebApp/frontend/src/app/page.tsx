import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, Star, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Find Trusted Service
            <br />
            <span className="text-primary">Providers in the UAE</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with verified professionals for all your needs. From home maintenance to
            professional services — Awthar makes it easy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/browse">
                <Search className="h-5 w-5 mr-2" />
                Browse Services
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/become-provider">
                <Briefcase className="h-5 w-5 mr-2" />
                List Your Service
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Awthar?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Providers",
                description:
                  "All service providers are verified and reviewed by our community for quality assurance.",
              },
              {
                icon: Star,
                title: "Trusted Reviews",
                description:
                  "Real reviews from real customers help you make informed decisions.",
              },
              {
                icon: Search,
                title: "Easy Booking",
                description:
                  "Browse, compare, and book services in minutes. No hassle, no hidden fees.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-card border"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of customers and providers on the UAE&apos;s fastest-growing service
            marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
