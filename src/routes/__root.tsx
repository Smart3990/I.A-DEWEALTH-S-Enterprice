import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { StoreProvider } from "@/components/store";
import { CategoryProvider } from "@/data/category-store";
import { SiteProvider } from "@/data/site";
import { storefrontQuery, defaultSettings } from "@/data/storefront";
import { applyCatalogSnapshot, categories as bundledCategories } from "@/data/catalog";
import { setWhatsappNumber } from "@/data/products";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/DeliveryAndFooter";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CartDrawer } from "@/components/CartDrawer";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { PWAInstallModal } from "@/components/pwa/PWAInstallModal";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { recordPageView } from "@/data/analytics-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const handleReset = () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    router.invalidate();
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            onClick={() => {
              window.location.href = "/";
            }}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
      },
      { name: "theme-color", content: "#00a884" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "I.A Dewealth" },
      { name: "application-name", content: "I.A Dewealth" },
      { title: "I.A Dewealth's Enterprise - Direct-Import Tech & Appliances in Ghana" },
      {
        name: "description",
        content:
          "Direct-import authentic technology, smart electronics, home appliances, and lifestyle accessories in Ghana with same-day Accra delivery and direct WhatsApp checkout.",
      },
      { name: "author", content: "I.A Dewealth's Enterprise" },
      {
        property: "og:title",
        content: "I.A Dewealth's Enterprise - Direct-Import Tech & Appliances in Ghana",
      },
      {
        property: "og:description",
        content:
          "Direct-import authentic technology, smart electronics, home appliances, and lifestyle accessories in Ghana with same-day Accra delivery and direct WhatsApp checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),
  loader: async ({ context }) => {
    try {
      const data = await context.queryClient.ensureQueryData(storefrontQuery);
      if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
        applyCatalogSnapshot(data?.categories || [], data.products);
      }
      return { storefront: data ?? null };
    } catch (err) {
      console.warn("[Root loader] Storefront query fallback:", err);
      // storefront falls back to the bundled catalogue
      return { storefront: null };
    }
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StorefrontShell />
    </QueryClientProvider>
  );
}

function StorefrontShell() {
  const loaderData = Route.useLoaderData();
  const qc = useQueryClient();
  const { data } = useQuery({
    ...storefrontQuery,
    initialData: loaderData?.storefront ?? undefined,
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const handleProductsUpdated = () => {
      qc.invalidateQueries({ queryKey: ["storefront"] });
    };
    window.addEventListener("ia_products_updated", handleProductsUpdated);
    return () => window.removeEventListener("ia_products_updated", handleProductsUpdated);
  }, [qc]);

  useEffect(() => {
    if (!isAdmin && typeof window !== "undefined") {
      recordPageView(pathname);
    }
  }, [pathname, isAdmin]);

  const site = useMemo(
    () => ({
      settings: data?.settings ?? defaultSettings,
      sections: data?.sections ?? [],
      banners: data?.banners ?? [],
      nav: data?.nav ?? [],
    }),
    [data],
  );

  useEffect(() => {
    if (data?.settings?.whatsappNumber) {
      setWhatsappNumber(data.settings.whatsappNumber);
    }
    if (data?.products?.length) {
      applyCatalogSnapshot(data?.categories || [], data.products);
    }
  }, [data]);

  if (isAdmin) {
    return (
      <SiteProvider value={site}>
        <Outlet />
      </SiteProvider>
    );
  }

  return (
    <SiteProvider value={site}>
      <CategoryProvider categories={data?.categories?.length ? data.categories : bundledCategories}>
        <StoreProvider>
          <div className="min-h-screen bg-surface font-body text-foreground pb-16 md:pb-0">
            <SiteHeader />
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
            <SiteFooter />
            <MobileBottomNav />
            <CartDrawer />
            <OfflineIndicator />
            <PWAInstallModal />
          </div>
        </StoreProvider>
      </CategoryProvider>
    </SiteProvider>
  );
}
