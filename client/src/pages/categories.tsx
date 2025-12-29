import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } => "@/components/footer";
import { CategorySkeleton } from "@/components/skeletons";

export default function CategoriesPage() {
// ... inside the component
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))
          ) : (
            categories?.map((category: any) => (
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
