import { Router } from "express";
import { isAuthenticated } from "../auth";
import { uploadMiddleware } from "../storage/local-upload";

const router = Router();

router.post("/image", isAuthenticated, uploadMiddleware.single('image'), (req, res) => {
  try {
    if (!(req as any).file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return URL relative to client/public
    const url = `/uploads/${(req as any).file.filename}`;
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/images", isAuthenticated, uploadMiddleware.array('images', 10), (req, res) => {
  try {
    if (!(req as any).files || !Array.isArray((req as any).files)) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = (req as any).files.map((file: any) => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const uploadController = router;
