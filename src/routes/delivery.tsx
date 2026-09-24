import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Twitter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSite, useSiteConfig, whatsappLink } from "@/data/site";
import { WHATSAPP } from "@/data/products";
import { addInquiry } from "@/data/inquiries-store";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Contact Us & Nationwide Delivery | I.A Dewealth's Enterprise" },
      {
        name: "description",
        content:
          "Visit our Accra shop, contact our customer support team, check working hours, or send us an inquiry with same-day Accra delivery.",
      },
      {
        property: "og:title",
        content: "Contact Us & Nationwide Delivery | I.A Dewealth's Enterprise",
      },
      {
        property: "og:description",
        content:
          "Shop location, customer care contacts, working hours, and nationwide delivery details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeliveryPage,
});

const faqs = [
  {
    q: "How does same-day delivery work in Accra?",
    a: "Orders placed before 3:00 PM are dispatched the same day via our dedicated dispatch riders. We deliver across East Legon, Madina, Spintex, Airport, Osu, Tema, Dansoman, and all surrounding Greater Accra suburbs.",
  },
  {
    q: "How do deliveries to other regions in Ghana work?",
    a: "We deliver to Kumasi, Takoradi, Sunyani, Tamale, Cape Coast, Koforidua, and all other regions via trusted VIP, OA, and STC courier services. Parcel dispatch usually takes 24 hours.",
  },
  {
    q: "Can I inspect the product before paying?",
    a: "Yes! For deliveries within Accra, you can inspect your item in the presence of our dispatch rider before completing payment. You are also welcome to visit our Accra shop to test any gadget.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Mobile Money (MTN MoMo, Telecel Cash, AT Money), cash on delivery/inspection within Accra, and direct bank transfers.",
  },
  {
    q: "Are all products original and covered by warranty?",
    a: "100% yes. All electronics, chargers, earbuds, and accessories are genuine direct imports, brand new in sealed packaging, and backed by our shop warranty.",
  },
];

