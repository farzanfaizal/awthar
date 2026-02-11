"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiUpload } from "@/lib/api";

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ value = [], onChange, maxFiles = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (files: FileList) => {
    if (!files.length) return;
    if (value.length + files.length > maxFiles) {
      toast({ title: "Limit Exceeded", description: `You can only upload up to ${maxFiles} images.`, variant: "destructive" });
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB — matches backend limit
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        toast({ title: "File Too Large", description: `"${file.name}" exceeds 2MB limit.`, variant: "destructive" });
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Invalid Type", description: `"${file.name}" is not a supported image format.`, variant: "destructive" });
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));

      const response = await apiUpload("/api/upload/images", formData);
      if (!response.ok) throw new Error("Upload failed");

      const { urls } = await response.json();
      onChange([...value, ...urls]);
      toast({ title: "Success", description: "Images uploaded successfully" });
    } catch {
      toast({ title: "Upload Failed", description: "Could not upload images. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {value.map((url, index) => (
          <div key={url} className="relative aspect-square group">
            <Image src={url} alt="Uploaded" fill className="object-cover rounded-lg border" sizes="150px" />
            <Button size="icon" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6" onClick={() => removeImage(index)} type="button">
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {value.length < maxFiles && (
        <label className="cursor-pointer block">
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} disabled={uploading} />
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary hover:bg-muted/50 transition-colors">
            {uploading ? <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" /> : <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />}
            <p className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload images"}</p>
            <p className="text-xs text-muted-foreground mt-1">{maxFiles - value.length} remaining — JPG, PNG, WEBP</p>
          </div>
        </label>
      )}
    </div>
  );
}
