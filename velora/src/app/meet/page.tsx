"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
// Hanya ambil tipe dari MeetCard agar konsisten
import type { MeetCreator } from "@/components/meet/MeetCard";

/* =========================
 * Types
 * =======================*/
type Booking = {
  id: string;
  creator: MeetCreator;
  kind: "voice" | "video";
  startAt: string;
  minutes: number;
  pricePerMinute: number;
  status: "upcoming" | "pending" | "history";
};

type OrderItem = {
  id: string;
  buyer: {
    name: string;
    handle: string;
    avatarUrl?: string | null;
  };
  kind: "voice" | "video";
  startAt: string;
  minutes: number;
  pricePerMinute: number;
  status: "new" | "accepted" | "rejected" | "completed";
};

type Tab = "creators" | "upcoming" | "pending" | "history" | "orders";

/* =========================
 * Helpers
 * =======================*/
function toCreator(x: any): MeetCreator {
  return {
    id: String(x?.id ?? ""),
    name: String(x?.name ?? "Unknown"),
    handle: String(x?.handle ?? "unknown"),
    avatarUrl: x?.avatarUrl ?? null,
    pricing: {
      voice:
        x?.pricing?.voice ??
        x?.voicePerMinute ??
        (typeof x?.voice === "number" ? x.voice : undefined),
      video:
        x?.pricing?.video ??
        x?.videoPerMinute ??
        (typeof x?.video === "number" ? x.video : undefined),
    },
  };
}

/* =========================
 * Dummy creators (fallback)
 * =======================*/
const DUMMY_CREATORS: MeetCreator[] = [
  {
    id: "c_maria",
    name: "Maria",
    handle: "maria",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    pricing: { voice: 1, video: 5 },
  },
  {
    id: "c_arif",
    name: "Arif",
    handle: "arif",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&auto=format&fit=crop",
    pricing: { voice: 3, video: 7 },
  },
  {
    id: "c_sinta",
    name: "Sinta",
    handle: "sinta",
    avatarUrl:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=256&auto=format&fit=crop",
    pricing: { voice: 1.5, video: 4 },
  },
  {
    id: "c_dimas",
    name: "Dimas",
    handle: "dimas",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&auto=format&fit=crop",
    pricing: { voice: 2, video: 6 },
  },
];

/* =========================
 * UI Pieces
 * =======================*/
