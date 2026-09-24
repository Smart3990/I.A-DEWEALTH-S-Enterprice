import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [mounted, setMounted] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md md:bottom-6 md:left-6 md:right-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-3 rounded-xl bg-slate-900/95 px-4 py-3 text-xs font-medium text-white shadow-2xl backdrop-blur-md border border-slate-800">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
          <WifiOff className="h-4 w-4 animate-pulse" />
        </span>
        <div className="flex-1 leading-tight">
          <p className="font-semibold text-white">Offline Mode Active</p>
          <p className="text-[11px] text-slate-400">
            Viewing cached catalog and saved products. Reconnecting automatically...
          </p>
        </div>
      </div>
    </div>
  );
}
