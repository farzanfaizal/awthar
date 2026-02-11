import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { handleApiError, BadRequestError } from "@/lib/errors";
import { SupabaseStorage } from "@/lib/supabase-storage";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILES = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * POST /api/upload/images - Upload multiple images
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
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      throw new BadRequestError("No files uploaded");
    }

    if (files.length > MAX_FILES) {
      throw new BadRequestError(`Maximum ${MAX_FILES} files allowed per upload`);
    }

    // Validate all files first
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new BadRequestError(`Invalid file type: ${file.type}. Only images are allowed`);
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestError(`File "${file.name}" is too large. Maximum size is 2MB`);
      }
    }

    const uploadResults = await Promise.allSettled(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return SupabaseStorage.uploadFile(buffer, file.type, file.name);
      })
    );

    const urls = uploadResults
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);

    if (urls.length === 0) {
      throw new BadRequestError("All file uploads failed");
    }

    return NextResponse.json({ urls });
  } catch (error) {
    return handleApiError(error, { path: "/api/upload/images", method: "POST" });
  }
}
