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

export class SupabaseStorage {
  /**
   * Compresses and uploads a file to Supabase Storage (S3).
   * Returns a proxy URL to serve the file via the backend.
   */
  static async uploadFile(file: Express.Multer.File): Promise<string> {
    // 1. Optimize Image with Sharp
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1920, 1920, { // Max dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality: 80, 
        effort: 4 
      })
      .toBuffer();

    // 2. Generate Unique Filename
    const filename = `${uuidv4()}.webp`;
    
    // 3. Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: optimizedBuffer,
      ContentType: "image/webp",
      // We still set public-read for good measure, but we will proxy it now
      ACL: 'public-read', 
    });

    await s3Client.send(command);

    // 4. Return Proxy URL
    // Instead of returning the direct Supabase URL (which fails if bucket is private),
    // we return a URL that routes through our backend.
    return `/api/upload/file/${filename}`;
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
}
