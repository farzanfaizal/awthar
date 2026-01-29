import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ServiceCard } from "@/components/service-card";
import { ServiceCardSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { Category } from "@shared/schema";

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
      const data = await res.json();
      // API returns { services, pagination } - extract services array
      return data.services ?? data;
    },
    enabled: !!slug,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const category = categories?.find((c: Category) => c.slug === slug);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <Link href="/categories">
              <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Categories
              </Button>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {category?.nameEn || slug}
            </h1>
            {category?.descriptionEn && (
              <p className="text-xl text-muted-foreground max-w-2xl">
                {category.descriptionEn}
              </p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No services yet"
              description={`We couldn't find any services in the ${category?.nameEn || slug} category right now.`}
              action={
                <Link href="/browse">
                  <Button size="lg" className="rounded-xl px-8">Browse All Services</Button>
                </Link>
              }
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
