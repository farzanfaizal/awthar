import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

if (!process.env.SUPABASE_ENDPOINT) {
  console.warn("[SupabaseStorage] SUPABASE_ENDPOINT not set — uploads will fail");
}

const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.SUPABASE_REGION || "ap-northeast-1",
  endpoint: process.env.SUPABASE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPABASE_ACCESS_KEY || "",
    secretAccessKey: process.env.SUPABASE_SECRET_KEY || "",
  },
});

const BUCKET_NAME = process.env.SUPABASE_BUCKET || "awthar";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit (no Sharp processing)

export class SupabaseStorage {
  /**
   * Upload a file directly to Supabase Storage (no image processing).
   * Returns a public Supabase URL.
   */
  static async uploadFile(buffer: Buffer, contentType: string, originalName?: string): Promise<string> {
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const ext = contentType.includes("webp")
      ? "webp"
      : contentType.includes("png")
        ? "png"
        : contentType.includes("gif")
          ? "gif"
          : "jpg";

    const filename = `${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    });

    await s3Client.send(command);

    // Return direct Supabase public URL (uses SUPABASE_URL, not S3 endpoint)
    const supabaseUrl = process.env.SUPABASE_URL || "";
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  }

  /**
   * Download a file from storage (for proxy endpoint).
   */
  static async downloadFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      return await s3Client.send(command);
    } catch {
      return null;
    }
  }
}
