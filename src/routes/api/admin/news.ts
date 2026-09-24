import { createFileRoute } from "@tanstack/react-router";

const NEWS_TICKER_BANNER_ID = "00000000-0000-0000-0000-000000000003";

export const Route = createFileRoute("/api/admin/news")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("banners")
            .select("*")
            .eq("id", NEWS_TICKER_BANNER_ID)
            .maybeSingle();

          if (error) {
            console.warn("[API News GET Error]:", error);
          }

          let config = null;
          if (data && data.subtitle) {
            try {
              config = JSON.parse(data.subtitle);
            } catch {
              // ignore
            }
          }

          if (config && typeof config === "object") {
            const defaultSupport = {
              enabled: true,
              text: "Direct WhatsApp Support",
              url: "https://wa.me/233241118229",
            };
            const defaultTier = {
              enabled: true,
              text: "Certified Tier-1 Importer",
            };

            config = {
              enabled: config.enabled !== false,
              tierBadge: {
                ...defaultTier,
                ...(config.tierBadge || {}),
                enabled:
                  typeof config.tierBadge?.enabled === "boolean"
                    ? config.tierBadge.enabled
                    : defaultTier.enabled,
                text: config.tierBadge?.text || defaultTier.text,
              },
              supportLink: {
                ...defaultSupport,
                ...(config.supportLink || {}),
                enabled:
                  typeof config.supportLink?.enabled === "boolean"
                    ? config.supportLink.enabled
                    : defaultSupport.enabled,
                text: config.supportLink?.text || defaultSupport.text,
                url: config.supportLink?.url || defaultSupport.url,
              },
              items: Array.isArray(config.items) ? config.items : [],
              speedSeconds: config.speedSeconds || config.speed || 30,
              backgroundColor: config.backgroundColor || "#00a884",
              textColor: config.textColor || "#ffffff",
              pauseOnHover: config.pauseOnHover !== false,
            };
          }

          return Response.json({ config });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[API News GET Exception]:", err);
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          if (!body) {
            return Response.json({ error: "Config payload is required" }, { status: 400 });
          }

          const bannerPayload = {
            id: NEWS_TICKER_BANNER_ID,
            title: "news_ticker_config",
            subtitle: JSON.stringify(body),
            badge: "",
            cta_text: "",
            cta_link: "",
            image_url: "",
            gradient: "",
            position: "news_ticker_config",
            is_active: body.enabled !== false,
            sort_order: 0,
          };

          const { error } = await supabaseAdmin.from("banners").upsert(bannerPayload);

          if (error) {
            console.error("[API News POST Error]:", error);
            return Response.json({ error: error.message }, { status: 500 });
          }

          return Response.json({ success: true, config: body });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[API News POST Exception]:", err);
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
