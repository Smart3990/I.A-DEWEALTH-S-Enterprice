import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Home,
  Image as ImageIcon,
  MessageSquare,
  Images,
  Menu as MenuIcon,
  X as XIcon,
  Settings as SettingsIcon,
  Users,
  History,
  LogOut,
  Star,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  Megaphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/lib/admin-auth";
import { getPendingReviews } from "@/data/reviews-store";
import { canAccessModule } from "@/data/permissions-store";
import brandLogo from "@/assets/ia-dewealth-logo.png";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin | I.A Dewealth's Enterprise" },
      { name: "description", content: "Manage products, content and inquiries." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  superOnly?: boolean;
  exact?: boolean;
  badgeKey?: "products" | "categories" | "inquiries";
  permissionModule?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Store Operations",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      {
        to: "/admin/products",
        label: "Products",
        icon: Package,
        badgeKey: "products",
        permissionModule: "products",
      },
      {
        to: "/admin/categories",
        label: "Categories",
        icon: FolderTree,
        badgeKey: "categories",
        permissionModule: "categories",
      },
      {
        to: "/admin/inquiries",
        label: "Inquiries",
        icon: MessageSquare,
        badgeKey: "inquiries",
        permissionModule: "inquiries",
      },
      {
        to: "/admin/reviews",
        label: "Customer Reviews",
        icon: Star,
        badgeKey: "reviews",
        permissionModule: "reviews",
      },
    ],
  },
  {
    title: "Merchandising & Content",
    items: [
      {
        to: "/admin/news",
        label: "News",
        icon: Megaphone,
        permissionModule: "news",
      },
      {
        to: "/admin/banners",
        label: "Banners & Promos",
        icon: ImageIcon,
        permissionModule: "banners",
      },
      { to: "/admin/media", label: "Media Library", icon: Images, permissionModule: "media" },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/admin/permissions", label: "Admin Permissions", icon: ShieldCheck, superOnly: true },
      {
        to: "/admin/settings",
        label: "Store Settings",
        icon: SettingsIcon,
        permissionModule: "settings",
      },
      { to: "/admin/administrators", label: "Administrators", icon: Users, superOnly: true },
      {
        to: "/admin/activity",
        label: "Activity Log",
        icon: History,
        superOnly: true,
        permissionModule: "activity",
      },
    ],
  },
];

