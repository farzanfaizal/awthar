import { redirect } from "next/navigation";

// Category slug pages redirect to browse with category filter
// This matches the old app's behavior where /category/[slug] showed filtered services
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/browse?category=${slug}`);
}
