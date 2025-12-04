import { Router } from "express";
import { isAuthenticated } from "../auth";
import multer from "multer";
import { SupabaseStorage } from "../storage/supabase-upload";

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

router.post("/image", isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const url = await SupabaseStorage.uploadFile(req.file);
    res.json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message || "Failed to upload image" });
  }
});

router.post("/images", isAuthenticated, upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Process all uploads in parallel
    const uploadPromises = files.map(file => SupabaseStorage.uploadFile(file));
    const urls = await Promise.all(uploadPromises);
    
    res.json({ urls });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message || "Failed to upload images" });
  }
});

export const uploadController = router;
