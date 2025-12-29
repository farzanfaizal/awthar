import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CategorySkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@shared/schema";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Service Categories</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))
          ) : (
            categories?.map((category: Category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{category.iconName || "📦"}</div>
                    <h3 className="text-xl font-semibold mb-2">{category.nameEn}</h3>
                    {category.descriptionEn && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.descriptionEn}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}