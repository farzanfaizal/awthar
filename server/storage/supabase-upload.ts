import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Initialize S3 Client for Supabase
const s3Client = new S3Client({
  forcePathStyle: true, // Required for Supabase
  region: process.env.SUPABASE_REGION || "ap-northeast-1",
  endpoint: process.env.SUPABASE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPABASE_ACCESS_KEY || "",
    secretAccessKey: process.env.SUPABASE_SECRET_KEY || "",
  },
});

const BUCKET_NAME = process.env.SUPABASE_BUCKET || "awthar";

interface ImageVariant {
  size: "thumbnail" | "medium" | "full";
  width: number;
  quality: number;
}

const IMAGE_VARIANTS: ImageVariant[] = [
  { size: "thumbnail", width: 200, quality: 80 },
  { size: "medium", width: 800, quality: 85 },
  { size: "full", width: 1920, quality: 90 },
];

export class SupabaseStorage {
  /**
   * Compresses and uploads a file to Supabase Storage (S3) with multiple size variants.
   * Returns a proxy URL to serve the medium-sized file via the backend.
   */
  static async uploadFile(file: Express.Multer.File): Promise<string> {
    const baseFilename = uuidv4();

    // Get image metadata to check original dimensions
    const metadata = await sharp(file.buffer).metadata();

    // Upload all variants in parallel
    const uploadPromises = IMAGE_VARIANTS.map(async (variant) => {
      let processedBuffer: Buffer;

      // Only resize if image is larger than target width
      if (metadata.width && metadata.width > variant.width) {
        processedBuffer = await sharp(file.buffer)
          .resize(variant.width, null, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({
            quality: variant.quality,
            effort: 4
          })
          .toBuffer();
      } else {
        // If image is smaller, just optimize it
        processedBuffer = await sharp(file.buffer)
          .webp({
            quality: variant.quality,
            effort: 4
          })
          .toBuffer();
      }

      const filename = `${baseFilename}-${variant.size}.webp`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: processedBuffer,
        ContentType: "image/webp",
        ACL: 'public-read',
      });

      await s3Client.send(command);
    });

    // Wait for all variants to upload
    await Promise.all(uploadPromises);

    // Return proxy URL for the medium variant (default for display)
    return `/api/upload/file/${baseFilename}-medium.webp`;
  }

  /**
   * Retrieves a file stream from S3.
   * Used by the proxy endpoint to serve images.
   */
  static async downloadFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    try {
      const response = await s3Client.send(command);
      return response;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get different size variants of an image URL
   * Converts a medium URL to thumbnail, medium, or full variant
   */
  static getImageVariant(
    url: string,
    size: "thumbnail" | "medium" | "full"
  ): string {
    // URL format: /api/upload/file/{uuid}-medium.webp
    // Replace -medium with desired size
    return url.replace(/-medium\.webp$/, `-${size}.webp`);
  }
}
