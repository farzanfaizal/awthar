import { Router, Request, Response } from "express";
import { isAuthenticated } from "../auth";
import multer from "multer";
import { SupabaseStorage } from "../storage/supabase-upload";
import { uploadLimiter } from "../middleware/rate-limit";
import { logger } from "../lib/logger";
import { asyncHandler, BadRequestError } from "../lib/errors";

const router = Router();

// Use memory storage so we can process the file with Sharp before uploading
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit before compression
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

// Upload single image
router.post("/image", isAuthenticated, uploadLimiter, upload.single('image'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError("No file uploaded");
  }

  const url = await SupabaseStorage.uploadFile(req.file);
  res.json({ url });
}));

// Upload multiple images
router.post("/images", isAuthenticated, uploadLimiter, upload.array('images', 10), asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new BadRequestError("No files uploaded");
  }

  // Process all uploads in parallel
  const uploadPromises = files.map(file => SupabaseStorage.uploadFile(file));
  const urls = await Promise.all(uploadPromises);

  res.json({ urls });
}));

// Proxy endpoint for serving images securely
router.get("/file/:key", asyncHandler(async (req: Request, res: Response) => {
  const key = req.params.key;
  const fileResponse = await SupabaseStorage.downloadFile(key);

  if (!fileResponse || !fileResponse.Body) {
    throw new BadRequestError("File not found");
  }

  // Set headers
  res.setHeader("Content-Type", fileResponse.ContentType || "image/webp");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  // Handle stream safely
  const body = fileResponse.Body;

  if (typeof body === 'object' && body !== null && 'pipe' in body && typeof body.pipe === 'function') {
    body.pipe(res);
  } else if (typeof body === 'object' && body !== null && 'transformToByteArray' in body && typeof body.transformToByteArray === 'function') {
    // Handle modern AWS SDK bodies (blobs/byte arrays)
    const bytes = await body.transformToByteArray();
    res.send(Buffer.from(bytes));
  } else {
    logger.error("Unknown body type from S3", new Error("Unknown body type"), { bodyType: typeof body });
    throw new BadRequestError("Failed to stream file");
  }
}));

export const uploadController = router;
