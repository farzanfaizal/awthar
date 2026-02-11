import { NextRequest, NextResponse } from "next/server";
import { ServiceService } from "@/services/service.service";
import { handleApiError, NotFoundError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await ServiceService.getCategoryBySlug(slug);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error, { path: "/api/categories/[slug]", method: "GET" });
  }
}
