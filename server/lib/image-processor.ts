import sharp from "sharp";
import path from "path";
import fs from "fs";

export interface ImageVariant {
  size: "thumbnail" | "medium" | "full";
  width: number;
  quality: number;
}

const IMAGE_VARIANTS: ImageVariant[] = [
  { size: "thumbnail", width: 200, quality: 80 },
  { size: "medium", width: 800, quality: 85 },
  { size: "full", width: 1920, quality: 90 },
];

/**
 * Process and optimize an uploaded image
 * Generates multiple size variants for responsive loading
 */
export async function processImage(
  inputPath: string,
  outputDir: string,
  filename: string
): Promise<{ [key: string]: string }> {
  const results: { [key: string]: string } = {};
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process each variant
  for (const variant of IMAGE_VARIANTS) {
    const outputFilename = `${baseName}-${variant.size}${ext}`;
    const outputPath = path.join(outputDir, outputFilename);

    await sharp(inputPath)
      .resize(variant.width, null, {
        withoutEnlargement: true, // Don't upscale images
        fit: "inside",
      })
      .jpeg({ quality: variant.quality, mozjpeg: true })
      .png({ quality: variant.quality, compressionLevel: 9 })
      .webp({ quality: variant.quality })
      .toFile(outputPath);

    results[variant.size] = outputFilename;
  }

  return results;
}

/**
 * Process image from buffer (for direct upload processing)
 */
export async function processImageFromBuffer(
  buffer: Buffer,
  outputDir: string,
  filename: string
): Promise<{ [key: string]: string }> {
  const results: { [key: string]: string } = {};
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process each variant
  for (const variant of IMAGE_VARIANTS) {
    const outputFilename = `${baseName}-${variant.size}${ext}`;
    const outputPath = path.join(outputDir, outputFilename);

    const sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();

    // Only resize if image is larger than target width
    if (metadata.width && metadata.width > variant.width) {
      await sharpInstance
        .resize(variant.width, null, {
          withoutEnlargement: true,
          fit: "inside",
        })
        .jpeg({ quality: variant.quality, mozjpeg: true })
        .png({ quality: variant.quality, compressionLevel: 9 })
        .webp({ quality: variant.quality })
        .toFile(outputPath);
    } else {
      // If image is smaller, just optimize it
      await sharpInstance
        .jpeg({ quality: variant.quality, mozjpeg: true })
        .png({ quality: variant.quality, compressionLevel: 9 })
        .webp({ quality: variant.quality })
        .toFile(outputPath);
    }

    results[variant.size] = outputFilename;
  }

  return results;
}

/**
 * Get appropriate image URL based on requested size
 */
export function getImageVariantUrl(
  baseUrl: string,
  filename: string,
  size: "thumbnail" | "medium" | "full" = "medium"
): string {
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  return `${baseUrl}/${baseName}-${size}${ext}`;
}

/**
 * Delete all variants of an image
 */
export async function deleteImageVariants(
  directory: string,
  filename: string
): Promise<void> {
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);

  for (const variant of IMAGE_VARIANTS) {
    const variantPath = path.join(directory, `${baseName}-${variant.size}${ext}`);
    if (fs.existsSync(variantPath)) {
      fs.unlinkSync(variantPath);
    }
  }

  // Also delete the original if it exists
  const originalPath = path.join(directory, filename);
  if (fs.existsSync(originalPath)) {
    fs.unlinkSync(originalPath);
  }
}
