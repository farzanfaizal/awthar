import { NextResponse } from "next/server";
import { ServiceService } from "@/services/service.service";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const categories = await ServiceService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error, { path: "/api/categories", method: "GET" });
  }
}
