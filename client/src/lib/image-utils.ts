/**
 * Utility functions for handling image URLs in the application.
 * Handles normalization of legacy relative paths vs new absolute S3 URLs.
 */

export const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=No+Image";

/**
 * Normalizes an image URL.
 * - If the URL is absolute (starts with http/https), returns it as is.
 * - If the URL is a legacy local upload (starts with /uploads/), returns a placeholder
 *   (since local files are lost on ephemeral cloud hosting).
 * - If null/undefined, returns placeholder.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return PLACEHOLDER_IMAGE;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Legacy local uploads (broken on production)
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    // Option: Return placeholder, or try to resolve if you migrated files.
    // Since we didn't migrate local files to S3, these are effectively lost.
    return PLACEHOLDER_IMAGE;
  }

  // Fallback for other relative paths - assume they might be assets
  return url;
}
