import { NextRequest, NextResponse } from "next/server";
import { handleApiError, NotFoundError } from "@/lib/errors";
import { SupabaseStorage } from "@/lib/supabase-storage";

type Params = { params: Promise<{ key: string }> };

/**
 * GET /api/upload/file/[key] - Proxy endpoint for serving files
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { key } = await params;
    const fileResponse = await SupabaseStorage.downloadFile(key);

    if (!fileResponse || !fileResponse.Body) {
      throw new NotFoundError("File not found");
    }

    const contentType = fileResponse.ContentType || "image/webp";

    // Handle modern AWS SDK bodies
    const body = fileResponse.Body;
    let bytes: Uint8Array;

    if ("transformToByteArray" in body && typeof body.transformToByteArray === "function") {
      bytes = await body.transformToByteArray();
    } else {
      throw new NotFoundError("Failed to read file");
    }

    return new NextResponse(Buffer.from(bytes) as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return handleApiError(error, { path: "/api/upload/file/[key]", method: "GET" });
  }
}
