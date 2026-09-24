import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Megaphone,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ShieldCheck,
  Phone,
  Eye,
  Sliders,
  Palette,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  useNewsTicker,
  saveNewsTickerConfig,
  resetNewsTickerToDefaults,
  type NewsItem,
  type NewsTickerConfig,
  DEFAULT_NEWS_ITEMS,
} from "@/data/news-ticker-store";
import { useAdminSession, logActivity } from "@/lib/admin-auth";
import { canAccessModule } from "@/data/permissions-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/news")({
  component: AdminNewsPage,
});

const COLOR_PRESETS = [
  { name: "Brand Emerald", hex: "#00a884" },
  { name: "Deep Forest", hex: "#0b4d3c" },
  { name: "Midnight Navy", hex: "#0f172a" },
  { name: "Ruby Flash Deal", hex: "#b91c1c" },
  { name: "Sapphire Blue", hex: "#1e40af" },
  { name: "Royal Purple", hex: "#6b21a8" },
  { name: "Warm Amber", hex: "#d97706" },
  { name: "Dark Charcoal", hex: "#27272a" },
];

function AdminNewsPage() {
  const { role } = useAdminSession();
  const canEdit = canAccessModule(role, "news", "canEdit");

  const [storedConfig, setStoredConfig] = useNewsTicker();
  const [config, setConfig] = useState<NewsTickerConfig>(storedConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newText, setNewText] = useState("");
  const [newLink, setNewLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync internal form state when stored config changes externally
  useEffect(() => {
    setConfig(storedConfig);
    setHasUnsavedChanges(false);
  }, [storedConfig]);

  const updateConfig = (patch: Partial<NewsTickerConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      setHasUnsavedChanges(true);
      return next;
    });
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("You do not have permission to edit news settings.");
      return;
    }

    setIsSaving(true);
    try {
      saveNewsTickerConfig(config);
      setStoredConfig(config);
      setHasUnsavedChanges(false);
      await logActivity(
        `Updated News & Announcement Bar (${config.items.filter((i) => i.active).length} active announcements)`,
      );
      toast.success("News & Top Announcement Bar updated successfully!");
    } catch (err) {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all news messages and display settings to original defaults?")) {
      const reset = resetNewsTickerToDefaults();
      setConfig(reset);
      setStoredConfig(reset);
      setHasUnsavedChanges(false);
      toast.success("News reset to default announcements.");
    }
  };

  const handleAddItem = (textToAdd?: string) => {
    const text = textToAdd || newText.trim();
    if (!text) {
      toast.error("Please enter news announcement text.");
      return;
    }

    const newItem: NewsItem = {
      id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      link: newLink.trim() || undefined,
      active: true,
    };

    const nextItems = [...config.items, newItem];
    updateConfig({ items: nextItems });
    setNewText("");
    setNewLink("");
    toast.success("News item added!");
  };

  const handleDeleteItem = (id: string) => {
    const nextItems = config.items.filter((i) => i.id !== id);
    updateConfig({ items: nextItems });
    toast.info("Item removed.");
  };

  const handleToggleItem = (id: string) => {
    const nextItems = config.items.map((i) => (i.id === id ? { ...i, active: !i.active } : i));
    updateConfig({ items: nextItems });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const items = config.items || [];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    updateConfig({ items: copy });
  };

  const handleItemTextChange = (id: string, text: string) => {
    const nextItems = config.items.map((i) => (i.id === id ? { ...i, text } : i));
    updateConfig({ items: nextItems });
  };

  const handleItemLinkChange = (id: string, link: string) => {
    const nextItems = config.items.map((i) =>
      i.id === id ? { ...i, link: link.trim() || undefined } : i,
    );
    updateConfig({ items: nextItems });
  };

  const activeItemsCount = config.items.filter((i) => i.active).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a884]/15 text-[#00a884]">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                News & Top Announcement Bar
              </h1>
              <p className="text-xs text-slate-500">
                Configure the top scrolling news ticker, certified importer badge, and WhatsApp
                support callout.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>View Live Site</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canEdit || isSaving || !hasUnsavedChanges}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition ${
              hasUnsavedChanges
                ? "bg-[#00a884] hover:bg-[#009676] shadow-[#00a884]/25 cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-80"
            }`}
          >
            <Check className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              You have unsaved changes to the news ticker. Remember to click "Save Changes" to apply
              them to the storefront.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white hover:bg-amber-700 transition"
          >
            Save Now
          </button>
        </div>
      )}

      {/* LIVE SIMULATOR / PREVIEW */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Live Storefront Preview
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {config?.enabled ? "Active at top of every page" : "Disabled (Hidden on storefront)"}
          </span>
        </div>

        {config?.enabled ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div
              style={{
                backgroundColor: config.backgroundColor || "#00a884",
                color: config.textColor || "#ffffff",
              }}
              className="px-4 py-2.5 text-xs font-semibold select-none"
            >
              <div className="marquee-wrapper w-full overflow-hidden">
                <div
                  className="animate-marquee items-center gap-6 whitespace-nowrap text-[12px]"
                  style={{ animationDuration: `${config.speedSeconds || 30}s` }}
                >
                  {/* Row */}
                  <div className="flex items-center gap-6">
                    <span className="inline-flex items-center gap-3">
                      {(config.items || [])
                        .filter((i) => i.active)
                        .map((item, idx, arr) => (
                          <span key={item.id} className="inline-flex items-center gap-3">
                            <span>{item.text}</span>
                            {(idx < arr.length - 1 ||
                              config.tierBadge?.enabled ||
                              config.supportLink?.enabled) && <span className="opacity-70">•</span>}
                          </span>
                        ))}
                    </span>

                    {config.tierBadge?.enabled && (
                      <>
                        <span className="flex items-center gap-1 font-semibold">
                          <ShieldCheck className="h-4 w-4" /> {config.tierBadge?.text}
                        </span>
                        {config.supportLink?.enabled && <span className="opacity-70">•</span>}
                      </>
                    )}

                    {config.supportLink?.enabled && (
                      <span className="font-bold underline cursor-pointer">
                        {config.supportLink?.text}
                      </span>
                    )}
                    <span className="opacity-70">★</span>
                  </div>

                  {/* Duplicate row for seamless loop */}
                  <div aria-hidden className="flex items-center gap-6">
                    <span className="inline-flex items-center gap-3">
                      {(config.items || [])
                        .filter((i) => i.active)
                        .map((item, idx, arr) => (
                          <span key={item.id} className="inline-flex items-center gap-3">
                            <span>{item.text}</span>
                            {(idx < arr.length - 1 ||
                              config.tierBadge?.enabled ||
                              config.supportLink?.enabled) && <span className="opacity-70">•</span>}
                          </span>
                        ))}
                    </span>

                    {config.tierBadge?.enabled && (
                      <>
                        <span className="flex items-center gap-1 font-semibold">
                          <ShieldCheck className="h-4 w-4" /> {config.tierBadge?.text}
                        </span>
                        {config.supportLink?.enabled && <span className="opacity-70">•</span>}
                      </>
                    )}

                    {config.supportLink?.enabled && (
                      <span className="font-bold underline cursor-pointer">
                        {config.supportLink?.text}
                      </span>
                    )}
                    <span className="opacity-70">★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">
            The News Announcement Bar is currently toggled <strong>OFF</strong>. Turn it on below to
            display it on the storefront.
          </div>
        )}
      </div>

      {/* TWO COLUMN GRID: Configuration & News Items List */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Style & Master Settings (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Master Enable Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Announcement Bar Status</h2>
                <p className="text-xs text-slate-500">Enable or disable on storefront header</p>
              </div>

              <button
                type="button"
                onClick={() => updateConfig({ enabled: !config?.enabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  config?.enabled ? "bg-[#00a884]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    config?.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Currently Visible:</span>
              <span
                className={`font-bold ${config?.enabled ? "text-emerald-600" : "text-slate-400"}`}
              >
                {config?.enabled ? "Yes (Top of Header)" : "No (Hidden)"}
              </span>
            </div>
          </div>

          {/* Appearance & Color */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#00a884]" />
              <h2 className="text-sm font-bold text-slate-900">Theme & Background Color</h2>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected =
                  config.backgroundColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => updateConfig({ backgroundColor: preset.hex })}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                      isSelected
                        ? "border-[#00a884] bg-[#00a884]/10 ring-2 ring-[#00a884]"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className="h-6 w-6 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-[10px] font-bold text-slate-700 line-clamp-1">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Custom Hex Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                  className="h-9 w-9 rounded-lg border border-slate-200 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                  placeholder="#00a884"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Speed & Animation */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#00a884]" />
              <h2 className="text-sm font-bold text-slate-900">Scroll Speed & Interaction</h2>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">Marquee Speed</label>
                <span className="font-mono text-slate-500">{config.speedSeconds}s cycle</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={config.speedSeconds}
                onChange={(e) => updateConfig({ speedSeconds: Number(e.target.value) })}
                className="mt-2 w-full accent-[#00a884] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Fast (15s)</span>
                <span>Normal (30s)</span>
                <span>Relaxed (60s)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="block text-xs font-bold text-slate-800">Pause on Hover</span>
                <span className="text-[11px] text-slate-400">
                  Stop scrolling when user points mouse
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateConfig({ pauseOnHover: !config.pauseOnHover })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  config.pauseOnHover ? "bg-[#00a884]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    config.pauseOnHover ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Badges & WhatsApp Quick Callouts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Callouts & Badges</h2>

            {/* Importer Badge */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-[#00a884]" />
                  <span>Trust / Importer Badge</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateConfig({
                      tierBadge: {
                        ...(config.tierBadge || {}),
                        enabled: !config.tierBadge?.enabled,
                        text: config.tierBadge?.text || "Certified Tier-1 Importer",
                      },
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.tierBadge?.enabled ? "bg-[#00a884]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      config.tierBadge?.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {config.tierBadge?.enabled && (
                <input
                  type="text"
                  value={config.tierBadge?.text || ""}
                  onChange={(e) =>
                    updateConfig({
                      tierBadge: {
                        ...(config.tierBadge || {}),
                        enabled: true,
                        text: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Certified Tier-1 Importer"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                />
              )}
            </div>

            {/* Direct WhatsApp Support */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Phone className="h-4 w-4 text-[#00a884]" />
                  <span>Direct WhatsApp Link</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateConfig({
                      supportLink: {
                        ...(config.supportLink || {}),
                        enabled: !config.supportLink?.enabled,
                        text: config.supportLink?.text || "Direct WhatsApp Support",
                        url: config.supportLink?.url || "",
                      },
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    config.supportLink?.enabled ? "bg-[#00a884]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      config.supportLink?.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {config.supportLink?.enabled && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={config.supportLink?.text || ""}
                    onChange={(e) =>
                      updateConfig({
                        supportLink: {
                          ...(config.supportLink || {}),
                          enabled: true,
                          text: e.target.value,
                          url: config.supportLink?.url || "",
                        },
                      })
                    }
                    placeholder="e.g. Direct WhatsApp Support"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={config.supportLink?.url || ""}
                    onChange={(e) =>
                      updateConfig({
                        supportLink: {
                          ...(config.supportLink || {}),
                          enabled: true,
                          text: config.supportLink?.text || "Direct WhatsApp Support",
                          url: e.target.value,
                        },
                      })
                    }
                    placeholder="https://wa.me/233241118229"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: News Announcement Items (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Add New News Item Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#00a884]" />
                <span>Create New Announcement</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Active: {activeItemsCount} / {(config.items || []).length} total
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  placeholder="e.g. ⚡ Massive Price Drop on Certified MacBooks & iPhones This Weekend!"
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-[#00a884] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#00a884] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#009676] transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add News</span>
                </button>
              </div>

              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Optional destination link: e.g. /deals or /category/phones"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs text-slate-600 focus:border-[#00a884] focus:outline-hidden"
              />
            </div>
          </div>

          {/* List of Current News Items */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Announcements Ticker List ({(config.items || []).length})
              </h2>
              <span className="text-xs text-slate-500">Reorder with arrows or toggle active</span>
            </div>

            {(config.items || []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
                No announcements in the ticker. Add one above or choose from presets.
              </div>
            ) : (
              <div className="space-y-2.5">
                {(config.items || []).map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-2 rounded-xl border p-3.5 transition sm:flex-row sm:items-center ${
                      item.active
                        ? "border-slate-200 bg-white"
                        : "border-slate-200 bg-slate-50/70 opacity-60"
                    }`}
                  >
                    {/* Reorder and Status Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        title="Move Up"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === (config.items || []).length - 1}
                        title="Move Down"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-[10px] font-bold text-slate-400 w-5 text-center">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Content Inputs */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-[#00a884] focus:bg-white focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={item.link || ""}
                        onChange={(e) => handleItemLinkChange(item.id, e.target.value)}
                        placeholder="Optional Link (e.g. /category/laptops)"
                        className="w-full rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1 text-[11px] font-mono text-slate-500 focus:border-[#00a884] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* Actions: Toggle Active & Delete */}
                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-3">
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                          item.active
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {item.active ? "Active" : "Paused"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete announcement"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
