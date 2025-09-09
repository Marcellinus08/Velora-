// src/components/meet.tsx
import React from "react";

/* =========================
   Types
========================= */
export type Meeting = {
  id: string;
  title: string;
  host: string;
  viewers: string; // tampilkan text seperti "2.3K menonton"
  live?: boolean;
  thumb: string; // pakai <img> biasa biar tak perlu next/image config
};

/* =========================
   Card
========================= */
export function MeetingCard({ m }: { m: Meeting }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={m.thumb}
          alt={`Meeting thumbnail for ${m.title}`}
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          {m.live && (
            <div className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-white" />
              <span>LANGSUNG</span>
            </div>
          )}
          <div className="rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">
            {m.viewers}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="font-semibold text-neutral-50">{m.title}</h3>
          <p className="mt-1 text-sm text-neutral-400">Oleh {m.host}</p>
        </div>
        <button className="mt-4 w-full rounded-lg bg-[var(--primary-500)] py-2 text-sm font-semibold text-white transition-colors hover:bg-opacity-80">
          Gabung Sekarang
        </button>
      </div>
    </div>
  );
}

/* =========================
   Grid wrapper
========================= */
export function MeetingGrid({ items }: { items: Meeting[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((m) => (
        <MeetingCard key={m.id} m={m} />
      ))}
    </div>
  );
}
