import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, MessageCircle, CheckCircle, Star } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      id: "browse",
      icon: <Search className="h-12 w-12 text-primary" />,
      title: "1. Browse Services",
      description: "Search through thousands of services across various categories. Filter by location, price, and ratings to find exactly what you need.",
    },
    {
      id: "contact",
      icon: <MessageCircle className="h-12 w-12 text-primary" />,
      title: "2. Contact Providers",
      description: "Message service providers directly to discuss your requirements, ask questions, and get custom quotes.",
    },
    {
      id: "book",
      icon: <CheckCircle className="h-12 w-12 text-primary" />,
      title: "3. Book & Confirm",
      description: "Once you've found the right provider, book the service, agree on pricing, and schedule a time that works for you.",
    },
    {
      id: "review",
      icon: <Star className="h-12 w-12 text-primary" />,
      title: "4. Review & Rate",
      description: "After the service is completed, leave a review to help other customers and build trust in the community.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How Awthar Works</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with trusted service providers in just a few simple steps
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <Card key={step.id} className="text-center">
                <CardContent className="pt-8">
                  <div className="flex justify-center mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* For Providers Section */}
        <div className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Want to Offer Services?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of service providers on Awthar. Create your profile, list your services, and start reaching customers today.
              </p>
              <Link href="/become-provider">
                <Button size="lg">Become a Provider</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Browse services and find the perfect provider for your needs
          </p>
          <Link href="/browse">
            <Button size="lg">Browse Services</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
