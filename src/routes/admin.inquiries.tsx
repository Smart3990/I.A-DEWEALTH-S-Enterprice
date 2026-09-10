import { useState, useEffect, type FormEvent } from "react";
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
  type CustomerInquiry,
} from "@/data/inquiries-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiriesPage,
});

function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    const list = getInquiries();
    setInquiries(list);

    setIsRefreshing(true);
    try {
      const fresh = await fetchInquiriesFromServer();
      setInquiries(fresh);
      if (selectedInquiry) {
        const found = fresh.find((i) => i.id === selectedInquiry.id);
        if (found) {
          setSelectedInquiry(found);
          setInternalNote(found.notes || "");
        }
      }
    } catch (e) {
      console.warn("Failed to fetch fresh inquiries from server:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => {
      setInquiries(getInquiries());
    };
    window.addEventListener("ia_inquiries_updated", handleUpdate);
    return () => window.removeEventListener("ia_inquiries_updated", handleUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (item: CustomerInquiry) => {
    setSelectedInquiry(item);
    setInternalNote(item.notes || "");
    setReplyText("");
  };

  const handleStatusChange = (id: string, newStatus: CustomerInquiry["status"]) => {
    updateInquiryStatus(id, newStatus, internalNote);
    toast.success(`Inquiry marked as ${newStatus}`);
    refreshData();
  };

  const handleSaveNotes = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    updateInquiryStatus(selectedInquiry.id, selectedInquiry.status, internalNote);
    toast.success("Internal note saved");
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer inquiry?")) {
      deleteInquiry(id);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
      toast.success("Inquiry deleted");
      refreshData();
    }
  };

  const filtered = inquiries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const newCount = inquiries.filter((i) => i.status === "new").length;
  const inProgressCount = inquiries.filter((i) => i.status === "in-progress").length;
  const respondedCount = inquiries.filter((i) => i.status === "responded").length;

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
        <div className="flex items-center gap-2">
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

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-xs border-0">
          <span className="text-xs font-semibold text-slate-500">Total Inquiries</span>
          <p className="mt-1 text-xl font-black text-slate-900">{inquiries.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-xs border-0">
          <span className="text-xs font-semibold text-slate-500">New / Unhandled</span>
          <p className="mt-1 text-xl font-black text-slate-900">{newCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-xs border-0">
          <span className="text-xs font-semibold text-slate-500">In Progress</span>
          <p className="mt-1 text-xl font-black text-slate-900">{inProgressCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-xs border-0">
          <span className="text-xs font-semibold text-slate-500">Responded / Closed</span>
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
              <option value="all">All Statuses ({inquiries.length})</option>
              <option value="new">New ({newCount})</option>
              <option value="in-progress">In Progress ({inProgressCount})</option>
              <option value="responded">Responded ({respondedCount})</option>
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
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900">{item.name}</h3>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 border-0">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                          {item.subject} • <span className="text-slate-400">{formattedDate}</span>
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                        {item.phone}
                      </span>
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
                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 border-0">
                      {selectedInquiry.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Received: {new Date(selectedInquiry.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition border-0"
                  title="Delete Inquiry"
                >
                  <Trash2 className="h-4 w-4" />
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
                  <label className="text-xs font-bold text-slate-700">Update Inquiry Status</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedInquiry.id, "new")}
                      className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
                        selectedInquiry.status === "new"
                          ? "bg-amber-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      New
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedInquiry.id, "in-progress")}
                      className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
                        selectedInquiry.status === "in-progress"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedInquiry.id, "responded")}
                      className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
                        selectedInquiry.status === "responded"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Responded
                    </button>
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
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 border-0"
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
    </div>
  );
}
