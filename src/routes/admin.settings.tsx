import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Btn, FieldInput, PageHead, Panel, type Field } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";
import { logActivity } from "@/lib/admin-auth";
import { getSiteConfig, saveSiteConfig, type SiteConfig } from "@/data/site";
import {
  MapPin,
  Navigation,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <SuperAdminOnly>
      <SettingsAdmin />
    </SuperAdminOnly>
  ),
});

const groups: { id: string; title: string; fields: Field[] }[] = [
  {
    id: "store",
    title: "Store & Brand Identity",
    fields: [
      { key: "store_name", label: "Store name" },
      { key: "store_description", label: "Store description", type: "textarea" },
      { key: "logo_url", label: "Logo URL" },
      { key: "favicon_url", label: "Favicon URL" },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp Checkout",
    fields: [
      { key: "whatsapp_number", label: "WhatsApp number (e.g. 233555526233)" },
      { key: "whatsapp_message", label: "Default order message", type: "textarea" },
    ],
  },
  {
    id: "contact",
    title: "General Contact Information",
    fields: [
      { key: "phone", label: "Primary Phone" },
      { key: "email", label: "Primary Email" },
      { key: "address", label: "Main Office Address", full: true },
    ],
  },
  {
    id: "social",
    title: "Social Links",
    fields: [
      { key: "facebook", label: "Facebook" },
      { key: "instagram", label: "Instagram" },
      { key: "tiktok", label: "TikTok" },
      { key: "x_url", label: "X (Twitter)" },
      { key: "youtube", label: "YouTube" },
    ],
  },
  {
    id: "footer",
    title: "Footer & Legal",
    fields: [
      { key: "footer_description", label: "Footer description", type: "textarea" },
      { key: "copyright_text", label: "Copyright text", full: true },
    ],
  },
  {
    id: "shopping",
    title: "Shopping Features",
    fields: [
      { key: "favorites_enabled", label: "Enable favorites", type: "bool" },
      { key: "cart_enabled", label: "Enable cart", type: "bool" },
      { key: "max_qty_per_product", label: "Max quantity per product", type: "number" },
    ],
  },
];

function SettingsAdmin() {
  const qc = useQueryClient();
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [form, setForm] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "delivery" | "store" | "whatsapp" | "contact">(
    "all",
  );

  // Delivery Hub & Live Map configuration state
  const [deliveryConfig, setDeliveryConfig] = useState<SiteConfig>(() => getSiteConfig());

  const { data } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data && !form) {
      setForm(data);
    }
  }, [data, form]);

  // Live preview map calculation
  const currentMapEmbed =
    deliveryConfig.mapEmbedUrl ||
    `https://maps.google.com/maps?q=${encodeURIComponent(
      deliveryConfig.mapLocation || deliveryConfig.address || "Circle Tip Toe Lane, Accra, Ghana",
    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const save = useMutation({
    mutationFn: async () => {
      // 1. Save delivery hub and map settings to local site configuration store
      saveSiteConfig(deliveryConfig);

      // 2. Save site settings to Supabase
      if (form) {
        const payload = { ...form };
        delete payload.id;
        delete payload.updated_at;
        try {
          const { error } = await supabase
            .from("site_settings")
            .update(payload)
            .eq("id", "default");
          if (error) console.warn("Supabase settings sync error:", error);
        } catch (e) {
          console.warn("Could not sync to Supabase, local config persisted:", e);
        }
      }

      await logActivity("Updated site settings and delivery hub configuration");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storefront"] });
      qc.invalidateQueries({ queryKey: ["admin", "site_settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (!form) return <p className="text-sm text-muted-foreground p-6">Loading store settings…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHead
          title="Settings & Hub Configuration"
          description="Manage store branding, public /delivery page, Google Maps location, and contact options."
        />
        <div className="flex items-center gap-2">
          <a
            href="/delivery"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Eye className="h-3.5 w-3.5 text-emerald-600" />
            View Public Delivery Page
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "delivery"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          Delivery, Hub & Map Location
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("store")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "store"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Store Identity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "whatsapp"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          WhatsApp Checkout
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            activeTab === "contact"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Contact & Social
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="grid gap-6"
      >
        {/* Dedicated Delivery Hub & Map Configuration Section */}
        {(activeTab === "all" || activeTab === "delivery") && (
          <Panel>
            <div className="border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Delivery Page, Hub & Map Configuration
                    </h2>
                    <p className="text-xs text-slate-500">
                      Controls the &quot;Visit Us&quot; section, working hours, dispatch details,
                      and live Google Maps on /delivery.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                  Live Public Sync
                </span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Form Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Visit Us Hub Title
                  </label>
                  <input
                    type="text"
                    value={deliveryConfig.visitUsLocation}
                    onChange={(e) =>
                      setDeliveryConfig({ ...deliveryConfig, visitUsLocation: e.target.value })
                    }
                    placeholder="e.g. Circle Tip Toe Lane, Accra Central Hub"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Heading shown on the primary &quot;Visit Us&quot; card on the delivery page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physical Address for Customers
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryConfig.address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDeliveryConfig({ ...deliveryConfig, address: val });
                      if (form) setForm({ ...form, address: val });
                    }}
                    placeholder="e.g. Circle Tip Toe Lane, Opposite Vodafone Building, Accra, Ghana"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Google Maps Search Query / Location Pin</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newQuery =
                          deliveryConfig.address || "Circle Tip Toe Lane, Accra, Ghana";
                        setDeliveryConfig({
                          ...deliveryConfig,
                          mapLocation: newQuery,
                          mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
                            newQuery,
                          )}&t=&z=14&ie=UTF8&iwloc=&output=embed`,
                        });
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      Sync with Address
                    </button>
                  </label>
                  <input
                    type="text"
                    value={deliveryConfig.mapLocation}
                    onChange={(e) => {
                      const newLoc = e.target.value;
                      setDeliveryConfig({
                        ...deliveryConfig,
                        mapLocation: newLoc,
                        mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(
                          newLoc,
                        )}&t=&z=14&ie=UTF8&iwloc=&output=embed`,
                      });
                    }}
                    placeholder="e.g. Circle Tip Toe Lane, Accra, Ghana"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    The exact place name or street used to generate the live Google Maps pin.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      value={deliveryConfig.workingHours}
                      onChange={(e) =>
                        setDeliveryConfig({ ...deliveryConfig, workingHours: e.target.value })
                      }
                      placeholder="e.g. Mon – Sat: 8:30 AM – 7:30 PM"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pick-up Status Badge
                    </label>
                    <input
                      type="text"
                      value={deliveryConfig.pickupInfo}
                      onChange={(e) =>
                        setDeliveryConfig({ ...deliveryConfig, pickupInfo: e.target.value })
                      }
                      placeholder="e.g. Walk-in & Pick-up Available"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Accra Same-Day Delivery Text
                    </label>
                    <input
                      type="text"
                      value={deliveryConfig.deliveryAccraInfo}
                      onChange={(e) =>
                        setDeliveryConfig({ ...deliveryConfig, deliveryAccraInfo: e.target.value })
                      }
                      placeholder="e.g. Same-Day Dispatch within 2-4 hours across Greater Accra"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Regional Bus Waybill Text
                    </label>
                    <input
                      type="text"
                      value={deliveryConfig.deliveryRegionsInfo}
                      onChange={(e) =>
                        setDeliveryConfig({
                          ...deliveryConfig,
                          deliveryRegionsInfo: e.target.value,
                        })
                      }
                      placeholder="e.g. 24-Hour VIP / OA / STC Bus Waybill Dispatch to all regions"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Google Map Embed URL (Optional override)
                  </label>
                  <input
                    type="text"
                    value={deliveryConfig.mapEmbedUrl}
                    onChange={(e) =>
                      setDeliveryConfig({ ...deliveryConfig, mapEmbedUrl: e.target.value })
                    }
                    placeholder="https://maps.google.com/maps?q=...&output=embed"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-mono text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Leave blank to auto-generate a valid map from the location search query above.
                  </p>
                </div>
              </div>

              {/* Live Preview Column */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                    Live Google Maps Location Preview
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    How it looks on /delivery
                  </span>
                </div>

                <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
                  <iframe
                    title="Admin Google Map Location Preview"
                    src={currentMapEmbed}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                  <div className="absolute left-3 top-3 max-w-[240px] rounded-xl border border-slate-200/80 bg-white/95 p-2.5 shadow-md backdrop-blur-xs">
                    <p className="text-[11px] font-bold text-slate-900">
                      {deliveryConfig.name || "I.A Dewealth's Enterprise"}
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-700">
                      {deliveryConfig.visitUsLocation || "Central Accra Hub"}
                    </p>
                    <p className="mt-0.5 text-[9px] text-slate-500 line-clamp-2">
                      {deliveryConfig.address || "Circle Tip Toe Lane, Accra"}
                    </p>
                  </div>
                </div>

                {/* Info summary card */}
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Operating Hours
                      </span>
                      <span className="text-slate-800 font-medium text-[11px] leading-tight">
                        {deliveryConfig.workingHours || "Not specified"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Pick-up Available
                      </span>
                      <span className="text-emerald-700 font-bold text-[11px] leading-tight">
                        {deliveryConfig.pickupInfo || "Yes"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* Standard Settings Groups */}
        {groups
          .filter((g) => {
            if (activeTab === "all") return true;
            if (activeTab === "store" && g.id === "store") return true;
            if (activeTab === "whatsapp" && g.id === "whatsapp") return true;
            if (
              activeTab === "contact" &&
              (g.id === "contact" || g.id === "social" || g.id === "footer")
            )
              return true;
            return false;
          })
          .map((g) => (
            <Panel key={g.title}>
              <h2 className="mb-3 text-sm font-extrabold text-slate-900">{g.title}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {g.fields.map((f) => (
                  <div
                    key={f.key}
                    className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}
                  >
                    <FieldInput
                      field={f}
                      value={form[f.key]}
                      onChange={(v) => {
                        setForm({ ...form, [f.key]: v });
                        // Also sync to deliveryConfig if applicable
                        if (f.key === "store_name")
                          setDeliveryConfig((prev) => ({ ...prev, name: v }));
                        if (f.key === "phone") setDeliveryConfig((prev) => ({ ...prev, phone: v }));
                        if (f.key === "email") setDeliveryConfig((prev) => ({ ...prev, email: v }));
                        if (f.key === "whatsapp_number")
                          setDeliveryConfig((prev) => ({ ...prev, whatsappNumber: v }));
                        if (f.key === "address")
                          setDeliveryConfig((prev) => ({ ...prev, address: v }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          ))}

        {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}

        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Btn type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving changes…" : "Save all settings"}
            </Btn>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Settings & Hub location successfully saved!
              </span>
            )}
          </div>
          <a
            href="/delivery"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-slate-600 hover:text-emerald-600 hover:underline inline-flex items-center gap-1"
          >
            Check Live Delivery Page
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </form>
    </div>
  );
}
