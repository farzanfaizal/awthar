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

export const categoryIconMap: Record<string, LucideIcon> = {
  Wrench,
  Hammer,
  Zap,
  Droplets,
  Wind,
  Paintbrush,
  Sparkles,
  Home,
  Briefcase,
  TrendingUp,
  Scale,
  Building2,
  Truck,
  Car,
  Package,
  Plane,
  Users,
  User,
  Scissors,
  Heart,
  Dumbbell,
  Stethoscope,
  Laptop,
  Camera,
  GraduationCap,
  ShoppingBag,
  Utensils,
  Music,
  Baby,
  Dog,
  Flower2,
  Shield,
};

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return Briefcase;
  return categoryIconMap[iconName] || Briefcase;
}

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

export function getCategoryColors(slug: string | null | undefined) {
  if (!slug) return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" };
  return categoryColorMap[slug] || { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" };
}
