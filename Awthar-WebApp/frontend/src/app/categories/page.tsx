import Link from "next/link";
import { getCategoryIcon, getCategoryColors } from "@/lib/category-icons";
import type { Category } from "@/types";

async function getCategories(): Promise<Category[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const res = await fetch(`${backendUrl}/api/categories`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  const featured = categories.slice(0, 8);
  const all = categories;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Categories</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">Service Categories</h1>

      {/* Featured Categories */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((cat) => {
              const Icon = getCategoryIcon(cat.iconName);
              const colors = getCategoryColors(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/browse?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-xl border-2 p-6 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-lg hover:border-primary/30 bg-card"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colors.bg}`}>
                    <Icon className={`h-7 w-7 ${colors.text}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-center">{cat.nameEn}</h3>
                  {cat.descriptionEn && (
                    <p className="text-xs text-muted-foreground text-center line-clamp-2">{cat.descriptionEn}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Categories */}
      <section>
        <h2 className="text-xl font-semibold mb-6">All Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {all.map((cat) => {
            const Icon = getCategoryIcon(cat.iconName);
            const colors = getCategoryColors(cat.slug);
            return (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.slug}`}
                className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md hover:border-primary/30 bg-card group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <span className="font-medium text-sm">{cat.nameEn}</span>
              </Link>
            );
          })}
        </div>

        {all.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No categories available yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
