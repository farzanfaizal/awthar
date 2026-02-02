import {
  Wrench,
  Sparkles,
  Briefcase,
  Truck,
  User,
  TrendingUp,
  Laptop,
  GraduationCap,
  Home,
  Car,
  Users,
  Paintbrush,
  Camera,
  Heart,
  ShoppingBag,
  Utensils,
  Plane,
  Music,
  Scissors,
  Hammer,
  Zap,
  Droplets,
  Wind,
  Shield,
  Baby,
  Dog,
  Flower2,
  Dumbbell,
  Stethoscope,
  Scale,
  Building2,
  Package,
  type LucideIcon,
} from "lucide-react";

/**
 * Map of icon names (stored in DB) to Lucide icon components
 * Used to render category icons dynamically
 */
export const categoryIconMap: Record<string, LucideIcon> = {
  // Home & Maintenance
  Wrench: Wrench,
  Hammer: Hammer,
  Zap: Zap,
  Droplets: Droplets,
  Wind: Wind,
  Paintbrush: Paintbrush,

  // Cleaning
  Sparkles: Sparkles,
  Home: Home,

  // Professional & Business
  Briefcase: Briefcase,
  TrendingUp: TrendingUp,
  Scale: Scale,
  Building2: Building2,

  // Moving & Transport
  Truck: Truck,
  Car: Car,
  Package: Package,
  Plane: Plane,

  // Personal Services
  Users: Users,
  User: User,
  Scissors: Scissors,
  Heart: Heart,
  Dumbbell: Dumbbell,
  Stethoscope: Stethoscope,

  // IT & Technology
  Laptop: Laptop,
  Camera: Camera,

  // Education
  GraduationCap: GraduationCap,

  // Lifestyle
  ShoppingBag: ShoppingBag,
  Utensils: Utensils,
  Music: Music,

  // Care
  Baby: Baby,
  Dog: Dog,
  Flower2: Flower2,

  // Security
  Shield: Shield,
};

/**
 * Get Lucide icon component by name
 * Falls back to Briefcase if icon name not found
 */
export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return Briefcase;
  return categoryIconMap[iconName] || Briefcase;
}

/**
 * Category color schemes for visual variety
 * Maps category slugs to tailwind color classes
 */
export const categoryColorMap: Record<string, { bg: string; text: string; border: string }> = {
  "home-repair": { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  "cleaning": { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
  "professional": { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  "moving": { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  "personal": { bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-500/20" },
  "consulting": { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  "technology": { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20" },
  "education": { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  "events": { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
};

/**
 * Get color scheme for a category
 * Falls back to primary color if not found
 */
export function getCategoryColors(slug: string | null | undefined) {
  if (!slug) return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" };
  return categoryColorMap[slug] || { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" };
}
