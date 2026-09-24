export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
}

export interface OrderShippingAddress {
  address: string;
  city: string;
  region: string;
  landmark?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderVerificationStatus =
  | "unverified" // Customer submitted order via WhatsApp/checkout; awaiting phone/WhatsApp call to prevent fake orders
  | "verified" // Customer confirmed physical address and availability for delivery
  | "dispatched" // Handed over to dispatch rider in Accra or booked on intercity bus waybill
  | "delivered_unpaid" // Rider is at customer doorstep waiting for MoMo or Cash payment
  | "paid_completed" // Payment confirmed received; transaction closed
  | "cancelled"; // Fake order, customer unreachable, or cancelled

export type PaymentStatus =
  | "pending_delivery" // Pay-on-Delivery (MoMo or Cash upon parcel arrival)
  | "momo_received" // Confirmed Mobile Money transaction
  | "cash_collected" // Physical cash collected by dispatch rider
  | "prepaid"; // Already paid prior to dispatch

export interface StoreOrder {
  id: string;
  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "delivered" | "completed" | "cancelled";
  verificationStatus: OrderVerificationStatus;
  paymentMethod:
    "MoMo on Delivery" | "Cash on Delivery" | "Mobile Money" | "Cash on Delivery" | "Bank Transfer";
  paymentStatus: PaymentStatus;
  dispatchNote?: string;
  verificationNote?: string;
  createdAt: string;
}

const STORAGE_KEY = "ia_admin_orders";
const EVENT_KEY = "ia_orders_updated";

const INITIAL_ORDERS: StoreOrder[] = [
  // Queue 1: UNVERIFIED INFLOW (Action Required: Contact Customer)
  {
    id: "ord-904101",
    customer: {
      name: "Kwame Asare",
      phone: "+233 24 551 8920",
      email: "kwame.asare88@gmail.com",
    },
    shippingAddress: {
      address: "Blohum Street, Dzorwulu",
      city: "Accra",
      region: "Greater Accra",
      landmark: "Near Perez Chapel / Dzorwulu Traffic Light",
    },
    items: [
      { id: "ph1", name: "Nova X9 Pro 5G 256GB Smartphone", price: 4290, quantity: 1 },
      { id: "ch1", name: "GaN 100W Fast Wall Charger", price: 340, quantity: 1 },
    ],
    total: 4630,
    status: "pending",
    verificationStatus: "unverified",
    paymentMethod: "MoMo on Delivery",
    paymentStatus: "pending_delivery",
    verificationNote: "Awaiting phone verification call or WhatsApp message before rider dispatch.",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-904102",
    customer: {
      name: "Serwaa Bonsu",
      phone: "+233 50 119 4432",
      email: "serwaa.b@yahoo.com",
    },
    shippingAddress: {
      address: "Adjiringanor Road, East Legon",
      city: "Accra",
      region: "Greater Accra",
      landmark: "Opposite Galaxy International School",
    },
    items: [
      { id: "au1", name: "Active Noise Cancelling Earbuds Pro", price: 580, quantity: 1 },
      { id: "w1", name: "Titanium Smartwatch Pro Ultra", price: 1450, quantity: 1 },
    ],
    total: 2030,
    status: "pending",
    verificationStatus: "unverified",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "pending_delivery",
    verificationNote: "Customer requested 2:00 PM delivery window. Call to confirm availability.",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },

  // Queue 2: VERIFIED & DISPATCHED
  {
    id: "ord-904098",
    customer: {
      name: "Kofi Owusu-Ansah",
      phone: "+233 55 332 8812",
      email: "kofi.owusu@gmail.com",
    },
    shippingAddress: {
      address: "Ahodwo Roundabout",
      city: "Kumasi",
      region: "Ashanti Region",
      landmark: "VIP Bus Terminal Waybill Dispatch",
    },
    items: [
      { id: "lp1", name: "Ultraslim Pro Laptop Core i7 16GB", price: 6850, quantity: 1 },
      { id: "dk1", name: "10-in-1 Thunderbolt Docking Station", price: 1850, quantity: 1 },
    ],
    total: 8700,
    status: "processing",
    verificationStatus: "dispatched",
    paymentMethod: "MoMo on Delivery",
    paymentStatus: "pending_delivery",
    dispatchNote: "VIP Bus Terminal Waybill #VIP-ACC-KMS-4410 • Driver: Uncle Joe (0244123456)",
    verificationNote:
      "Customer called & verified. Promised to pay driver upon collection at Ahodwo VIP parcel office.",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "ord-904095",
    customer: {
      name: "Abena Osei-Tutu",
      phone: "+233 50 432 9876",
      email: "abena.osei@yahoo.com",
    },
    shippingAddress: {
      address: "Senchi Street, Airport Residential Area",
      city: "Accra",
      region: "Greater Accra",
      landmark: "Near Association International School",
    },
    items: [{ id: "k1", name: "Digital Touch Air Fryer 6L Dual Zone", price: 1650, quantity: 1 }],
    total: 1650,
    status: "processing",
    verificationStatus: "dispatched",
    paymentMethod: "MoMo on Delivery",
    paymentStatus: "pending_delivery",
    dispatchNote: "Assigned to Accra Express Rider: Mensah (Motorbike GH-7741-23) • Ph: 0558112233",
    verificationNote: "Verified by admin at 10:15 AM. Address confirmed.",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },

  // Queue 3: DELIVERED / PAYMENT COLLECTION PENDING
  {
    id: "ord-904091",
    customer: {
      name: "Nana Ama Darko",
      phone: "+233 27 654 3210",
      email: "nana.darko@outlook.com",
    },
    shippingAddress: {
      address: "Spintex Road, Baatsona",
      city: "Accra",
      region: "Greater Accra",
      landmark: "Near ICGC Calvary Temple",
    },
    items: [
      { id: "au2", name: "True Wireless Neo Earbuds Bass+", price: 340, quantity: 2 },
      { id: "ch2", name: "Kevlar Braided 100W Type-C Cable 2M", price: 120, quantity: 1 },
    ],
    total: 800,
    status: "delivered",
    verificationStatus: "delivered_unpaid",
    paymentMethod: "MoMo on Delivery",
    paymentStatus: "pending_delivery",
    dispatchNote: "Rider at customer premises. Customer inspecting sealed earbuds package.",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },

  // Queue 4: PAID & COMPLETED
  {
    id: "ord-904085",
    customer: {
      name: "Emmanuel Sarpong",
      phone: "+233 20 876 5432",
      email: "sarpong.tech@gmail.com",
    },
    shippingAddress: {
      address: "Takoradi Harbour Road",
      city: "Takoradi",
      region: "Western Region",
      landmark: "Opposite GPHA Clinic",
    },
    items: [
      { id: "sp1", name: "Waterproof Outdoor Bluetooth Speaker 40W", price: 790, quantity: 1 },
    ],
    total: 790,
    status: "completed",
    verificationStatus: "paid_completed",
    paymentMethod: "MoMo on Delivery",
    paymentStatus: "momo_received",
    dispatchNote: "STC Bus Parcel Waybill #STC-TKD-8812 • Received & signed by customer.",
    verificationNote: "MoMo transaction ID: TXN-2948190284 recorded and confirmed in account.",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ord-904080",
    customer: {
      name: "Dennis Mensah",
      phone: "+233 24 330 9981",
      email: "dennis.m@gmail.com",
    },
    shippingAddress: {
      address: "Ring Road Central, Kwame Nkrumah Circle",
      city: "Accra",
      region: "Greater Accra",
      landmark: "Walk-in pickup at Tip Toe Lane Shop",
    },
    items: [{ id: "ph2", name: "Nova A5 Lite 128GB Smartphone", price: 1890, quantity: 1 }],
    total: 1890,
    status: "completed",
    verificationStatus: "paid_completed",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "cash_collected",
    dispatchNote: "Direct shop pickup at Circle Hub. Customer paid cash on spot.",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

export function getAllOrders(): StoreOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ORDERS;
  } catch (e) {
    console.error("Failed to read orders from storage:", e);
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: StoreOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to save orders to storage:", e);
  }
}

export function updateOrderStatus(id: string, status: StoreOrder["status"]): void {
  const current = getAllOrders();
  const updated = current.map((o) => (o.id === id ? { ...o, status } : o));
  saveOrders(updated);
}

export function verifyOrder(id: string, note?: string): void {
  const current = getAllOrders();
  const updated = current.map((o) =>
    o.id === id
      ? {
          ...o,
          verificationStatus: "verified" as OrderVerificationStatus,
          status: "processing" as const,
          verificationNote:
            note ||
            `Verified via phone call/WhatsApp on ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        }
      : o,
  );
  saveOrders(updated);
}

export function dispatchOrder(id: string, dispatchNote: string): void {
  const current = getAllOrders();
  const updated = current.map((o) =>
    o.id === id
      ? {
          ...o,
          verificationStatus: "dispatched" as OrderVerificationStatus,
          status: "processing" as const,
          dispatchNote: dispatchNote || "Rider assigned and en route with package.",
        }
      : o,
  );
  saveOrders(updated);
}

export function markOrderDelivered(id: string): void {
  const current = getAllOrders();
  const updated = current.map((o) =>
    o.id === id
      ? {
          ...o,
          verificationStatus: "delivered_unpaid" as OrderVerificationStatus,
          status: "delivered" as const,
        }
      : o,
  );
  saveOrders(updated);
}

export function markOrderPaid(
  id: string,
  paymentMethod: "MoMo on Delivery" | "Cash on Delivery" | "Mobile Money" = "MoMo on Delivery",
  note?: string,
): void {
  const current = getAllOrders();
  const updated = current.map((o) =>
    o.id === id
      ? {
          ...o,
          verificationStatus: "paid_completed" as OrderVerificationStatus,
          status: "completed" as const,
          paymentStatus: (paymentMethod.includes("Cash")
            ? "cash_collected"
            : "momo_received") as PaymentStatus,
          verificationNote: note || `${paymentMethod} received and confirmed in merchant account.`,
        }
      : o,
  );
  saveOrders(updated);
}

export function cancelOrder(id: string, reason?: string): void {
  const current = getAllOrders();
  const updated = current.map((o) =>
    o.id === id
      ? {
          ...o,
          verificationStatus: "cancelled" as OrderVerificationStatus,
          status: "cancelled" as const,
          verificationNote: reason || "Cancelled - Customer unreachable or address invalid.",
        }
      : o,
  );
  saveOrders(updated);
}
