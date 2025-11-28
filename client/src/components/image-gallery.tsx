import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images?: string[] | null;
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback if no images
  if (!images || images.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-lg bg-muted">
        <AspectRatio ratio={16 / 9} className="flex items-center justify-center">
          <div className="text-muted-foreground flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="mt-2">No images available</span>
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border bg-background">
        <AspectRatio ratio={16 / 9}>
          <img
            src={images[selectedIndex]}
            alt={`Service image ${selectedIndex + 1}`}
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        </AspectRatio>
      </div>

      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex-none overflow-hidden rounded-md border bg-background transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 w-24 h-24",
                selectedIndex === index && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
