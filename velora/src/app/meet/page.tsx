"use client";

import React from "react";
import Sidebar from "@/components/sidebar";
import MeetCard, { MeetCreator } from "@/components/meet/MeetCard";

type Booking = {
  id: string;
  creator: MeetCreator;
  kind: "voice" | "video";
  startAt: string; // ISO
  minutes: number;
  pricePerMinute: number;
  status: "upcoming" | "pending" | "history";
};

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
      className={`px-3 py-3 text-sm font-medium ${
        active
          ? "border-b-2 border-[var(--primary-500)] text-neutral-50"
          : "text-neutral-400 hover:text-neutral-200"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function MeetPage() {
  const [tab, setTab] = React.useState<"upcoming" | "pending" | "history">("upcoming");
  const [list, setList] = React.useState<Booking[]>([]);
  const [discover, setDiscover] = React.useState<MeetCreator[]>([]);
  const topRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await fetch(`/api/meet/bookings?status=${tab}`, { cache: "no-store" });
      const data = (await res.json()) as Booking[];
      setList(data);
    })();
  }, [tab]);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/meet/discover", { cache: "no-store" });
      const data = (await res.json()) as MeetCreator[];
      setDiscover(data);
    })();
  }, []);

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Title + quick action */}
        <div ref={topRef} className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-50">Meet</h2>
          <button
            className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
            onClick={() => {
              const el = document.getElementById("discover");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Explore creators
          </button>
        </div>

        {/* Sticky tabs – stays under your site header */}
        <div
          className="
            sticky top-[64px] z-[5] 
            mb-6 flex items-center gap-6 border-b border-neutral-800 
            bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60
          "
        >
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

        {/* Bookings for the selected tab */}
        {list.length === 0 ? (
          <div className="mb-10 grid place-items-center rounded-xl border border-neutral-800 bg-neutral-900 py-16 text-center">
            <div className="text-lg font-semibold text-neutral-200">No items</div>
            <div className="mt-1 text-sm text-neutral-400">
              Book a voice or video call from creators below.
            </div>
            <button
              className="mt-4 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              onClick={() => {
                const el = document.getElementById("discover");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Discover creators
            </button>
          </div>
        ) : (
          <ul className="mb-10 space-y-3">
            {list.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4"
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

        {/* Discover creators – placed AFTER the bookings so tabs are close to the top */}
        <section id="discover" className="scroll-mt-20">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-50">Discover creators</h3>
            {topRef.current && (
              <button
                className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
                onClick={() =>
                  topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Back to top
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {discover.map((d) => (
              <MeetCard
                key={d.id}
                data={d}
                onCall={(creator, kind) => {
                  // quick book - 15 minutes sample
                  fetch("/api/meet/book", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      creatorId: creator.id,
                      kind,
                      minutes: 15,
                    }),
                  }).then(() => setTab("pending"));
                }}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
