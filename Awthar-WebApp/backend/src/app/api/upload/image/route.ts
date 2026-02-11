import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, BadRequestError } from "@/lib/errors";
import { SupabaseStorage } from "@/lib/supabase-storage";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * POST /api/upload/image - Upload a single image
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = checkRateLimit(request, RATE_LIMITS.upload);
    if (rateLimited) return rateLimited;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      throw new BadRequestError("No file uploaded");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new BadRequestError("Only images are allowed (JPEG, PNG, WebP, GIF)");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError("File too large. Maximum size is 2MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await SupabaseStorage.uploadFile(buffer, file.type, file.name);

    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error, { path: "/api/upload/image", method: "POST" });
  }
}
