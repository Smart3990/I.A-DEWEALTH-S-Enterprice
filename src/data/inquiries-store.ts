export interface CustomerInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "new" | "in-progress" | "responded" | "archived";
  notes?: string;
  isRead?: boolean;
}

const STORAGE_KEY = "ia_customer_inquiries";
const DELETED_INQUIRIES_KEY = "ia_deleted_inquiries";
const EVENT_KEY = "ia_inquiries_updated";

function getDeletedInquiryIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_INQUIRIES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedInquiryId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedInquiryIds();
    set.add(id);
    localStorage.setItem(DELETED_INQUIRIES_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn("Failed to persist deleted inquiry ID:", e);
  }
}

const INITIAL_INQUIRIES: CustomerInquiry[] = [
  {
    id: "inq-1",
    name: "Kwame Owusu-Ansah",
    phone: "+233 24 456 7890",
    email: "kwame.ansah@gmail.com",
    subject: "Accra Same-Day Delivery",
    message:
      "Hello, I need an Apple Watch Ultra 2 delivered to my office near Stanbic Heights in Airport City this afternoon. Can the rider bring it by 2:30 PM? Will pay via MoMo on arrival.",
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 mins ago
    status: "new",
    isRead: false,
  },
  {
    id: "inq-2",
    name: "Akua Konadu",
    phone: "+233 50 123 4567",
    email: "konadu.akua@yahoo.com",
    subject: "Regional VIP Bus Waybill Dispatch",
    message:
      "Hi I.A Dewealth! I am located in Kumasi (near KNUST campus). If I order the Baseus 65W GaN charger and 100W cable today, which VIP station in Kumasi will receive the waybill?",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    status: "new",
    isRead: false,
  },
  {
    id: "inq-3",
    name: "Daniel Mensah",
    phone: "+233 55 987 6543",
    email: "daniel.mensah@techhub.gh",
    subject: "Bulk / Wholesale Orders",
    message:
      "Good day. Our startup needs 8 units of the Anker 20,000mAh Power Banks and 5 Sony noise-canceling headphones for staff. Do you issue VAT corporate invoices?",
    createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(), // yesterday
    status: "responded",
    notes: "Sent proforma invoice to email. Awaiting CEO purchase approval.",
    isRead: true,
  },
  {
    id: "inq-4",
    name: "Eunice Addo",
    phone: "+233 27 765 4321",
    email: "eunice.addo@outlook.com",
    subject: "Product Inquiry & Pricing",
    message:
      "Is the Wanbo T2 Max Full HD projector 100% brand new sealed in box with warranty? Can I come inspect it at your Accra hub before purchasing?",
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(), // 2 days ago
    status: "responded",
    notes: "Customer visited hub and purchased in cash.",
    isRead: true,
  },
];

export function getInquiries(): CustomerInquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const deletedIds = getDeletedInquiryIds();
    if (!raw) {
      const initial = INITIAL_INQUIRIES.filter((i) => !deletedIds.has(i.id));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const list: CustomerInquiry[] = Array.isArray(parsed) ? parsed : [];
    return list.filter((i) => !deletedIds.has(i.id));
  } catch (e) {
    console.error("Failed to read inquiries from localStorage", e);
    return [];
  }
}

export async function fetchInquiriesFromServer(): Promise<CustomerInquiry[]> {
  try {
    const res = await fetch("/api/inquiries");
    if (!res.ok) {
      return getInquiries();
    }
    const data = await res.json();
    if (Array.isArray(data?.inquiries)) {
      const deletedIds = getDeletedInquiryIds();
      const serverInquiries: CustomerInquiry[] = data.inquiries.filter(
        (i: CustomerInquiry) => !deletedIds.has(i.id),
      );
      const currentLocal = getInquiries();

      // Merge: server inquiries take precedence. Any local inquiry with temporary id (like inq-123)
      // that isn't yet in server list is preserved at the top.
      const serverIds = new Set(serverInquiries.map((i) => i.id));
      const localOnly = currentLocal.filter((i) => !serverIds.has(i.id) && !deletedIds.has(i.id));

      const finalInquiries = [...localOnly, ...serverInquiries];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalInquiries));
        window.dispatchEvent(new Event(EVENT_KEY));
      } catch (e) {
        console.error("Failed to cache inquiries to localStorage:", e);
      }
      return finalInquiries;
    }
  } catch (err) {
    console.warn("Could not sync inquiries with server, using local cache:", err);
  }
  return getInquiries();
}

