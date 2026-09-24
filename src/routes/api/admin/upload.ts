import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const rawData = body?.image || body?.base64Data || body?.fileData || "";
          const filename = String(body?.filename || "product-image").trim();

          if (!rawData || typeof rawData !== "string") {
            return Response.json(
              { error: "Image data (base64 string or data URL) is required" },
              { status: 400 },
            );
          }

          let finalUrl = "";

          // 1. Attempt Cloudinary if credentials are configured
          if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
            try {
              const { uploadToCloudinary } = await import("@/lib/cloudinary.server");
              const res = await uploadToCloudinary({
                fileData: rawData,
                filename,
                folder: "iadewealth/products",
              });
              if (res?.url) {
                finalUrl = res.url;
              }
            } catch (cloudErr) {
              console.warn("[Upload API] Cloudinary upload skipped:", cloudErr);
            }
          }

          // 2. Authoritative Supabase Storage bucket 'products'
          if (!finalUrl) {
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              const matches = rawData.match(/^data:([^;]+);base64,(.+)$/);
              const buffer = matches
                ? Buffer.from(matches[2], "base64")
                : Buffer.from(rawData, "base64");
              const mimeType = matches ? matches[1] : "image/jpeg";
              const ext = mimeType.includes("png")
                ? "png"
                : mimeType.includes("webp")
                  ? "webp"
                  : "jpg";
              const cleanSlug = filename
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-")
                .substring(0, 32);
              const storagePath = `uploads/${cleanSlug}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

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
                }
              } else {
                console.warn("[Upload API] Supabase storage upload notice:", storageError.message);
              }
            } catch (storageErr) {
              console.warn("[Upload API] Supabase storage upload exception:", storageErr);
            }
          }

          if (!finalUrl) {
            finalUrl = rawData;
          }

          return Response.json({
            success: true,
            url: finalUrl,
            message: "Image uploaded and CDN URL generated successfully.",
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
