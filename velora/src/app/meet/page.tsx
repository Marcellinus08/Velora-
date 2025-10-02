"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import MeetCard, { MeetCreator } from "@/components/meet/MeetCard";

type Booking = {
  id: string;
  creator: MeetCreator;
  kind: "voice" | "video";
  startAt: string;
  minutes: number;
  pricePerMinute: number;
  status: "upcoming" | "pending" | "history";
};

type Tab = "creators" | "upcoming" | "pending" | "history";

// helper normalisasi
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

// Dummy creators (sudah pakai pricing)
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
];

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

export default function MeetPage() {
  const [tab, setTab] = React.useState<Tab>("creators");
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [creators, setCreators] = React.useState<MeetCreator[] | null>(null);

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
          const v = typeof c.pricing?.voice === "number" ? c.pricing!.voice! : 0;
          const vv = typeof c.pricing?.video === "number" ? c.pricing!.video! : 0;
          return v > 0 || vv > 0;
        });

        if (!cancelled) setCreators(filtered.length ? filtered : DUMMY_CREATORS);
      } catch {
        if (!cancelled) setCreators(DUMMY_CREATORS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // load bookings untuk tab selain creators
  React.useEffect(() => {
    if (tab === "creators") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/meet/bookings?status=${tab}`, { cache: "no-store" });
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

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-50">Meet</h2>
          <Link
            href="/call-rates"
            className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Set call rates
          </Link>
        </div>

        {/* Tabs */}
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
              creators.map((d) => (
                <MeetCard
                  key={d.id}
                  data={d}
                  onCall={(creator, kind) => {
                    fetch("/api/meet/book", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ creatorId: creator.id, kind, minutes: 15 }),
                    }).then(() => setTab("pending"));
                  }}
                />
              ))
            )}
          </section>
        )}

        {tab !== "creators" && (
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
                    className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
                        {b.creator.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="h-full w-full object-cover" src={b.creator.avatarUrl} alt={b.creator.name} />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-neutral-400">👤</div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-50">{b.creator.name}</div>
                        <div className="text-xs text-neutral-400">@{b.creator.handle}</div>
                      </div>
                    </div>

                    <div className="hidden text-sm text-neutral-300 md:block">
                      <div className="font-medium capitalize">{b.kind} call</div>
                      <div className="text-neutral-400">{new Date(b.startAt).toLocaleString()}</div>
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
      </main>
    </div>
  );
}