function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-3 text-sm font-medium -mb-px border-b-2 transition-colors ${
        active
          ? "border-[var(--primary-500)] text-neutral-50"
          : "border-transparent text-neutral-400 hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================
 * Booking Modal
 * =======================*/
function BookingModal({
  open,
  onClose,
  creator,
  onBooked,
}: {
  open: boolean;
  onClose: () => void;
  creator: MeetCreator | null;
  onBooked: () => void;
}) {
  const [kind, setKind] = React.useState<"voice" | "video">("voice");
  const [date, setDate] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");
  const [minutes, setMinutes] = React.useState<number>(15);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const now = new Date(Date.now() + 30 * 60 * 1000); // now + 30 min
    setDate(now.toISOString().slice(0, 10));
    setTime(now.toTimeString().slice(0, 5));
    if (creator) {
      const hasVoice =
        typeof creator.pricing?.voice === "number" && creator.pricing!.voice! > 0;
      const hasVideo =
        typeof creator.pricing?.video === "number" && creator.pricing!.video! > 0;
      setKind(hasVoice ? "voice" : hasVideo ? "video" : "voice");
    }
    setMinutes(15);
    setError(null);
    setLoading(false);
  }, [open, creator]);

  if (!open || !creator) return null;

  const hasVoice =
    typeof creator.pricing?.voice === "number" && creator.pricing!.voice! > 0;
  const hasVideo =
    typeof creator.pricing?.video === "number" && creator.pricing!.video! > 0;

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!date || !time) throw new Error("Select date & time");
      const startAtLocal = new Date(`${date}T${time}:00`);
      const body = {
        creatorId: creator.id,
        kind,
        minutes,
        startAt: startAtLocal.toISOString(),
      };
      const res = await fetch("/api/meet/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Booking failed");
      onClose();
      onBooked();
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl transition">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
            {creator.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="h-full w-full object-cover"
                src={creator.avatarUrl}
                alt={creator.name}
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-neutral-400">
                👤
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-neutral-50">{creator.name}</div>
            <div className="text-xs text-neutral-400">@{creator.handle}</div>
          </div>
        </div>

        {/* Kind */}
        <div className="mb-3">
          <div className="mb-1 text-sm text-neutral-300">Type</div>
          <div className="flex gap-2">
            <button
              disabled={!hasVoice}
              onClick={() => setKind("voice")}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                kind === "voice"
                  ? "border-[var(--primary-500)] text-neutral-50"
                  : "border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
              } ${!hasVoice ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Voice {hasVoice ? `· $${creator.pricing!.voice!.toFixed(2)}/min` : ""}
            </button>
            <button
              disabled={!hasVideo}
              onClick={() => setKind("video")}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                kind === "video"
                  ? "border-[var(--primary-500)] text-neutral-50"
                  : "border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
              } ${!hasVideo ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Video {hasVideo ? `· $${creator.pricing!.video!.toFixed(2)}/min` : ""}
            </button>
          </div>
        </div>

        {/* Date & Time */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="text-sm">
            <div className="mb-1 text-neutral-300">Date</div>
            <input
              type="date"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 transition-colors hover:border-neutral-700"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-neutral-300">Time</div>
            <input
              type="time"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 transition-colors hover:border-neutral-700"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>

        {/* Minutes */}
        <label className="mb-4 block text-sm">
          <div className="mb-1 text-neutral-300">Duration (minutes)</div>
          <input
            type="number"
            min={5}
            step={5}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 transition-colors hover:border-neutral-700"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(5, Number(e.target.value || 5)))}
          />
        </label>

        {error ? <div className="mb-3 text-sm text-red-400">{error}</div> : null}

        <div className="flex items-center justify-end gap-2">
          <button
            className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
 * Page
 * =======================*/
export default function MeetPage() {
  const [tab, setTab] = React.useState<Tab>("creators");
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [creators, setCreators] = React.useState<MeetCreator[] | null>(null);
  const [orders, setOrders] = React.useState<OrderItem[] | null>(null);

  // Modal state
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedCreator, setSelectedCreator] = React.useState<MeetCreator | null>(null);

  // load creators
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/meet/discover", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch fail");
        const raw = (await res.json()) as any[];
        const norm = (raw || []).map(toCreator);
        const filtered = norm.filter((c) => {
          const v =
            typeof c.pricing?.voice === "number" ? c.pricing!.voice! : 0;
          const vv =
            typeof c.pricing?.video === "number" ? c.pricing!.video! : 0;
          return v > 0 || vv > 0;
        });
        if (!cancelled)
          setCreators(filtered.length ? filtered : DUMMY_CREATORS);
      } catch {
        if (!cancelled) setCreators(DUMMY_CREATORS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // load bookings (for upcoming/pending/history)
  React.useEffect(() => {
    if (tab === "creators" || tab === "orders") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/meet/bookings?status=${tab}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as Booking[];
        if (!cancelled) setBookings(data);
      } catch {
        if (!cancelled) setBookings([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  // load orders (new tab on right)
  React.useEffect(() => {
    if (tab !== "orders") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/meet/orders`, { cache: "no-store" });
        const data = (await res.json()) as OrderItem[];
        if (!cancelled) setOrders(data);
      } catch {
        if (!cancelled) setOrders([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const openBooking = (c: MeetCreator) => {
    setSelectedCreator(c);
    setOpenModal(true);
  };

  // Neon purple glow utility (inline via arbitrary values)
  const glowCard =
    "transition-all hover:border-[var(--primary-500)] hover:bg-neutral-900/80 hover:shadow-[0_0_0_1px_var(--primary-500),0_0_24px_2px_rgba(139,92,246,0.45)]";

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-50">Meet</h2>
          <Link
            href="/call-rates"
            className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
          >
            Set call rates
          </Link>
        </div>

        {/* Tabs (Orders di pojok kanan) */}
        <div className="sticky top-[64px] z-[5] mb-6 flex items-center gap-6 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60">
          <TabButton active={tab === "creators"} onClick={() => setTab("creators")}>
            Creators
          </TabButton>
          <TabButton active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
            Upcoming
          </TabButton>
          <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>
            Pending
          </TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>
            History
          </TabButton>

          {/* right aligned */}
          <div className="ml-auto" />
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
            Orders
          </TabButton>
        </div>

        {/* Content */}
        {tab === "creators" && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creators === null ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[220px] animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/60"
                  />
                ))}
              </>
            ) : (
              creators.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-xl border border-neutral-800 bg-neutral-900 p-5 ${glowCard}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
                      {c.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="h-full w-full object-cover"
                          src={c.avatarUrl}
                          alt={c.name}
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-neutral-400">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-neutral-50">
                        {c.name}
                      </div>
                      <div className="text-xs text-neutral-400">@{c.handle}</div>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-neutral-800 p-3 transition-colors hover:border-neutral-700">
                      <div className="text-xs uppercase tracking-wide text-neutral-400">
                        Voice
                      </div>
                      <div className="text-sm font-semibold text-neutral-100">
                        {typeof c.pricing?.voice === "number"
                          ? `$${c.pricing!.voice!.toFixed(2)}/min`
                          : "N/A"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-neutral-800 p-3 transition-colors hover:border-neutral-700">
                      <div className="text-xs uppercase tracking-wide text-neutral-400">
                        Video
                      </div>
                      <div className="text-sm font-semibold text-neutral-100">
                        {typeof c.pricing?.video === "number"
                          ? `$${c.pricing!.video!.toFixed(2)}/min`
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Single action: Booking */}
                  <button
                    className="w-full rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    onClick={() => openBooking(c)}
                  >
                    Booking
                  </button>
                </div>
              ))
            )}
          </section>
        )}

        {tab !== "creators" && tab !== "orders" && (
          <>
            {bookings.length === 0 ? (
              <div className="mb-10 grid place-items-center rounded-xl border border-neutral-800 bg-neutral-900 py-16 text-center">
                <div className="text-lg font-semibold text-neutral-200">No items</div>
                <div className="mt-1 text-sm text-neutral-400">
                  Book a voice or video call from creators in the Creators tab.
                </div>
              </div>
            ) : (
              <ul className="mb-10 space-y-3">
                {bookings.map((b) => (
                  <li
                    key={b.id}
                    className={`flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4 ${glowCard}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
                        {b.creator.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="h-full w-full object-cover"
                            src={b.creator.avatarUrl}
                            alt={b.creator.name}
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-neutral-400">
                            👤
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-50">
                          {b.creator.name}
                        </div>
                        <div className="text-xs text-neutral-400">
                          @{b.creator.handle}
                        </div>
                      </div>
                    </div>

                    <div className="hidden text-sm text-neutral-300 md:block">
                      <div className="font-medium capitalize">{b.kind} call</div>
                      <div className="text-neutral-400">
                        {new Date(b.startAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-neutral-300">
                        {b.minutes} min × ${b.pricePerMinute.toFixed(2)}
                      </div>
                      <div className="text-base font-semibold text-neutral-50">
                        ${(b.minutes * b.pricePerMinute).toFixed(2)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "orders" && (
          <>
            {orders === null || orders.length === 0 ? (
              <div className="mb-10 grid place-items-center rounded-xl border border-neutral-800 bg-neutral-900 py-16 text-center">
                <div className="text-lg font-semibold text-neutral-200">No orders</div>
                <div className="mt-1 text-sm text-neutral-400">
                  Orders from users who requested your content will appear here.
                </div>
              </div>
            ) : (
              <ul className="mb-10 space-y-3">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className={`flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4 ${glowCard}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
                        {o.buyer?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="h-full w-full object-cover"
                            src={o.buyer.avatarUrl}
                            alt={o.buyer.name}
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-neutral-400">
                            👤
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-50">
                          {o.buyer.name}
                        </div>
                        <div className="text-xs text-neutral-400">
                          @{o.buyer.handle}
                        </div>
                      </div>
                    </div>

                    <div className="hidden text-sm text-neutral-300 md:block">
                      <div className="font-medium capitalize">{o.kind} call</div>
                      <div className="text-neutral-400">
                        {new Date(o.startAt).toLocaleString()}
                      </div>
                      <div className="text-neutral-400">
                        {o.minutes} min × ${o.pricePerMinute.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs uppercase ${
                          o.status === "new"
                            ? "text-yellow-300"
                            : o.status === "accepted"
                            ? "text-green-300"
                            : o.status === "rejected"
                            ? "text-red-300"
                            : "text-neutral-400"
                        }`}
                      >
                        {o.status}
                      </div>
                      <div className="text-base font-semibold text-neutral-50">
                        ${(o.minutes * o.pricePerMinute).toFixed(2)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      <BookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        creator={selectedCreator}
        onBooked={() => setTab("pending")}
      />
    </div>
  );
}
