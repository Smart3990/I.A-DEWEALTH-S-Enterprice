import { useEffect, useState } from "react";
import { Download, Share, PlusSquare, X, Monitor, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import brandLogo from "@/assets/ia-dewealth-logo.png";

export function PWAInstallButton({
  variant = "pill",
  className = "",
}: {
  variant?: "pill" | "banner" | "button";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure initial SSR and client hydration render identical null
  if (!mounted || isInstalled || dismissed) {
    return null;
  }

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-pwa-install"));
  };

  return (
    <>
      {variant === "banner" ? (
        <div
          className={`relative flex items-center justify-between gap-3 border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-foreground md:rounded-lg ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={brandLogo}
              alt="I.A Dewealth"
              className="h-8 w-8 shrink-0 object-contain rounded-md bg-white p-0.5 shadow-2xs"
            />
            <div className="text-left">
              <p className="font-bold text-foreground">Install I.A Dewealth App</p>
              <p className="text-[11px] text-muted-foreground">
                Faster shopping, instant notifications & offline access
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-dark active:scale-95 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Dismiss app install banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleClick}
          title="Install I.A Dewealth App on your device"
          className={`inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-dark transition hover:bg-primary hover:text-white active:scale-95 cursor-pointer shrink-0 ${className}`}
        >
          <img src={brandLogo} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
          <Download className="h-3.5 w-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* Guided Install Sheet Modal for iOS, Android, and Desktop */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-xs sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <img
                  src={brandLogo}
                  alt="I.A Dewealth"
                  className="h-9 w-9 shrink-0 object-contain rounded-xl bg-white p-1 border border-border/80 shadow-2xs"
                />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Install I.A Dewealth App</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Direct access right from your home screen or desktop
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted cursor-pointer"
                aria-label="Close install guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="my-4 space-y-3.5 text-xs text-foreground">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-dark font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Tap the Share button</p>
                    <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                      Located in Safari's bottom toolbar (
                      <Share className="inline h-3.5 w-3.5 text-blue-500" /> icon).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-dark font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Tap "Add to Home Screen"</p>
                    <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                      Scroll down and select{" "}
                      <PlusSquare className="inline h-3.5 w-3.5 text-foreground" />{" "}
                      <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-4 space-y-3.5 text-xs text-foreground">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-dark font-bold">
                    <Smartphone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold">On Mobile / Chrome / Android</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Tap the browser menu (<strong>⋮</strong>) in the top right, then select{" "}
                      <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-dark font-bold">
                    <Monitor className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold">On Laptop / Desktop (Chrome/Edge)</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Look for the <Download className="inline h-3 w-3 text-primary" />{" "}
                      <strong>Install</strong> icon on the right side of your browser URL bar, or
                      choose <strong>Menu → Install I.A Dewealth</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-primary-dark active:scale-95 cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
