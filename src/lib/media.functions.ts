import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinary.server";

export const uploadMediaFile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        filename: z.string(),
        base64Data: z.string(),
        mimeType: z.string(),
        size: z.number(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    let finalUrl = "";
    let publicId = "";
    let fileSize = data.size;

    // 1. Attempt Cloudinary upload if configured
    if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
      try {
        const uploaded = await uploadToCloudinary({
          fileData: data.base64Data,
          filename: data.filename,
        });
        if (uploaded?.url) {
          finalUrl = uploaded.url;
          publicId = uploaded.publicId;
          fileSize = uploaded.bytes || data.size;
        }
      } catch (cloudErr) {
        console.warn(
          "[Media Functions] Cloudinary upload skipped, falling back to Supabase Storage:",
          cloudErr,
        );
      }
    }

    // 2. Authoritative fallback: Supabase Storage bucket 'products'
    if (!finalUrl) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const matches = data.base64Data.match(/^data:([^;]+);base64,(.+)$/);
        const buffer = matches
          ? Buffer.from(matches[2], "base64")
          : Buffer.from(data.base64Data, "base64");
        const mimeType = matches ? matches[1] : data.mimeType || "image/jpeg";
        const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
        const cleanName = data.filename
          ? data.filename
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-")
              .substring(0, 30)
          : "media";
        const storagePath = `uploads/${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

        const { error: storageError } = await supabaseAdmin.storage
          .from("products")
          .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!storageError) {
          const { data: pubData } = supabaseAdmin.storage
            .from("products")
            .getPublicUrl(storagePath);
          if (pubData?.publicUrl) {
            finalUrl = pubData.publicUrl;
            publicId = storagePath;
            fileSize = buffer.length;
          }
        } else {
          console.warn("[Media Functions] Supabase storage upload notice:", storageError.message);
        }
      } catch (storageErr) {
        console.warn("[Media Functions] Supabase storage upload exception:", storageErr);
      }
    }

    if (!finalUrl) {
      // Fallback to the optimized data URL if both cloud providers are unavailable
      finalUrl = data.base64Data;
      publicId = `inline_${Date.now()}`;
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row, error } = await supabaseAdmin
        .from("media")
        .insert({
          name: data.filename,
          path: publicId,
          url: finalUrl,
          size: fileSize,
          mime_type: data.mimeType,
        })
        .select()
        .single();

      if (!error && row) {
        return row;
      }
    } catch {
      // If supabase media table is not ready, return standard media record
    }

    return {
      id: publicId,
      name: data.filename,
      path: publicId,
      url: finalUrl,
      size: fileSize,
      mime_type: data.mimeType,
      created_at: new Date().toISOString(),
    };
  });

export const deleteMediaFile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string(),
        path: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (data.path) {
      try {
        await deleteFromCloudinary(data.path);
      } catch (e) {
        console.warn("Cloudinary asset deletion warning:", e);
      }
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("media").delete().eq("id", data.id);
    } catch {
      // ignore
    }

    return { success: true };
  });
