import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, NotFoundError, ForbiddenError } from "@/lib/errors";
import { ServiceService } from "@/services/service.service";
import { updateServiceSchema } from "@/shared/validators";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/services/[id] - Get service by ID (public)
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const service = await ServiceService.getServiceById(id);

    if (!service) {
      throw new NotFoundError("Service not found");
    }

    await ServiceService.incrementViewCount(id);
    return NextResponse.json(service);
  } catch (error) {
    return handleApiError(error, { path: "/api/services/[id]", method: "GET" });
  }
}

/**
 * PATCH /api/services/[id] - Update service (owner only)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateServiceSchema.parse(body);

    const service = await ServiceService.getServiceById(id);
    if (!service) {
      throw new NotFoundError("Service not found");
    }

    if (service.provider.userId !== user.id) {
      throw new ForbiddenError("You don't have permission to update this service");
    }

    const updated = await ServiceService.updateService(id, validatedData);
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { path: "/api/services/[id]", method: "PATCH" });
  }
}

/**
 * DELETE /api/services/[id] - Soft-delete service (owner only)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const service = await ServiceService.getServiceById(id);
    if (!service) {
      throw new NotFoundError("Service not found");
    }

    if (service.provider.userId !== user.id) {
      throw new ForbiddenError("You don't have permission to delete this service");
    }

    await ServiceService.deleteService(id);
    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    return handleApiError(error, { path: "/api/services/[id]", method: "DELETE" });
  }
}
