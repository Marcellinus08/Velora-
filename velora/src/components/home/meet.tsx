// src/components/home/meet-ribbon.tsx
"use client";

import * as React from "react";

type Creator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string | null;
  pricing?: { voice?: number; video?: number };
};

const toCreator = (x: any): Creator => ({
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
});

/** Card dasar. Jika `neon` true -> hover ungu neon. */
const Card = ({
  children,
  className = "",
  neon = false,
}: React.PropsWithChildren<{ className?: string; neon?: boolean }>) => {
  const base =
    "group min-w-[200px] rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 " +
    "text-neutral-300 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset] transition " +
    "hover:bg-neutral-900/80 ";

  const hoverNeon = neon
    ? // neon purple glow (pakai warna utama project)
      "hover:border-[var(--primary-500)] hover:shadow-[0_0_14px_rgba(124,58,237,0.45)]"
    : // netral untuk card judul kiri
      "hover:border-neutral-700";

  return <div className={`${base} ${hoverNeon} ${className}`}>{children}</div>;
};

export default function HomeMeetRibbon() {
  const [items, setItems] = React.useState<Creator[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/meet/discover", { cache: "no-store" });
        const raw = (await res.json()) as any[];
        const norm = (raw || []).map(toCreator).slice(0, 6);
        if (alive) setItems(norm);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading || items.length === 0) return null;

  const renderCreatorCard = (p: Creator) => {
    const voice =
      typeof p.pricing?.voice === "number" ? `$${p.pricing.voice.toFixed(2)}/min` : "—";
    const video =
      typeof p.pricing?.video === "number" ? `$${p.pricing.video.toFixed(2)}/min` : "—";

    return (
      <Card key={p.id} neon>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 grayscale transition group-hover:grayscale-0">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-neutral-500">👤</div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-neutral-100">{p.name}</div>
            <div className="truncate text-[11px] text-neutral-400">@{p.handle}</div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md border border-neutral-700/70 px-2 py-0.5 text-[10px] text-neutral-300">
            Voice {voice}
          </span>
          <span className="rounded-md border border-neutral-700/70 px-2 py-0.5 text-[10px] text-neutral-300">
            Video {video}
          </span>
        </div>
      </Card>
    );
  };

  return (
    <section className="mb-5">
      {/* Ribbon: judul jadi card paling kiri */}
      <div
        className="mt-4 flex gap-3 overflow-x-auto scroll-smooth pl-2 pr-2 md:pl-0 md:pr-0
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Title-as-card (TANPA neon) */}
        <Card className="flex min-w-[200px] flex-col justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-100">Meet</div>
            <div className="mt-0.5 text-[11px] text-neutral-400">Find creators to talk with</div>
          </div>
          <button
            className="mt-2 w-fit rounded-md border border-neutral-700/70 px-2 py-1 text-[11px] font-medium text-[var(--primary-500)] hover:opacity-90"
            onClick={() => (window.location.href = "/meet")}
          >
            View all →
          </button>
        </Card>

        {/* Creator cards (DENGAN neon) */}
        {items.map(renderCreatorCard)}
      </div>
    </section>
  );
}
