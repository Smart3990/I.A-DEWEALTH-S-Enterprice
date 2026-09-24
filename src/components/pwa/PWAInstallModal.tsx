import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare, Smartphone, Check } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useSite } from "@/data/site";
import { useCurrentSiteSettings } from "@/data/site-settings-store";

export function PWAInstallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const { settings: siteSettings } = useSite();
  const [storedSettings] = useCurrentSiteSettings();

  const storeName =
    storedSettings?.store_name ||
    storedSettings?.storeName ||
    siteSettings?.store_name ||
    siteSettings?.storeName ||
    "I.A Dewealth";

  // Initial detection and auto-open after page load
  useEffect(() => {
    setMounted(true);

    // Check if user previously dismissed in this session
    const isDismissed = sessionStorage.getItem("pwa_install_modal_dismissed");

    // If already installed or already dismissed, do not auto open
    if (isInstalled || isDismissed === "true") {
      return;
    }

    // Friendly 1.2s delay so page renders smoothly and beforeinstallprompt has fired
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  // Global event listener so any button/link can trigger the modal on demand
  useEffect(() => {
    const handleOpenRequest = () => {
      setShowIOSSteps(false);
      setIsOpen(true);
    };

    window.addEventListener("open-pwa-install", handleOpenRequest);
    return () => {
      window.removeEventListener("open-pwa-install", handleOpenRequest);
    };
  }, []);

  if (!mounted || !isOpen || isInstalled) {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_install_modal_dismissed", "true");
    setIsOpen(false);
    setShowIOSSteps(false);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // On iOS Safari, programmatic install isn't supported by WebKit, show direct 2-tap guide
      setShowIOSSteps(true);
      return;
    }

    // On Android, Windows, Mac, Chrome, Edge: 1-click install via beforeinstallprompt
    const success = await install();
    if (success) {
      handleDismiss();
    } else {
      // Fallback if browser blocked prompt or requires manual menu action
      setShowIOSSteps(true);
    }
  };

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
    >
      <div
        id="pwa-install-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        className="relative w-full max-w-[390px] sm:max-w-[420px] rounded-2xl bg-white dark:bg-card text-card-foreground shadow-2xl border border-border/80 p-5 sm:p-6 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="pwa-install-close-btn"
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4 stroke-[2.2]" />
        </button>

        {!showIOSSteps ? (
          <div>
            {/* Top row: App Icon + Titles */}
            <div className="flex items-start gap-3.5 sm:gap-4 pr-6">
              {/* App Icon Square as seen in image two */}
              <div
                id="pwa-install-app-icon"
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#00875A] flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-sm select-none"
              >
                K
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h3
                  id="pwa-install-title"
                  className="text-base sm:text-[17px] font-bold text-foreground leading-snug tracking-tight"
                >
                  Install {storeName}
                </h3>
                <p className="text-xs sm:text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  Add to your home screen for faster access, offline support, and a native app feel.
                </p>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center gap-3 mt-6">
              <button
                id="pwa-install-not-now-btn"
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-muted/20 text-gray-800 dark:text-gray-100 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-muted/40 transition active:scale-[0.98] cursor-pointer text-center"
              >
                Not now
              </button>

              <button
                id="pwa-install-confirm-btn"
                type="button"
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-5 rounded-xl bg-[#00875A] hover:bg-[#00744e] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer text-center"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Install</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* iOS or Manual Step-by-Step Guide */}
            <div className="flex items-center gap-3 pb-3 border-b border-border/80 pr-6">
              <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white font-bold text-lg shrink-0">
                K
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {isIOS ? "Install on iPhone / iPad" : "Add to Home Screen"}
                </h4>
                <p className="text-xs text-muted-foreground">Follow these quick steps</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-[13px] text-foreground">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <div className="p-1 rounded-md bg-[#00875A]/15 text-[#00875A] shrink-0 mt-0.5">
                      <Share className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">1. Tap Share</p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs mt-0.5">
                        Tap the <strong>Share</strong> icon in your Safari navigation bar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                    <div className="p-1 rounded-md bg-[#00875A]/15 text-[#00875A] shrink-0 mt-0.5">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">2. Add to Home Screen</p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs mt-0.5">
                        Scroll down and tap <strong>Add to Home Screen</strong>, then tap{" "}
                        <strong>Add</strong>.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="font-semibold text-foreground">Complete installation in browser</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Tap the browser menu <strong>(⋮)</strong> and tap <strong>Install App</strong>{" "}
                    or <strong>Add to Home screen</strong>.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                id="pwa-install-got-it-btn"
                type="button"
                onClick={handleDismiss}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00875A] hover:bg-[#00744e] text-white font-semibold text-sm transition active:scale-[0.98] cursor-pointer text-center"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
