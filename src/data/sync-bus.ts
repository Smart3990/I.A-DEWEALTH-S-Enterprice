/**
 * Cross-tab & intra-window synchronization bus for I.A Dewealth's Enterprise.
 * Guarantees that all settings, products, categories, news tickers, reviews,
 * and hub configurations reflect INSTANTLY without delay or need for manual page refresh.
 */

export const SYNC_CHANNEL_NAME = "ia_dewealth_sync_bus_v1";

export type SyncEventType =
  | "ia_site_settings_updated"
  | "ia_superdeals_timer_updated"
  | "ia_categories_updated"
  | "ia_products_updated"
  | "ia_news_ticker_updated"
  | "ia_reviews_updated"
  | "ia_site_config_updated"
  | "ia_global_sync";

interface SyncMessage {
  type: SyncEventType;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  payload?: any;
  timestamp: number;
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

/**
 * Dispatches an event locally to the current window AND broadcasts it across all other
 * open tabs/windows via BroadcastChannel and a fallback localStorage ping.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function broadcastSync(type: SyncEventType, payload?: any): void {
  if (typeof window === "undefined") return;

  const message: SyncMessage = {
    type,
    payload,
    timestamp: Date.now(),
  };

  // 1. Dispatch DOM event in the current window immediately
  try {
    window.dispatchEvent(new CustomEvent(type, { detail: payload }));
    window.dispatchEvent(new Event(type));
  } catch (e) {
    console.error("Local sync dispatch error:", e);
  }

  // 2. Broadcast to all other browser tabs/windows
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (e) {
      console.warn("BroadcastChannel postMessage notice:", e);
    }
  }

  // 3. Fallback ping via localStorage storage event
  try {
    localStorage.setItem("ia_last_sync_ping", JSON.stringify(message));
  } catch {
    // ignore
  }
}

/**
 * Subscribes to a sync event both in the current window and from any other open tab.
 * Returns an unsubscribe cleanup function.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function onSync(type: SyncEventType | SyncEventType[], handler: (payload?: any) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const types = Array.isArray(type) ? type : [type];
  const typeSet = new Set(types);

  // 1. Window DOM event listener
  const domListener = (e: Event) => {
    const custom = e as CustomEvent;
    handler(custom?.detail);
  };
  types.forEach((t) => window.addEventListener(t, domListener));

  // 2. BroadcastChannel message listener
  const channelListener = (e: MessageEvent<SyncMessage>) => {
    if (e.data && (typeSet.has(e.data.type) || e.data.type === "ia_global_sync")) {
      handler(e.data.payload);
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", channelListener);
  }

  // 3. localStorage storage event listener (cross-tab fallback)
  const storageListener = (e: StorageEvent) => {
    if (e.key === "ia_last_sync_ping" && e.newValue) {
      try {
        const msg: SyncMessage = JSON.parse(e.newValue);
        if (msg && (typeSet.has(msg.type) || msg.type === "ia_global_sync")) {
          handler(msg.payload);
        }
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener("storage", storageListener);

  return () => {
    types.forEach((t) => window.removeEventListener(t, domListener));
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", channelListener);
    }
    window.removeEventListener("storage", storageListener);
  };
}
