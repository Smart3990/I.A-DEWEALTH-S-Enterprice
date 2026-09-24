import { createFileRoute } from "@tanstack/react-router";

const SITE_CONFIG_BANNER_ID = "00000000-0000-0000-0000-000000000002";

export const Route = createFileRoute("/api/admin/settings")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // 1. Fetch site_settings
          const { data: settingsRow, error: settingsError } = await supabaseAdmin
            .from("site_settings")
            .select("*")
            .or("id.eq.primary,id.eq.default")
            .maybeSingle();

          if (settingsError) {
            console.warn("[API Settings GET site_settings Error]:", settingsError);
          }

          // 2. Fetch extended hub config from banners
          const { data: hubBanner } = await supabaseAdmin
            .from("banners")
            .select("*")
            .eq("id", SITE_CONFIG_BANNER_ID)
            .maybeSingle();

          let hubConfig = {};
          if (hubBanner && hubBanner.subtitle) {
            try {
              hubConfig = JSON.parse(hubBanner.subtitle);
            } catch {
              // ignore
            }
          }

          return Response.json({
            settings: settingsRow || null,
            hubConfig,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[API Settings GET Exception]:", err);
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const nowIso = new Date().toISOString();

          // Prepare site_settings database payload
          const siteSettingsPayload: Record<string, unknown> = {
            updated_at: nowIso,
          };

          if (body.store_name !== undefined || body.storeName !== undefined) {
            siteSettingsPayload.store_name = String(body.store_name ?? body.storeName).trim();
          }
          if (body.whatsapp_number !== undefined || body.whatsappNumber !== undefined) {
            siteSettingsPayload.whatsapp_number = String(
              body.whatsapp_number ?? body.whatsappNumber,
            ).trim();
          }
          if (body.contact_phone !== undefined || body.phone !== undefined) {
            siteSettingsPayload.contact_phone = String(body.contact_phone ?? body.phone).trim();
          }
          if (body.contact_email !== undefined || body.email !== undefined) {
            siteSettingsPayload.contact_email = String(body.contact_email ?? body.email).trim();
          }
          if (body.address !== undefined) {
            siteSettingsPayload.address = String(body.address).trim();
          }
          if (body.currency_symbol !== undefined || body.currencySymbol !== undefined) {
            siteSettingsPayload.currency_symbol = String(
              body.currency_symbol ?? body.currencySymbol,
            ).trim();
          }
          if (body.currency_code !== undefined || body.currencyCode !== undefined) {
            siteSettingsPayload.currency_code = String(
              body.currency_code ?? body.currencyCode,
            ).trim();
          }
          if (body.delivery_charge !== undefined || body.deliveryCharge !== undefined) {
            siteSettingsPayload.delivery_charge =
              Number(body.delivery_charge ?? body.deliveryCharge) || 0;
          }
          if (
            body.free_delivery_threshold !== undefined ||
            body.freeDeliveryThreshold !== undefined
          ) {
            siteSettingsPayload.free_delivery_threshold =
              Number(body.free_delivery_threshold ?? body.freeDeliveryThreshold) || 0;
          }
          if (body.facebook_url !== undefined || body.facebook !== undefined) {
            siteSettingsPayload.facebook_url = String(
              body.facebook_url ?? body.facebook ?? "",
            ).trim();
          }
          if (body.instagram_url !== undefined || body.instagram !== undefined) {
            siteSettingsPayload.instagram_url = String(
              body.instagram_url ?? body.instagram ?? "",
            ).trim();
          }
          if (body.tiktok_url !== undefined || body.tiktok !== undefined) {
            siteSettingsPayload.tiktok_url = String(body.tiktok_url ?? body.tiktok ?? "").trim();
          }
          if (body.x_url !== undefined || body.xUrl !== undefined) {
            siteSettingsPayload.x_url = String(body.x_url ?? body.xUrl ?? "").trim();
          }
          if (body.youtube_url !== undefined || body.youtube !== undefined) {
            siteSettingsPayload.youtube_url = String(body.youtube_url ?? body.youtube ?? "").trim();
          }
          if (body.footer_description !== undefined || body.footerDescription !== undefined) {
            siteSettingsPayload.footer_description = String(
              body.footer_description ?? body.footerDescription ?? "",
            ).trim();
          }
          if (body.copyright_text !== undefined || body.copyrightText !== undefined) {
            siteSettingsPayload.copyright_text = String(
              body.copyright_text ?? body.copyrightText ?? "",
            ).trim();
          }
          if (body.favorites_enabled !== undefined || body.favoritesEnabled !== undefined) {
            siteSettingsPayload.favorites_enabled = Boolean(
              body.favorites_enabled ?? body.favoritesEnabled,
            );
          }
          if (body.cart_enabled !== undefined || body.cartEnabled !== undefined) {
            siteSettingsPayload.cart_enabled = Boolean(body.cart_enabled ?? body.cartEnabled);
          }
          if (body.reviews_enabled !== undefined || body.reviewsEnabled !== undefined) {
            siteSettingsPayload.reviews_enabled = Boolean(
              body.reviews_enabled ?? body.reviewsEnabled,
            );
          }

          // Check if primary or default row exists, otherwise use "primary"
          const { data: existing } = await supabaseAdmin
            .from("site_settings")
            .select("id")
            .or("id.eq.primary,id.eq.default")
            .maybeSingle();

          const targetId = existing?.id || "primary";

          const { error: upsertError } = await supabaseAdmin
            .from("site_settings")
            .upsert({ id: targetId, ...siteSettingsPayload });

          if (upsertError) {
            console.error("[API Settings POST upsertError]:", upsertError);
            return Response.json({ error: upsertError.message }, { status: 500 });
          }

          // Also save extended delivery hub and brand config to banners row
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          let existingHubConfig: Record<string, any> = {};
          const { data: currentBanner } = await supabaseAdmin
            .from("banners")
            .select("subtitle")
            .eq("id", SITE_CONFIG_BANNER_ID)
            .maybeSingle();
          if (currentBanner?.subtitle) {
            try {
              existingHubConfig = JSON.parse(currentBanner.subtitle);
            } catch {
              /* ignore parse errors */
            }
          }

          const hubPayload = {
            ...existingHubConfig,
            workingHours:
              body.working_hours ||
              body.workingHours ||
              body.deliveryConfig?.workingHours ||
              existingHubConfig.workingHours ||
              "Monday – Saturday: 8:30 AM – 7:30 PM (Sunday: Closed)",
            mapLocation:
              body.mapLocation ||
              body.deliveryConfig?.mapLocation ||
              body.address ||
              existingHubConfig.mapLocation ||
              "Circle Tip Toe Lane, Opposite Vodafone Building, Accra, Ghana",
            mapEmbedUrl:
              body.mapEmbedUrl ||
              body.deliveryConfig?.mapEmbedUrl ||
              existingHubConfig.mapEmbedUrl ||
              "",
            pickupInfo:
              body.pickupInfo ||
              body.deliveryConfig?.pickupInfo ||
              existingHubConfig.pickupInfo ||
              "Ready in 30 mins at Circle Tip Toe Lane showroom",
            deliveryAccraInfo:
              body.deliveryAccraInfo ||
              body.deliveryConfig?.deliveryAccraInfo ||
              existingHubConfig.deliveryAccraInfo ||
              "Same-day dispatch via dedicated dispatch rider (GH₵ 30 - 50)",
            deliveryRegionsInfo:
              body.deliveryRegionsInfo ||
              body.deliveryConfig?.deliveryRegionsInfo ||
              existingHubConfig.deliveryRegionsInfo ||
              "Next-day delivery via VIP / OA / Fedex courier across Ghana",
            visitUsLocation:
              body.visitUsLocation ||
              body.deliveryConfig?.visitUsLocation ||
              body.address ||
              existingHubConfig.visitUsLocation ||
              "Circle Tip Toe Lane, Opposite Vodafone Building, Accra",
            storeDescription:
              body.store_description ||
              body.storeDescription ||
              body.deliveryConfig?.storeDescription ||
              existingHubConfig.storeDescription ||
              "",
            logoUrl:
              body.logo_url ||
              body.logoUrl ||
              body.deliveryConfig?.logoUrl ||
              existingHubConfig.logoUrl ||
              "",
            faviconUrl:
              body.favicon_url ||
              body.faviconUrl ||
              body.deliveryConfig?.faviconUrl ||
              existingHubConfig.faviconUrl ||
              "",
            maxQtyPerProduct:
              body.max_qty_per_product ??
              body.maxQtyPerProduct ??
              existingHubConfig.maxQtyPerProduct ??
              20,
            superdealsHours:
              body.superdeals_hours !== undefined
                ? Number(body.superdeals_hours)
                : body.superdealsHours !== undefined
                  ? Number(body.superdealsHours)
                  : (existingHubConfig.superdealsHours ?? 8),
            superdealsMinutes:
              body.superdeals_minutes !== undefined
                ? Number(body.superdeals_minutes)
                : body.superdealsMinutes !== undefined
                  ? Number(body.superdealsMinutes)
                  : (existingHubConfig.superdealsMinutes ?? 29),
            superdealsSeconds:
              body.superdeals_seconds !== undefined
                ? Number(body.superdeals_seconds)
                : body.superdealsSeconds !== undefined
                  ? Number(body.superdealsSeconds)
                  : (existingHubConfig.superdealsSeconds ?? 33),
          };

          await supabaseAdmin.from("banners").upsert({
            id: SITE_CONFIG_BANNER_ID,
            title: "site_config",
            subtitle: JSON.stringify(hubPayload),
            badge: "",
            cta_text: "",
            cta_link: "",
            image_url: "",
            gradient: "",
            position: "site_config",
            is_active: true,
            sort_order: 0,
          });

          return Response.json({ success: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[API Settings POST Exception]:", err);
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
