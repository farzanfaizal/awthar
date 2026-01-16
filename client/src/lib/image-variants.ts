/**
 * Get different size variants of an image URL
 * Converts a medium URL to thumbnail, medium, or full variant
 */
export function getImageVariant(
  url: string | null | undefined,
  size: "thumbnail" | "medium" | "full" = "medium"
): string {
  if (!url) return "";

  // URL format: /api/upload/file/{uuid}-medium.webp
  // Replace -medium with desired size
  return url.replace(/-medium\.webp$/, `-${size}.webp`);
}

/**
 * Get srcset for responsive images
 * Returns a srcset string with all three variants
 */
export function getImageSrcSet(url: string | null | undefined): string {
  if (!url) return "";

  const thumbnail = getImageVariant(url, "thumbnail");
  const medium = getImageVariant(url, "medium");
  const full = getImageVariant(url, "full");

  return `${thumbnail} 200w, ${medium} 800w, ${full} 1920w`;
}

/**
 * Get sizes attribute for responsive images
 * Returns optimal sizes based on common breakpoints
 */
export function getImageSizes(type: "thumbnail" | "card" | "gallery" | "full"): string {
  switch (type) {
    case "thumbnail":
      return "(max-width: 640px) 100px, 200px";
    case "card":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
    case "gallery":
      return "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1920px";
    case "full":
      return "100vw";
    default:
      return "(max-width: 640px) 100vw, 800px";
  }
}
