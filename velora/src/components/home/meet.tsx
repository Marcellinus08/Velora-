"use client";

import * as React from "react";

type Creator = {
  id: string;                                // abstract_id (0x…)
  name: string;
  handle?: string;
  avatarUrl?: string | null;
  pricing?: { voice?: number; video?: number }; // USD per minute
};

const toCreator = (x: any): Creator => ({
  id: String(x?.id ?? x?.abstract_id ?? ""),
  name: String(x?.name ?? x?.username ?? "Unknown"),
  handle: x?.handle ?? x?.username ?? undefined,
  avatarUrl: x?.avatarUrl ?? x?.avatar_url ?? null,
  pricing: {
    voice:
      x?.pricing?.voice ??
      x?.voicePerMinute ??
      (typeof x?.pricing_voice === "number" ? x.pricing_voice : undefined),
    video:
      x?.pricing?.video ??
      x?.videoPerMinute ??
      (typeof x?.pricing_video === "number" ? x.pricing_video : undefined),
  },
});

const isAddress = (s?: string) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s);
const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

/** Kartu kecil. Jika `neon` true -> hover outline ungu. */
const Card = ({
  children,
  className = "",
  neon = false,
}: React.PropsWithChildren<{ className?: string; neon?: boolean }>) => {
  const base =
    "group min-w-[200px] rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 " +
    "text-neutral-300 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset] transition hover:bg-neutral-900/80 ";
  const hoverNeon = neon
    ? "hover:border-[var(--primary-500)] hover:shadow-[0_0_14px_rgba(124,58,237,0.45)]"
    : "hover:border-neutral-700";
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
        // gunakan API creators yang sudah ada
        const res = await fetch("/api/meet/creators", { cache: "no-store" });
        const j = await res.json().catch(() => ({}));
        const rows = Array.isArray(j?.creators) ? j.creators : [];
        const norm = rows.map(toCreator).slice(0, 6);
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

  // ⬇️ jika tidak ada data (atau masih loading), jangan render section
  if (loading || items.length === 0) return null;

  const renderCreatorCard = (p: Creator) => {
    const voice =
      typeof p.pricing?.voice === "number"
        ? `$${p.pricing.voice.toFixed(2)}/min`
        : "—";
    const video =
      typeof p.pricing?.video === "number"
        ? `$${p.pricing.video.toFixed(2)}/min`
        : "—";

    // ambil wallet dari id (abstract_id) → shorten
    const wallet = isAddress(p.id) ? p.id : "";
    const displayAddr = wallet ? shorten(wallet) : "—";

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
            {/* ⬇️ alamat wallet (bukan @handle) */}
            <div
              className="truncate text-[11px] text-neutral-400"
            >
              {displayAddr}
            </div>
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
      <div
        className="mt-4 flex gap-3 overflow-x-auto scroll-smooth pl-2 pr-2 md:pl-0 md:pr-0
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Title-as-card (tanpa neon) */}
        <Card className="flex min-w-[200px] flex-col justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-100">Meet</div>
            <div className="mt-0.5 text-[11px] text-neutral-400">
              Find creators to talk with
            </div>
          </div>
          <button
            className="mt-2 w-fit rounded-md border border-neutral-700/70 px-2 py-1 text-[11px] font-medium text-[var(--primary-500)] hover:opacity-90"
            onClick={() => (window.location.href = "/meet")}
          >
            View all →
          </button>
        </Card>

        {/* Creator cards */}
        {items.map(renderCreatorCard)}
      </div>
    </section>
  );
}
