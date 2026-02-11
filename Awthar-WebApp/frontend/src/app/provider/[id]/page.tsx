import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProviderProfileClient } from "./provider-profile-client";
import type { ProviderProfile, User, ServiceWithProvider, ReviewWithCustomer } from "@/types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

type ProviderWithUser = ProviderProfile & { user: User };

async function getProvider(id: string): Promise<ProviderWithUser | null> {
  try {
    const res = await fetch(`${backendUrl}/api/auth/providers/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getProviderServices(providerId: string): Promise<ServiceWithProvider[]> {
  try {
    const res = await fetch(`${backendUrl}/api/services?providerId=${providerId}&limit=8`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.services || data || [];
  } catch {
    return [];
  }
}

async function getProviderReviews(providerId: string): Promise<ReviewWithCustomer[]> {
  try {
    const res = await fetch(`${backendUrl}/api/reviews/provider/${providerId}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) return { title: "Provider Not Found" };
  const name = provider.companyName || `${provider.user.firstName} ${provider.user.lastName}`;
  return {
    title: `${name} | Awthar`,
    description: provider.bio?.slice(0, 160) || `View ${name}'s profile on Awthar`,
  };
}

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) notFound();

  const [services, reviews] = await Promise.all([
    getProviderServices(id),
    getProviderReviews(id),
  ]);

  return <ProviderProfileClient provider={provider} services={services} reviews={reviews} />;
}
