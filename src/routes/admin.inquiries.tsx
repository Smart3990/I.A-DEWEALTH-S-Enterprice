import { useState, useEffect, useCallback, useMemo, useRef, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  ExternalLink,
  Filter,
  Send,
  User,
  Archive,
  RefreshCw,
} from "lucide-react";
import {
  getInquiries,
  fetchInquiriesFromServer,
  updateInquiryStatus,
  deleteInquiry,
  clearAllInquiries,
  markInquiryAsRead,
  type CustomerInquiry,
} from "@/data/inquiries-store";
import { logActivity } from "@/lib/admin-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiriesPage,
});

function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<CustomerInquiry | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const urlParamHandledRef = useRef(false);

  // Derive current selected inquiry reactively from inquiries list
  const selectedInquiry = useMemo(() => {
    if (selectedInquiryId) {
      const found = inquiries.find((i) => i.id === selectedInquiryId);
      if (found) return found;
    }
    return inquiries.length > 0 ? inquiries[0] : null;
  }, [inquiries, selectedInquiryId]);

  // Keep internal note in sync when active selected inquiry changes
  useEffect(() => {
    setInternalNote(selectedInquiry?.notes || "");
  }, [selectedInquiry]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fresh = await fetchInquiriesFromServer();
      setInquiries(fresh);
    } catch (e) {
      console.warn("Failed to fetch fresh inquiries from server:", e);
      setInquiries(getInquiries());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initial = getInquiries();
    setInquiries(initial);
    refreshData();

    // Check URL query param ONCE on mount
    if (!urlParamHandledRef.current && typeof window !== "undefined") {
      urlParamHandledRef.current = true;
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get("id");
      if (targetId) {
        setSelectedInquiryId(targetId);
      }
    }

    // Poll every 15 seconds for new customer submissions
    const pollInterval = setInterval(() => {
      if (isMounted) refreshData();
    }, 15000);

    const handleUpdate = () => {
      if (isMounted) setInquiries(getInquiries());
    };
    window.addEventListener("ia_inquiries_updated", handleUpdate);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("ia_inquiries_updated", handleUpdate);
    };
  }, [refreshData]);

  const handleSelect = (item: CustomerInquiry) => {
    setSelectedInquiryId(item.id);
    setInternalNote(item.notes || "");
    setReplyText("");

    if (!item.isRead) {
      markInquiryAsRead(item.id);
      setInquiries((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
    }
  };

  const handleStatusChange = (id: string, newStatus: CustomerInquiry["status"]) => {
    updateInquiryStatus(id, newStatus, internalNote);
    logActivity(`Updated customer inquiry #${id.slice(0, 6)} status to ${newStatus}`);
    toast.success(`Inquiry marked as ${newStatus}`);
    refreshData();
  };

  const handleSaveNotes = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    updateInquiryStatus(selectedInquiry.id, selectedInquiry.status, internalNote);
    logActivity(
      `Saved internal notes on inquiry #${selectedInquiry.id.slice(0, 6)} (${selectedInquiry.name})`,
    );
    toast.success("Internal note saved");
    refreshData();
  };

  const confirmDeleteInquiry = () => {
    if (!inquiryToDelete) return;
    const id = inquiryToDelete.id;
    deleteInquiry(id);
    logActivity(`Deleted customer inquiry #${id.slice(0, 6)} from ${inquiryToDelete.name}`);
    if (selectedInquiryId === id) {
      setSelectedInquiryId(null);
    }
    toast.success("Inquiry deleted successfully");
    setInquiryToDelete(null);
    refreshData();
  };

  const confirmClearAll = () => {
    clearAllInquiries();
    logActivity("Permanently cleared all customer inquiries & messages");
    toast.success("All customer inquiries have been cleared");
    setSelectedInquiryId(null);
    setShowClearAllModal(false);
    refreshData();
  };

  const filtered = inquiries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase());

    const isUnopened = item.status === "new" && !item.isRead;
    const matchesStatus =
      filterStatus === "all" || (filterStatus === "new" ? isUnopened : !isUnopened);
    return matchesSearch && matchesStatus;
  });

  const newCount = inquiries.filter((i) => i.status === "new" && !i.isRead).length;
  const respondedCount = inquiries.filter((i) => i.status === "responded" || i.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Customer Inquiries & Messages
          </h1>
          <p className="text-xs text-slate-500">
            Real inquiries submitted via the /delivery Contact & Support form across Greater Accra &
            Ghana.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {inquiries.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition"
              title="Delete all customer inquiries"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All Inquiries</span>
            </button>
          )}

          <button
            type="button"
            onClick={refreshData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 border-0"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats - Neutral clean cards without colored backgrounds */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Inquiries</span>
          <p className="mt-1 text-xl font-black text-slate-900">{inquiries.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-bold text-emerald-600">New / Unopened Messages</span>
          <p className="mt-1 text-xl font-black text-emerald-600">{newCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-600">Responded / Handled</span>
          <p className="mt-1 text-xl font-black text-slate-900">{respondedCount}</p>
        </div>
      </div>

      {/* Main Content: List + Detail View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Inquiries List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer, phone, message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-100 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden border-0 transition"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden border-0"
            >
              <option value="all">All Inquiries ({inquiries.length})</option>
              <option value="new">New / Unopened ({newCount})</option>
              <option value="responded">Responded / Handled ({respondedCount})</option>
            </select>
          </div>

          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-xs border-0">
                <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-600">No inquiries found</p>
                <p className="text-[11px] text-slate-400">
                  New submissions from the delivery contact form will appear here automatically.
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedInquiry?.id === item.id;
                const formattedDate = new Date(item.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isNewUnopened = item.status === "new" && !item.isRead;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`cursor-pointer rounded-2xl p-4 transition border-0 ${
                      isSelected
                        ? "bg-slate-100 shadow-xs font-medium"
                        : "bg-white shadow-xs hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900 truncate">{item.name}</h3>
                          {/* Only new unopened messages will have the tags - no background, no dot, only colored text */}
                          {isNewUnopened && (
                            <span className="text-[11px] font-bold text-emerald-600">New</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                          {item.subject} • <span className="text-slate-400">{formattedDate}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {item.phone}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInquiryToDelete(item);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Delete this customer inquiry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      &ldquo;{item.message}&rdquo;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Inquiry Detail */}
        <div className="lg:col-span-6">
          {selectedInquiry ? (
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-xs border-0 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{selectedInquiry.name}</h2>
                    {selectedInquiry.status === "new" && !selectedInquiry.isRead && (
                      <span className="text-[11px] font-bold text-emerald-600">New</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Received: {new Date(selectedInquiry.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setInquiryToDelete(selectedInquiry)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  title="Delete this inquiry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs bg-slate-50 rounded-xl p-3.5 border-0">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="font-semibold text-slate-800 hover:text-emerald-600"
                  >
                    {selectedInquiry.phone}
                  </a>
                </div>
                {selectedInquiry.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="font-semibold text-slate-800 hover:text-blue-600 truncate"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                )}
                <div className="sm:col-span-2 flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">Inquiry Subject:</span>
                  <span className="rounded-md bg-white px-2 py-0.5 font-bold text-slate-800 shadow-xs border-0">
                    {selectedInquiry.subject}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Customer Message
                </h4>
                <div className="mt-2 rounded-xl bg-slate-50 p-4 border-0 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Quick Actions (Call, WhatsApp, Email) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(
                    selectedInquiry.name,
                  )},%20this%20is%20I.A%20Dewealth's%20Enterprise%20regarding%20your%20inquiry%20about%20"${encodeURIComponent(
                    selectedInquiry.subject,
                  )}"`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a884] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#009676] border-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Reply on WhatsApp</span>
                </a>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 border-0"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>Call Customer</span>
                </a>
                {selectedInquiry.email && (
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re:%20${encodeURIComponent(
                      selectedInquiry.subject,
                    )}%20-%20I.A%20Dewealth`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 border-0"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span>Send Email</span>
                  </a>
                )}
              </div>

              {/* Status Selector & Internal Notes */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Inquiry Status</label>
                  <div className="flex items-center gap-2">
                    {selectedInquiry.status === "new" && !selectedInquiry.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedInquiry.id, "responded")}
                        className="rounded-lg bg-[#00a884] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#008f70] transition shadow-xs"
                      >
                        Mark as Handled
                      </button>
                    ) : (
                      <>
                        <span className="text-xs font-medium text-slate-500">Handled</span>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(selectedInquiry.id, "new")}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
                        >
                          Mark as Unopened
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveNotes} className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Internal Admin Notes (e.g. dispatched waybill number, rider assigned, quote
                    given)
                  </label>
                  <textarea
                    rows={2}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Enter staff notes here..."
                    className="w-full rounded-xl bg-slate-100 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden border-0 transition"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-xl bg-[#00a884] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#008f70] border-0 shadow-xs transition"
                  >
                    Save Note
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <User className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-2 text-xs font-bold text-slate-700">No inquiry selected</h3>
              <p className="mt-1 text-[11px] text-slate-400">
                Click any customer message from the list on the left to view their details, reply on
                WhatsApp, and update status.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Single Inquiry Confirmation Dialog */}
      {inquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Inquiry</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the inquiry from{" "}
              <strong>{inquiryToDelete.name}</strong> ({inquiryToDelete.phone})?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInquiryToDelete(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteInquiry}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Clear All Inquiries</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete all <strong>{inquiries.length}</strong>{" "}
              customer inquiries and messages? They will be removed immediately from your platform.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition"
              >
                Clear All Inquiries
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
