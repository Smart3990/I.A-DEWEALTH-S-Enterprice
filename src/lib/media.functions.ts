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
    const uploaded = await uploadToCloudinary({
      fileData: data.base64Data,
      filename: data.filename,
    });

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row, error } = await supabaseAdmin
        .from("media")
        .insert({
          name: data.filename,
          path: uploaded.publicId,
          url: uploaded.url,
          size: uploaded.bytes || data.size,
          mime_type: data.mimeType,
        })
        .select()
        .single();

      if (!error && row) {
        return row;
      }
    } catch {
      // If supabase table is not ready, return standard media record
    }

    return {
      id: uploaded.publicId,
      name: data.filename,
      path: uploaded.publicId,
      url: uploaded.url,
      size: uploaded.bytes || data.size,
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
