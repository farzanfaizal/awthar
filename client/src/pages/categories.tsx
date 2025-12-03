import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Categories</h1>
            <p className="text-xl text-muted-foreground">
              Find services across all categories
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories?.map((category: any) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-4">{category.icon || "📦"}</div>
                      <h3 className="text-xl font-semibold mb-2">{category.nameEn}</h3>
                      {category.descriptionEn && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.descriptionEn}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