function DeliveryPage() {
  const [siteConfig] = useSiteConfig();
  const { settings } = useSite();

  const phoneDisplay = siteConfig.phone || settings.phone || "+233 24 111 8229";
  const whatsappNum = siteConfig.whatsappNumber || settings.whatsappNumber || WHATSAPP;
  const emailDisplay = siteConfig.email || settings.email || "sales@iadewealth.com";
  const addressDisplay =
    siteConfig.address ||
    settings.address ||
    "Circle Tip Toe Lane, Opposite Vodafone Building, Accra, Ghana";
  const visitUsHub = siteConfig.visitUsLocation || "Circle Tip Toe Lane, Central Accra Hub";
  const workingHours =
    siteConfig.workingHours || "Monday – Saturday: 8:30 AM – 7:30 PM (Sunday: Closed)";
  const rawPickupStatus = siteConfig.pickupInfo || "Pick-up Available Everyday";
  const pickupStatus =
    rawPickupStatus === "Walk-in & Hub Pick-up Available Everyday" ||
    rawPickupStatus === "Walk-in & Pick-up Available"
      ? "Pick-up Available Everyday"
      : rawPickupStatus;

  // Contact form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showFaqs, setShowFaqs] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Dynamic Google Maps embed URL based on admin configuration
  const mapEmbedUrl =
    siteConfig.mapEmbedUrl ||
    `https://maps.google.com/maps?q=${encodeURIComponent(
      siteConfig.mapLocation || addressDisplay,
    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Submit directly to /api/inquiries (which saves to Supabase customer_inquiries with service role)
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          phone: phoneNumber.trim() || "Not provided",
          email: email.trim() || undefined,
          subject: subject.trim() || "Delivery & Product Inquiry",
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (data?.inquiry) {
        const current = getInquiries();
        saveInquiries([data.inquiry, ...current.filter((i) => i.id !== data.inquiry.id)]);
      } else {
        addInquiry({
          name: fullName.trim(),
          phone: phoneNumber.trim() || "Not provided",
          email: email.trim() || undefined,
          subject: subject.trim() || "Delivery & Product Inquiry",
          message: message.trim(),
        });
      }

      // Also log to inquiries table for extra reliability
      try {
        await supabase.from("inquiries").insert({
          item_count: 1,
          items: [
            {
              type: "customer_message",
              name: fullName.trim(),
              phone: phoneNumber.trim(),
              email: email.trim(),
              subject: subject.trim(),
              message: message.trim(),
            },
          ],
          note: `Customer Message:\nFrom: ${fullName.trim()} (${phoneNumber.trim() || email.trim()})\nSubject: ${subject.trim()}\nMessage: ${message.trim()}`,
          status: "new",
          total: 0,
        });
      } catch {
        // silent
      }
    } catch (err) {
      console.warn("Notice: Saved to local store; remote sync status:", err);
      addInquiry({
        name: fullName.trim(),
        phone: phoneNumber.trim() || "Not provided",
        email: email.trim() || undefined,
        subject: subject.trim() || "Delivery & Product Inquiry",
        message: message.trim(),
      });
    } finally {
      setSubmitted(true);
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }
  };

  const directWhatsAppUrl = whatsappLink(
    whatsappNum,
    message.trim()
      ? `Hello I.A Dewealth,\n\nName: ${fullName || "Customer"}\nPhone: ${phoneNumber || "N/A"}\nSubject: ${subject || "Inquiry"}\n\n${message}`
      : `Hello I.A Dewealth's Enterprise, I would like to make an inquiry about your products and delivery.`,
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Have questions about our products or need assistance? We&apos;re here to help! Reach out
            to us through any of the channels below.
          </p>
        </div>

        {/* 4 Info Cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Visit Us */}
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-xs transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Visit Us</h3>
            <p className="mt-1 text-xs font-semibold text-slate-900">{visitUsHub}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{addressDisplay}</p>
            <span className="mt-1.5 inline-block text-[11px] font-bold text-emerald-600">
              {pickupStatus}
            </span>
          </div>

          {/* Card 2: Call Us */}
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-xs transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Call Us</h3>
            <a
              href={`tel:${phoneDisplay.replace(/\s+/g, "")}`}
              className="mt-1 text-xs font-semibold text-slate-700 hover:text-emerald-600"
            >
              {phoneDisplay}
            </a>
            <a
              href={`https://wa.me/${whatsappNum.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 text-[11px] font-medium text-emerald-600 hover:underline"
            >
              WhatsApp: +{whatsappNum}
            </a>
          </div>

          {/* Card 3: Email Us */}
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-xs transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Email Us</h3>
            <a
              href={`mailto:${emailDisplay}`}
              className="mt-1 text-xs font-semibold text-slate-700 hover:text-emerald-600"
            >
              {emailDisplay}
            </a>
            <span className="mt-1 text-[11px] font-medium text-slate-400">
              Prompt response within 2 hours
            </span>
          </div>

          {/* Card 4: Working Hours */}
          <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-xs transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Working Hours</h3>
            <p className="mt-1 text-xs text-slate-700 font-medium leading-relaxed">
              {workingHours}
            </p>
            <span className="mt-1 text-[11px] font-bold text-emerald-600">
              WhatsApp Assistance 24/7
            </span>
          </div>
        </div>

        {/* Join Our WhatsApp Community Banner */}
        <div className="mt-12 rounded-2xl border border-emerald-100/90 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
                <MessageCircle className="h-7 w-7 fill-white text-[#25D366]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Join Our WhatsApp Community
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Get instant access to product information, daily flash deals, express delivery
                  updates, and expert guidance directly from the I.A Dewealth team.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${whatsappNum.replace(/\D/g, "")}?text=${encodeURIComponent(
                "Hello I.A Dewealth, I would like to join your WhatsApp updates community.",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#22c55e] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#16a34a]"
            >
              <MessageCircle className="h-4 w-4" /> Join Now
            </a>
          </div>
        </div>

        {/* Main 2-Column Section: Send Us a Message + Find Us */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-14">
          {/* Left: Send Us a Message */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Send Us a Message</h2>
            <p className="mt-1 text-xs text-slate-500">
              Fill out the form below or chat with us directly on WhatsApp.
            </p>

            {submitted && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                <div className="text-xs">
                  <p className="font-bold">Thank you! Your message has been received.</p>
                  <p className="mt-0.5 text-slate-600">
                    Our customer care team in Accra will get back to you shortly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+233 55 000 0000"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-slate-700">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="How can we help?"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-slate-700">
                  Your Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more about your inquiry or delivery location..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-6 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#16a34a] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                  Chat on WhatsApp
                </a>
              </div>
            </form>
          </div>

          {/* Right: Find Us (Permanently working Google Map) */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Find Us</h2>
            <p className="mt-1 text-xs text-slate-500">
              Visit our central Accra store or track your dispatch location.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="relative h-80 w-full sm:h-96">
                <iframe
                  title="I.A Dewealth's Enterprise location in Accra, Ghana"
                  src={mapEmbedUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                {/* Floating Info Pill on map */}
                <div className="absolute left-3 top-3 max-w-[280px] rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-md backdrop-blur-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        {siteConfig.name || "I.A Dewealth's Enterprise"}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-800">
                        {visitUsHub}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{addressDisplay}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        siteConfig.mapLocation || addressDisplay,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                    <span className="font-semibold text-emerald-600">Open • Mon-Sat Hub Hours</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        siteConfig.mapLocation || addressDisplay,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Directions
                    </a>
                  </div>
                </div>
              </div>

              {/* Follow Us underneath */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                <span className="text-xs font-bold text-slate-800">Follow Us</span>
                <div className="flex items-center gap-2">
                  <a
                    href={settings.facebook || "https://facebook.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href={settings.instagram || "https://instagram.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href={settings.xUrl || "https://twitter.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://wa.me/${whatsappNum.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Have Questions? Check Our FAQ */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Have Questions? Check Our FAQ
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            Find answers to commonly asked questions about our products, delivery, returns, and
            more.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowFaqs(!showFaqs)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:border-slate-400 hover:bg-slate-50"
            >
              {showFaqs ? "Hide FAQ" : "View FAQ"}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showFaqs ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {showFaqs && (
            <div className="mx-auto mt-8 max-w-3xl space-y-3 text-left">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-slate-200 bg-white shadow-2xs transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-xs font-bold text-slate-900 hover:text-emerald-600"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180 text-emerald-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 px-5 pb-4 pt-2 text-xs leading-relaxed text-slate-600">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
