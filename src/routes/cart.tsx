import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { WHATSAPP } from "@/data/products";
import { PageBody } from "@/components/catalog/CategoryShell";
import { cedi, useStore } from "@/components/store";
import { useSite, whatsappLink } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import { addInquiry } from "@/data/inquiries-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "My Cart | I.A Dewealth's Enterprise" },
      {
        name: "description",
        content:
          "Review every product in your cart and check out on WhatsApp with I.A Dewealth's Enterprise.",
      },
      { property: "og:title", content: "My Cart | I.A Dewealth's Enterprise" },
      {
        property: "og:description",
        content: "Review every product in your cart and check out on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, setQty, removeLine, total, count } = useStore();
  const { settings } = useSite();

  const orderText = cart.length
    ? `Hello IA DEWEALTH, I want to order:\n${cart
        .map((l) => `• ${l.name} x${l.qty}: GHC ${(l.price * l.qty).toLocaleString()}`)
        .join("\n")}\nTotal: GHC ${total.toLocaleString()}`
    : "";

  return (
    <div className="bg-surface">
      <PageBody>
        <h1 className="font-sans text-2xl font-black tracking-tight lg:text-3xl">My Cart</h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {count > 0
            ? `${count} ${count === 1 ? "item" : "items"} ready for checkout.`
            : "Your cart is currently empty."}
        </p>

        {cart.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <ShoppingCart className="h-10 w-10 text-border" strokeWidth={1.75} />
            <h2 className="mt-4 text-lg font-extrabold tracking-tight">Your cart is empty</h2>
            <p className="mt-1 max-w-sm font-body text-sm text-muted-foreground">
              Add products to your cart and they will show up here.
            </p>
            <Link
              to="/"
              className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-dark"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {cart.map((line) => (
                <li key={line.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3.5 sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {line.image ? (
                      <img
                        src={line.image}
                        alt=""
                        loading="lazy"
                        className="h-16 w-16 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-secondary object-cover object-center"
                      />
                    ) : (
                      <div className="h-16 w-16 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-secondary" />
                    )}
                    <div className="min-w-0 flex-1 sm:hidden">
                      <Link
                        to="/product/$id"
                        params={{ id: line.id }}
                        className="text-xs sm:text-sm font-bold leading-snug hover:text-primary line-clamp-2"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-0.5 font-body text-[11px] text-muted-foreground">
                        {cedi(line.price)} each
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div className="hidden sm:block">
                      <Link
                        to="/product/$id"
                        params={{ id: line.id }}
                        className="text-sm font-bold leading-snug hover:text-primary"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 font-body text-xs text-muted-foreground">
                        {cedi(line.price)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1 sm:mt-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          aria-label={`Decrease ${line.name}`}
                          onClick={() => setQty(line.id, line.qty - 1)}
                          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-border transition hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                        <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-bold">
                          {line.qty}
                        </span>
                        <button
                          aria-label={`Increase ${line.name}`}
                          onClick={() => setQty(line.id, line.qty + 1)}
                          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-border transition hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                        <button
                          aria-label={`Remove ${line.name}`}
                          onClick={() => removeLine(line.id)}
                          className="ml-1 sm:ml-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] sm:text-xs font-semibold text-muted-foreground transition hover:text-deal"
                        >
                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Remove
                        </button>
                      </div>

                      <div className="text-right text-xs sm:text-sm font-extrabold text-primary-dark">
                        {cedi(line.price * line.qty)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
                Order summary
              </h2>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="font-body text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-extrabold">{cedi(total)}</span>
              </div>
              <a
                href={whatsappLink(settings.whatsappNumber || WHATSAPP, orderText)}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  try {
                    addInquiry({
                      name: "WhatsApp Order Inquiry",
                      phone: settings.whatsappNumber || WHATSAPP,
                      subject: `Order Checkout (${cart.length} ${cart.length === 1 ? "item" : "items"})`,
                      message: orderText,
                    });
                  } catch {
                    // silent fallback
                  }
                  void supabase.from("inquiries").insert({
                    item_count: cart.reduce((sum, i) => sum + i.qty, 0),
                    items: cart.map((i) => ({
                      id: i.id,
                      name: i.name,
                      qty: i.qty,
                      price: i.price,
                    })),
                    note: orderText,
                    status: "new",
                    total,
                  });
                }}
                className="mt-5 flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-dark"
              >
                Checkout on WhatsApp
              </a>

              <p className="mt-3 text-center font-body text-xs text-muted-foreground">
                We confirm stock, delivery and payment on WhatsApp.
              </p>
              <Link
                to="/"
                className="mt-4 block text-center text-xs font-bold text-primary hover:underline"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </PageBody>
    </div>
  );
}
