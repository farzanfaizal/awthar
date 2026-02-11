import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ServiceDetailClient } from "./service-detail-client";
import type { ServiceWithProvider, ReviewWithCustomer } from "@/types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function getService(id: string): Promise<ServiceWithProvider | null> {
  try {
    const res = await fetch(`${backendUrl}/api/services/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getReviews(providerId: string): Promise<ReviewWithCustomer[]> {
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
  const service = await getService(id);
  if (!service) return { title: "Service Not Found" };
  return {
    title: `${service.titleEn} | Awthar`,
    description: service.descriptionEn?.slice(0, 160),
  };
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  const reviews = await getReviews(service.providerId);

  return <ServiceDetailClient service={service} reviews={reviews} />;
}
