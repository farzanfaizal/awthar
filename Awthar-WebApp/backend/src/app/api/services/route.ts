import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, getOptionalUser } from "@/lib/auth";
import { handleApiError, BadRequestError } from "@/lib/errors";
import { ServiceService } from "@/services/service.service";
import { ProviderService } from "@/services/provider.service";
import { searchServicesSchema, createServiceSchema } from "@/shared/validators";

/**
 * GET /api/services - Search/list services (public, optional auth for provider filter)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validatedQuery = searchServicesSchema.parse(searchParams);

    let providerId: string | undefined;

    if (validatedQuery.role === "provider") {
      const user = await getOptionalUser(request);
      if (user) {
        const provider = await ProviderService.getProviderByUserId(user.id);
        if (provider) providerId = provider.id;
      }
    }

    const limit = validatedQuery.limit ?? 20;
    const offset = validatedQuery.offset ?? 0;

    const services = await ServiceService.searchServices({
      category: validatedQuery.category,
      search: validatedQuery.search,
      minPrice: validatedQuery.minPrice,
      maxPrice: validatedQuery.maxPrice,
      providerId,
      limit: limit + 1,
      offset,
      sortBy: validatedQuery.sortBy,
      latitude: validatedQuery.latitude,
      longitude: validatedQuery.longitude,
      radius: validatedQuery.radius,
      paymentMethods: validatedQuery.paymentMethod
        ? Array.isArray(validatedQuery.paymentMethod)
          ? validatedQuery.paymentMethod
          : [validatedQuery.paymentMethod]
        : undefined,
    });

    const hasMore = services.length > limit;
    const results = hasMore ? services.slice(0, limit) : services;

    return NextResponse.json({
      services: results,
      pagination: { offset, limit, hasMore, total: results.length },
    });
  } catch (error) {
    return handleApiError(error, { path: "/api/services", method: "GET" });
  }
}

/**
 * POST /api/services - Create a new service (provider only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createServiceSchema.parse(body);

    const provider = await ProviderService.getProviderByUserId(user.id);
    if (!provider) {
      throw new BadRequestError("Provider profile required to create services");
    }

    const newService = await ServiceService.createService(provider.id, validatedData);
    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    return handleApiError(error, { path: "/api/services", method: "POST" });
  }
}
