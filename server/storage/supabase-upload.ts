import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
   * Target size: ~200KB
   */
  static async uploadFile(file: Express.Multer.File): Promise<string> {
    // 1. Optimize Image with Sharp
    // We convert to WebP for better compression and resize if too massive
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1920, 1920, { // Max dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality: 80, // Good balance
        effort: 4 // Compression effort (0-6)
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
      ACL: 'public-read', // Ensure file is publicly readable
    });

    await s3Client.send(command);

    // 4. Construct Public URL
    // Supabase Storage Public URL format:
    // https://[project_ref].supabase.co/storage/v1/object/public/[bucket]/[key]
    // Since we have the full endpoint in env, we can parse it or construct carefully.
    
    // If endpoint is: https://[ref].supabase.co/storage/v1/s3
    // We need: https://[ref].supabase.co/storage/v1/object/public/[bucket]/[filename]
    
    const endpointUrl = new URL(process.env.SUPABASE_ENDPOINT || "");
    const projectRef = endpointUrl.hostname.split('.')[0]; // Extract 'xkrsqpwzptneeebyxgls'
    
    // This is the standard public URL format for Supabase
    return `https://${projectRef}.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  }
}