export function saveInquiries(inquiries: CustomerInquiry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to save inquiries", e);
  }
}

export async function submitInquiryToServer(
  data: Omit<CustomerInquiry, "id" | "createdAt" | "status">,
): Promise<CustomerInquiry> {
  // 1. Immediately create and save local inquiry for instantaneous UI feedback
  const tempId = `inq-${Date.now()}`;
  const localItem: CustomerInquiry = {
    id: tempId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    subject: data.subject,
    message: data.message,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  const current = getInquiries();
  saveInquiries([localItem, ...current]);

  // 2. Transmit to server / database
  try {
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        message: data.message,
      }),
    });

    if (res.ok) {
      const responseData = await res.json();
      if (responseData?.inquiry) {
        const serverItem: CustomerInquiry = responseData.inquiry;
        // Replace temp item with confirmed server item
        const updated = getInquiries().map((i) => (i.id === tempId ? serverItem : i));
        saveInquiries(updated);
        return serverItem;
      }
    }
  } catch (err) {
    console.warn("Server inquiry submission warning (offline/retry):", err);
  }

  return localItem;
}

export function addInquiry(
  data: Omit<CustomerInquiry, "id" | "createdAt" | "status">,
): CustomerInquiry {
  // Calls async submit in background and returns immediate local item
  const tempId = `inq-${Date.now()}`;
  const newInquiry: CustomerInquiry = {
    id: tempId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    subject: data.subject,
    message: data.message,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const current = getInquiries();
  const updated = [newInquiry, ...current];
  saveInquiries(updated);

  // Trigger server sync
  fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      phone: data.phone,
      email: data.email,
      subject: data.subject,
      message: data.message,
    }),
  })
    .then((res) => res.json())
    .then((resData) => {
      if (resData?.inquiry) {
        const replaceUpdated = getInquiries().map((i) => (i.id === tempId ? resData.inquiry : i));
        saveInquiries(replaceUpdated);
      }
    })
    .catch((err) => {
      console.warn("Notice: Inquiry saved locally; remote sync status:", err);
    });

  return newInquiry;
}

export function updateInquiryStatus(
  id: string,
  status: CustomerInquiry["status"],
  notes?: string,
): void {
  const current = getInquiries();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        ...(notes !== undefined ? { notes } : {}),
      };
    }
    return item;
  });
  saveInquiries(updated);

  // Sync with server if it's a server UUID
  fetch("/api/inquiries", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status, notes }),
  }).catch((err) => console.warn("Notice: Status updated locally:", err));
}

export function markInquiryAsRead(id: string): void {
  const current = getInquiries();
  let changed = false;
  const updated = current.map((item) => {
    if (item.id === id && !item.isRead) {
      changed = true;
      return {
        ...item,
        isRead: true,
      };
    }
    return item;
  });
  if (changed) {
    saveInquiries(updated);
  }
}

export function deleteInquiry(id: string): void {
  addDeletedInquiryId(id);
  const current = getInquiries();
  saveInquiries(current.filter((item) => item.id !== id));

  // Sync deletion with server
  fetch(`/api/inquiries?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).catch((err) => console.warn("Notice: Inquiry deleted locally:", err));
}

export function clearAllInquiries(): void {
  const current = getInquiries();
  current.forEach((item) => addDeletedInquiryId(item.id));
  saveInquiries([]);

  // Sync clear-all with server
  fetch("/api/inquiries?id=all", {
    method: "DELETE",
  }).catch((err) => console.warn("Notice: Clear all inquiries sync warning:", err));
}
