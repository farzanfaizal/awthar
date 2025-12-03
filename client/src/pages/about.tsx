import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Target, Users, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Target className="h-10 w-10 text-primary" />,
      title: "Our Mission",
      description: "To connect people with trusted service providers, making it easy to find and book quality services in the UAE.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Community First",
      description: "We build meaningful connections between service providers and customers, fostering trust and reliability.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Trust & Safety",
      description: "Every provider is verified, and our review system ensures transparency and quality across the platform.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Innovation",
      description: "We continuously improve our platform with cutting-edge technology to provide the best experience.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Awthar</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your trusted marketplace for finding and offering services across the UAE
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Awthar was founded with a simple vision: to make it easier for people to find trusted service providers and for professionals to grow their businesses. We saw a gap in the market for a platform that truly connects communities and prioritizes trust and quality.
              </p>
              <p className="mb-4">
                Today, we're proud to serve thousands of customers and service providers across the UAE. From home repairs to professional services, Awthar has become the go-to platform for getting things done.
              </p>
              <p>
                We're more than just a marketplace—we're building a community where quality service and trust come first.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardContent className="pt-8 text-center">
                    <div className="flex justify-center mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're looking for services or want to offer your expertise, Awthar is here for you.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/browse">
                <Button size="lg" variant="outline">Browse Services</Button>
              </Link>
              <Link href="/become-provider">
                <Button size="lg">Become a Provider</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
