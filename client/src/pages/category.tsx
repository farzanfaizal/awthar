import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Star } from "lucide-react";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug;

  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services", slug],
    queryFn: async () => {
      const res = await fetch(`/api/services?category=${slug}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const category = categories?.find((c: any) => c.slug === slug);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <Link href="/categories">
              <Button variant="ghost" className="mb-4">← Back to Categories</Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {category?.nameEn || slug}
            </h1>
            {category?.descriptionEn && (
              <p className="text-xl text-muted-foreground">
                {category.descriptionEn}
              </p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any) => (
                <Link key={service.id} href={`/service/${service.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-0">
                      {service.images?.[0] && (
                        <img
                          src={service.images[0]}
                          alt={service.titleEn}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {service.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {service.descriptionEn}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {service.provider?.avgRating || "New"}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {service.priceMin} {service.currency}
                            {service.pricingType === "hourly" && "/hr"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No services found in this category yet.</p>
              <Link href="/browse">
                <Button className="mt-4">Browse All Services</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
