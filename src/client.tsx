import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );

  // Register PWA Service Worker for offline capabilities with automatic update checks
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    // If on admin route or visiting from another device, clean out stale legacy caches
    if ("caches" in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          if (name.includes("ia-dewealth-pwa-v1") || name.includes("ia-dewealth-pwa-v2")) {
            caches.delete(name);
          }
        }
      });
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Immediately check for updates so other devices receive newest bundle
          registration.update().catch(() => {});
          registration.addEventListener("updatefound", () => {
            const installing = registration.installing;
            if (installing) {
              installing.addEventListener("statechange", () => {
                if (installing.state === "installed" && navigator.serviceWorker.controller) {
                  installing.postMessage({ type: "SKIP_WAITING" });
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    });
  }
});