function AdminNavList({
  role,
  counts,
  onItemClick,
}: {
  role: string;
  counts?: { products?: number; categories?: number; inquiries?: number; reviews?: number };
  onItemClick?: () => void;
}) {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto pr-1">
      {navGroups.map((group) => {
        const visibleItems = group.items.filter((item) => {
          if (role === "super_admin") return true;
          if (item.superOnly) return false;
          if (item.permissionModule) {
            return canAccessModule(role, item.permissionModule);
          }
          return true;
        });
        if (!visibleItems.length) return null;

        return (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
              {group.title}
            </p>
            <div className="space-y-1">
              {visibleItems.map((l) => {
                const count = l.badgeKey && counts ? counts[l.badgeKey] : undefined;

                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={onItemClick}
                    activeOptions={{ exact: Boolean(l.exact) }}
                    activeProps={{
                      className: "bg-[#00a884] text-white font-bold shadow-sm shadow-[#00a884]/25",
                    }}
                    className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <l.icon className="h-4 w-4 shrink-0 transition group-hover:scale-105" />
                      <span>{l.label}</span>
                    </div>
                    {typeof count === "number" && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 group-hover:bg-white group-hover:text-slate-800">
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminLayout() {
  const { loading, role, email } = useAdminSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Quick live badge counts
  const { data: counts } = useQuery({
    queryKey: ["admin", "sidebar-counts"],
    queryFn: async () => {
      const [prods, cats, inqRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        fetch("/api/inquiries")
          .then((r) => r.json())
          .then((d) => (Array.isArray(d?.inquiries) ? d.inquiries.length : 0))
          .catch(() => 0),
      ]);
      const pendingReviews = getPendingReviews().length;
      return {
        products: prods.count ?? 0,
        categories: cats.count ?? 0,
        inquiries: typeof inqRes === "number" ? inqRes : 0,
        reviews: pendingReviews,
      };
    },
    staleTime: 10_000,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00a884] border-t-transparent" />
          <span className="font-semibold text-slate-700">Loading admin console…</span>
        </div>
      </div>
    );
  }

  if (!role) return <AdminLogin />;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased bg-[radial-gradient(#cbd5e1_1.25px,transparent_1.25px)] [background-size:20px_20px]">
      {/* Top Professional Command Header */}
      <header className="sticky top-0 z-40 bg-white shadow-xs border-0">
        <div className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Mobile Hamburger Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition md:hidden"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <Link to="/admin" className="flex items-center gap-2 sm:gap-2.5">
              <img
                src={brandLogo}
                alt="I.A Dewealth's Enterprise"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-[12.5px] sm:text-[13.5px] font-extrabold tracking-tight text-slate-900 leading-tight">
                  I.A DEWEALTH<span className="text-[#00a884]">'S</span>
                </span>
                <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-widest text-slate-400 leading-tight">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 bg-transparent border-0 p-0 text-xs font-bold text-[#ea580c] transition hover:text-[#c2410c] shadow-none"
            >
              <span>Shop View</span>
              <span className="text-[#ea580c]">↗</span>
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{email}</p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00a884]">
                  {role === "super_admin" ? "Superadmin" : "Administrator"}
                </span>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 sm:px-3.5 text-xs font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600 border-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Modal */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col justify-between bg-white p-5 shadow-2xl z-10 overflow-y-auto">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <img src={brandLogo} alt="Logo" className="h-7 w-7 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold tracking-tight text-slate-900">
                      I.A DEWEALTH'S
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#00a884]">
                      {role === "super_admin" ? "Superadmin" : "Admin"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                  aria-label="Close menu"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <AdminNavList
                role={role}
                counts={counts}
                onItemClick={() => setMobileNavOpen(false)}
              />
            </div>

            <div className="mt-4 shrink-0 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Admin Console</span>
              <span>
                Powered by{" "}
                <a
                  href="https://kiyuhub.netlify.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#00a884] hover:underline"
                >
                  Kiyuhub
                </a>
              </span>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex w-full flex-col gap-4 sm:gap-6 px-3.5 py-4 sm:px-6 lg:px-8 md:flex-row min-h-[calc(100vh-65px)]">
        {/* Desktop Sticky Sidebar Navigation */}
        <aside className="hidden md:block w-68 lg:w-72 md:shrink-0 md:sticky md:top-20 md:self-start md:h-[calc(100vh-6.5rem)]">
          <nav className="flex h-full flex-col justify-between rounded-2xl bg-white p-5 shadow-xs border-0 overflow-hidden">
            <AdminNavList role={role} counts={counts} />

            <div className="mt-4 shrink-0 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Admin Console</span>
              <span>
                Powered by{" "}
                <a
                  href="https://kiyuhub.netlify.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#00a884] hover:underline"
                >
                  Kiyuhub
                </a>
              </span>
            </div>
          </nav>
        </aside>

        {/* Content Outlet */}
        <main className="min-w-0 flex-1">
          {/* Mobile Quick Navigation Pill Bar */}
          <div className="md:hidden -mt-1 mb-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <Link
              to="/admin"
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-[#00a884] text-white border-[#00a884] shadow-xs" }}
              className="rounded-xl bg-white px-3 py-1.5 text-slate-700 border border-slate-200 shrink-0 transition"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/products"
              activeProps={{ className: "bg-[#00a884] text-white border-[#00a884] shadow-xs" }}
              className="rounded-xl bg-white px-3 py-1.5 text-slate-700 border border-slate-200 shrink-0 transition"
            >
              Products {typeof counts?.products === "number" ? `(${counts.products})` : ""}
            </Link>
            <Link
              to="/admin/inquiries"
              activeProps={{ className: "bg-[#00a884] text-white border-[#00a884] shadow-xs" }}
              className="rounded-xl bg-white px-3 py-1.5 text-slate-700 border border-slate-200 shrink-0 transition"
            >
              Inquiries {typeof counts?.inquiries === "number" ? `(${counts.inquiries})` : ""}
            </Link>
            <Link
              to="/admin/categories"
              activeProps={{ className: "bg-[#00a884] text-white border-[#00a884] shadow-xs" }}
              className="rounded-xl bg-white px-3 py-1.5 text-slate-700 border border-slate-200 shrink-0 transition"
            >
              Categories
            </Link>
            <Link
              to="/admin/reviews"
              activeProps={{ className: "bg-[#00a884] text-white border-[#00a884] shadow-xs" }}
              className="rounded-xl bg-white px-3 py-1.5 text-slate-700 border border-slate-200 shrink-0 transition"
            >
              Reviews{" "}
              {typeof counts?.reviews === "number" && counts.reviews > 0
                ? `(${counts.reviews})`
                : ""}
            </Link>
            <Link
              to="/admin/settings"
              activeProps={{ className: "bg-[#00a884] text-white border-[#00a884] shadow-xs" }}
              className="rounded-xl bg-white px-3 py-1.5 text-slate-700 border border-slate-200 shrink-0 transition"
            >
              Settings
            </Link>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminLogin() {
  const qc = useQueryClient();

  // Empty login credentials state (never pre-filled across browsers)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function performSignIn(userEmail: string, userPass: string) {
    setBusy(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail.trim(),
      password: userPass,
    });

    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      setBusy(false);
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    if (!roles?.length) {
      await supabase.auth.signOut();
      setError("This account does not have administrator privileges.");
      setBusy(false);
      return;
    }

    await qc.invalidateQueries();
    setBusy(false);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    await performSignIn(email, password);
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 antialiased selection:bg-[#00a884]/20">
      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center rounded-[24px] bg-white px-8 py-9 shadow-lg border-0 sm:px-10 sm:py-10">
        {/* Brand Emblem & Header */}
        <div className="flex flex-col items-center">
          <img
            src={brandLogo}
            alt="I.A Dewealth's Enterprise"
            className="h-16 w-16 object-contain drop-shadow-sm"
          />
          <div className="mt-3 text-center">
            <span className="text-[17px] font-extrabold tracking-tight text-slate-800">
              I.A DEWEALTH<span className="text-[#00a884]">'S</span>
            </span>
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Enterprise
            </div>
          </div>
          <p className="mt-3 text-[13.5px] font-medium text-slate-500">Admin dashboard</p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-5 flex w-full items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSignIn} className="mt-6 w-full space-y-4">
          <div>
            <label className="mb-2 block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@iadewealth.com"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/15"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                PASSWORD
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#00a884] text-[15px] font-semibold text-white shadow-sm shadow-[#00a884]/25 transition hover:bg-[#009676] active:bg-[#008266] disabled:opacity-70"
          >
            {busy ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Accessing Dashboard…</span>
              </div>
            ) : (
              "Access Dashboard"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Powered by{" "}
          <a
            href="https://kiyuhub.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[#00a884] hover:underline"
          >
            Kiyuhub
          </a>
        </div>
      </div>
    </div>
  );
}
