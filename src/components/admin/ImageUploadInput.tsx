import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  id?: string;
}

// Helper to compress images client-side before upload or base64 storage
async function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.85,
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          // Fallback if canvas context fails
          const rawDataUrl = e.target?.result as string;
          resolve({ blob: file, dataUrl: rawDataUrl });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              resolve({ blob: file, dataUrl });
            }
          },
          mimeType,
          quality,
        );
      };
      img.onerror = () => {
        // Fallback on decode failure
        const rawDataUrl = e.target?.result as string;
        resolve({ blob: file, dataUrl: rawDataUrl });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImageFile(file: File): Promise<string> {
  // Validate image format
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file (PNG, JPG, WebP, etc.)");
  }

  // 1. Compress image client-side to ensure fast uploads
  const { blob, dataUrl } = await compressImageFile(file);

  // 2. Primary: Upload via server endpoint /api/admin/upload (handles Cloudinary + Supabase Storage with service role)
  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        image: dataUrl,
      }),
    });
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      if (json?.url && typeof json.url === "string" && !json.url.startsWith("data:image/")) {
        return json.url;
      }
    }
  } catch (apiErr) {
    console.warn("[ImageUploadInput] /api/admin/upload notice, falling back:", apiErr);
  }

  // 3. Secondary: Try server function uploadMediaFile
  try {
    const { uploadMediaFile } = await import("@/lib/media.functions");
    const uploaded = await uploadMediaFile({
      data: {
        filename: file.name,
        base64Data: dataUrl,
        mimeType: file.type || "image/jpeg",
        size: file.size,
      },
    });
    if (uploaded?.url && !uploaded.url.startsWith("data:image/")) {
      return uploaded.url;
    }
  } catch (cloudErr) {
    console.warn("Upload fallback notice:", cloudErr);
  }

  // 4. Fallback: return optimized compressed dataUrl (crisp, compact ~100KB)
  return dataUrl;
}

export async function uploadMultipleImageFiles(files: File[]): Promise<string[]> {
  const validFiles = files.filter((f) => f.type.startsWith("image/"));
  if (validFiles.length === 0) {
    throw new Error("Please select valid image files (PNG, JPG, WebP, etc.)");
  }
  const uploadedUrls: string[] = [];
  for (const file of validFiles) {
    try {
      const url = await uploadImageFile(file);
      if (url) uploadedUrls.push(url);
    } catch (err) {
      console.warn(`Skipped failed upload for ${file.name}:`, err);
    }
  }
  return uploadedUrls;
}

export function ImageUploadInput({
  value,
  onChange,
  label,
  placeholder = "https://example.com/image.jpg",
  helperText,
  id,
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset image error state whenever value changes
  useEffect(() => {
    setImgError(false);
  }, [value]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const uploadedUrl = await uploadImageFile(file);
      onChange(uploadedUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "Failed to process image file";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-1.5" id={id}>
      {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}

      {/* URL Input and Upload Button Side-by-Side */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Text Input for URL */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#00a884] focus:outline-hidden"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 transition"
              title="Clear URL"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Second Image Upload Button */}
        <div className="shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:border-[#00a884] hover:text-[#00a884] transition disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00a884]" />
                <span>Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                <span>Upload from Device</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image Preview Thumbnail if value exists */}
      {value && (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-2">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center">
            {imgError ? (
              <ImageIcon className="h-5 w-5 text-slate-400" />
            ) : (
              <img
                src={value}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={() => {
                  setImgError(true);
                }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {imgError ? (
                <span className="text-[11px] font-semibold text-amber-600">
                  Image URL may be invalid or protected
                </span>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <p className="text-[11px] font-bold text-slate-800">Image attached</p>
                </>
              )}
            </div>
            <p className="truncate font-mono text-[10px] text-slate-400">{value}</p>
          </div>
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
}
