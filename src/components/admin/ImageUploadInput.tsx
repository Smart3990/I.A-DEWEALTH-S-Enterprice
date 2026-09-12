import { useState, useRef, type ChangeEvent } from "react";
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

export function ImageUploadInput({
  value,
  onChange,
  label,
  placeholder = "https://example.com/image.jpg",
  helperText,
  id,
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP, SVG)");
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file size should be less than 8MB");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Try uploading to Supabase Storage if available
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      let uploadedUrl: string | null = null;

      try {
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!uploadError) {
          const { data } = supabase.storage.from("products").getPublicUrl(filePath);
          if (data?.publicUrl) {
            uploadedUrl = data.publicUrl;
          }
        }
      } catch {
        // Fallback gracefully to Base64 Data URL if storage bucket is not configured
      }

      // 2. Fallback: Base64 Data URL
      if (!uploadedUrl) {
        const reader = new FileReader();
        uploadedUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      onChange(uploadedUrl);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to process image file. Please try pasting a direct URL instead.");
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
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback icon on broken image
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <p className="text-[11px] font-bold text-slate-800">Image attached</p>
            </div>
            <p className="truncate font-mono text-[10px] text-slate-400">{value}</p>
          </div>
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
}
