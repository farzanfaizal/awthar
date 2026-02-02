import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Search, ArrowRight, Grid3X3 } from "lucide-react";
import { Category } from "@shared/schema";
import { getCategoryIcon, getCategoryColors } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

// Extended category type with service count
interface CategoryWithCount extends Category {
  serviceCount: number;
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });

  // Separate featured (top 4) and all categories
  const featuredCategories = categories?.slice(0, 4) || [];
  const allCategories = categories || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Categories</span>
            </div>

            {/* Title Row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Grid3X3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Service Categories</h1>
                <p className="text-sm text-muted-foreground">
                  Browse {categories?.length || 0} categories with{" "}
                  {categories?.reduce((sum, c) => sum + (c.serviceCount || 0), 0) || 0} services
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          {/* Quick Pills - Horizontal Scroll */}
          {!isLoading && categories && categories.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.iconName);
                  const colors = getCategoryColors(category.slug);
                  return (
                    <Link key={category.id} href={`/browse?category=${category.slug}`}>
                      <button
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                          "bg-background hover:bg-muted border-border hover:border-primary/30"
                        )}
                      >
                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center", colors.bg)}>
                          <Icon className={cn("h-3.5 w-3.5", colors.text)} />
                        </span>
                        {category.nameEn}
                        {category.serviceCount > 0 && (
                          <Badge variant="secondary" className="rounded-full text-xs ml-1">
                            {category.serviceCount}
                          </Badge>
                        )}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Categories - Larger Cards */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Popular Categories</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border overflow-hidden">
                      <CardContent className="p-5">
                        <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))
                : featuredCategories.map((category) => {
                    const Icon = getCategoryIcon(category.iconName);
                    const colors = getCategoryColors(category.slug);
                    return (
                      <Link key={category.id} href={`/browse?category=${category.slug}`}>
                        <Card
                          className={cn(
                            "border overflow-hidden cursor-pointer transition-all h-full",
                            "hover:shadow-lg hover:border-primary/30 group"
                          )}
                        >
                          <CardContent className="p-5">
                            {/* Icon */}
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                                colors.bg
                              )}
                            >
                              <Icon className={cn("h-6 w-6", colors.text)} />
                            </div>

                            {/* Content */}
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                              {category.nameEn}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {category.descriptionEn}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {category.serviceCount} {category.serviceCount === 1 ? "service" : "services"}
                              </span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
            </div>
          </section>

          {/* All Categories - Compact Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Categories</h2>
              <Link href="/browse" className="text-sm text-primary hover:underline flex items-center gap-1">
                Browse all services
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                : allCategories.map((category) => {
                    const Icon = getCategoryIcon(category.iconName);
                    const colors = getCategoryColors(category.slug);
                    return (
                      <Link key={category.id} href={`/browse?category=${category.slug}`}>
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all group",
                            "hover:bg-muted/50 hover:border-primary/30"
                          )}
                        >
                          {/* Icon */}
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                              colors.bg
                            )}
                          >
                            <Icon className={cn("h-5 w-5", colors.text)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {category.nameEn}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {category.serviceCount} {category.serviceCount === 1 ? "service" : "services"}
                            </p>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </section>

          {/* Empty State */}
          {!isLoading && (!categories || categories.length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No categories found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Categories will appear here once they are added.
              </p>
              <Link href="/browse">
                <button className="text-sm text-primary hover:underline">
                  Browse all services instead
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
