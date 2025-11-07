"use client";

import * as React from "react";
import Link from "next/link";
import { AbstractProfile } from "@/components/abstract-profile";

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

/** Kartu dasar dengan hover effect seperti Featured Videos */
const Card = ({
  children,
  className = "",
  neon = false,
}: React.PropsWithChildren<{ className?: string; neon?: boolean }>) => {
  const base =
    "group min-w-[200px] rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 " +
    "text-neutral-300 transition-all duration-300 cursor-pointer " +
    "max-sm:min-w-[140px] max-sm:max-w-[140px] max-sm:px-2 max-sm:py-1.5 ";
  const hoverEffect = neon
    ? "hover:bg-neutral-800/50"
    : "hover:bg-neutral-800/50";
  return <div className={`${base} ${hoverEffect} ${className}`}>{children}</div>;
};

/** Skeleton ala CardsGrid (animate-pulse + bar-bar bg-neutral-800/60) */
function LoadingSkeletonRow() {
  return (
    <section className="mb-5">
      <div
        className="mt-4 flex gap-3 overflow-x-auto scroll-smooth pl-2 pr-2 md:pl-0 md:pr-0
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   max-sm:gap-2"
      >
        {/* Title skeleton */}
        <div className="animate-pulse min-w-[200px] rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2
          max-sm:min-w-[140px] max-sm:max-w-[140px] max-sm:px-2 max-sm:py-1.5">
          <div className="h-4 w-16 rounded bg-neutral-800/60 max-sm:h-3 max-sm:w-12" />
          <div className="mt-1 h-3 w-28 rounded bg-neutral-800/60 max-sm:h-2 max-sm:w-20" />
          <div className="mt-3 h-7 w-20 rounded bg-neutral-800/60 max-sm:h-6 max-sm:w-16" />
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse min-w-[200px] rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2
              max-sm:min-w-[140px] max-sm:max-w-[140px] max-sm:px-2 max-sm:py-1.5"
          >
            <div className="flex items-center gap-3 max-sm:gap-2">
              <div className="h-10 w-10 rounded-full bg-neutral-800/60 max-sm:h-8 max-sm:w-8" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-24 rounded bg-neutral-800/60 max-sm:h-3 max-sm:w-16" />
                <div className="mt-1 h-3 w-20 rounded bg-neutral-800/60 max-sm:h-2 max-sm:w-14" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 max-sm:mt-1.5 max-sm:gap-1.5">
              <div className="h-5 w-24 rounded bg-neutral-800/60 max-sm:h-4 max-sm:w-16" />
              <div className="h-5 w-24 rounded bg-neutral-800/60 max-sm:h-4 max-sm:w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomeMeetRibbon() {
  // const [items, setItems] = React.useState<Creator[]>([]);
  // const [loading, setLoading] = React.useState(true);

  // React.useEffect(() => {
  //   let alive = true;
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch("/api/meet/creators", { cache: "no-store" });
  //       const j = await res.json().catch(() => ({}));
  //       const rows = Array.isArray(j?.creators) ? j.creators : [];
  //       const norm = rows.map(toCreator).slice(0, 6);
  //       if (alive) setItems(norm);
  //     } catch {
  //       if (alive) setItems([]);
  //     } finally {
  //       if (alive) setLoading(false);
  //     }
  //   })();
  //   return () => {
  //     alive = false;
  //   };
  // }, []);

  // if (loading) return <LoadingSkeletonRow />;

  // // ⬇️ kalau tidak ada data, tidak render ribbon sama sekali
  // if (!items.length) return null;

  // const renderCreatorCard = (p: Creator) => {
  //   const voice =
  //     typeof p.pricing?.voice === "number"
  //       ? `$${p.pricing.voice.toFixed(2)}/min`
  //       : "—";
  //   const video =
  //     typeof p.pricing?.video === "number"
  //       ? `$${p.pricing.video.toFixed(2)}/min`
  //       : "—";

  //   // wallet dari id (abstract_id)
  //   const wallet = isAddress(p.id) ? p.id : "";
  //   const displayAddr = wallet ? shorten(wallet) : "—";

  //   return (
  //     <Link key={p.id} href="/meet">
  //       <Card neon>
  //         <div className="flex items-center gap-3">
  //           <div className="overflow-hidden grayscale transition group-hover:grayscale-0">
  //             {p.avatarUrl ? (
  //               // User has avatar in database - use it
  //               <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800">
  //                 {/* eslint-disable-next-line @next/next/no-img-element */}
  //                 <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
  //               </div>
  //             ) : (
  //               // User doesn't have avatar in database - use AbstractProfile
  //               <AbstractProfile 
  //                 address={isAddress(p.id) ? p.id as `0x${string}` : undefined}
  //                 size="md"
  //                 showTooltip={false}
  //                 fallback={p.name.slice(0, 2).toUpperCase()}
  //               />
  //             )}
  //           </div>
  //           <div className="min-w-0">
  //             <div className="truncate text-sm font-medium text-neutral-100">{p.name}</div>
  //             {/* alamat wallet (bukan @handle) */}
  //             <div className="truncate text-[11px] text-neutral-400" title={wallet || undefined}>
  //               {displayAddr}
  //             </div>
  //           </div>
  //         </div>

  //         <div className="mt-2 flex items-center gap-2">
  //           <span className="rounded-md border border-neutral-700/70 px-2 py-0.5 text-[10px] text-neutral-300">
  //             Voice {voice}
  //           </span>
  //           <span className="rounded-md border border-neutral-700/70 px-2 py-0.5 text-[10px] text-neutral-300">
  //             Video {video}
  //           </span>
  //         </div>
  //       </Card>
  //     </Link>
  //   );
  // };

  return (
    <section className="mb-5 max-sm:mb-3 md:mb-4 lg:mb-5">
      <div
        className="mt-4 flex gap-3 overflow-x-auto scroll-smooth pl-2 pr-2 md:pl-0 md:pr-0
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   max-sm:mt-2 max-sm:gap-2 max-sm:pl-0 max-sm:pr-0
                   md:mt-3 md:gap-2.5 lg:mt-4 lg:gap-3"
      >
        {/* Title-as-card (tanpa neon) */}
        <Link href="/meet" className="group min-w-[200px] rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-300 transition-all duration-300 flex flex-col justify-between
          max-sm:min-w-[140px] max-sm:max-w-[140px] max-sm:px-2 max-sm:py-1.5 max-sm:rounded-lg
          md:min-w-[180px] lg:min-w-[200px]">
          <div>
            <div className="text-sm font-semibold text-neutral-100 max-sm:text-xs md:text-xs lg:text-sm">Meet</div>
            <div className="mt-0.5 text-[11px] text-neutral-400 max-sm:text-[9px] max-sm:mt-0 md:text-[10px] lg:text-[11px]">
              Find creators to talk with
            </div>
          </div>
          <div className="mt-2 w-fit rounded-md border border-neutral-700/70 px-2 py-1 text-[11px] font-medium text-[var(--primary-500)] hover:opacity-90 transition-opacity
            max-sm:mt-1.5 max-sm:px-1.5 max-sm:py-0.5 max-sm:text-[9px]
            md:mt-1.5 md:px-1.5 md:py-0.5 md:text-[10px] lg:mt-2 lg:text-[11px]">
            View all →
          </div>
        </Link>

        {/* Coming Soon Banner - Creative Design */}
        <div className="group flex-1 rounded-xl border border-transparent bg-gradient-to-r from-purple-950/80 via-blue-950/60 to-purple-950/80 px-4 py-2 text-neutral-300 transition-all duration-300 flex items-center justify-center hover:shadow-2xl hover:shadow-purple-500/40 relative overflow-hidden
          max-sm:px-3 max-sm:py-1.5 max-sm:rounded-lg
          md:px-3 md:py-1.5 lg:px-4 lg:py-2">
          {/* Animated background with moving gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-500/30 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
          
          {/* Top light rays */}
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-b from-purple-500/40 to-transparent rounded-full blur-3xl -translate-y-1/2 group-hover:from-purple-500/60 transition-all duration-500
            max-sm:w-16 max-sm:h-16 max-sm:blur-2xl
            md:w-20 md:h-20 md:blur-2xl lg:w-24 lg:h-24 lg:blur-3xl" />
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-gradient-to-b from-blue-500/40 to-transparent rounded-full blur-3xl -translate-y-1/2 group-hover:from-blue-500/60 transition-all duration-500
            max-sm:w-16 max-sm:h-16 max-sm:blur-2xl
            md:w-20 md:h-20 md:blur-2xl lg:w-24 lg:h-24 lg:blur-3xl" />
          
          {/* Bottom glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-t from-purple-500/20 to-transparent rounded-full blur-3xl group-hover:from-purple-500/40 transition-all duration-500
            max-sm:w-24 max-sm:h-12 max-sm:blur-2xl
            md:w-32 md:h-16 md:blur-2xl lg:w-40 lg:h-20 lg:blur-3xl" />
          
          {/* Border glow */}
          <div className="absolute inset-0 rounded-xl border border-purple-500/0 group-hover:border-purple-400/50 transition-all duration-300
            max-sm:rounded-lg md:rounded-lg lg:rounded-xl" />
          
          <div className="relative z-10 flex items-center gap-4 w-full max-sm:gap-2 md:gap-3 lg:gap-4">
            {/* Icon container with 3D effect */}
            <div className="relative flex-shrink-0">
              {/* Rotating ring */}
              <div className="absolute inset-0 rounded-xl border border-purple-500/30 group-hover:border-purple-400/60 transition-all duration-300
                max-sm:rounded-lg md:rounded-lg lg:rounded-xl" style={{ animation: 'spin 3s linear infinite' }} />
              
              {/* Glow layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/20 rounded-lg blur-lg group-hover:from-purple-500/60 group-hover:to-blue-500/40 transition-all duration-300
                max-sm:blur-md md:blur-md lg:blur-lg" />
              
              {/* Main icon */}
              <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg px-4 py-2 shadow-xl shadow-purple-500/50 group-hover:shadow-2xl group-hover:shadow-purple-400/70 transition-all duration-300
                max-sm:px-2 max-sm:py-1 max-sm:rounded-md
                md:px-3 md:py-1.5 md:rounded-md lg:px-4 lg:py-2 lg:rounded-lg">
                <span className="material-icons-round text-white text-2xl leading-none block max-sm:text-base md:text-lg lg:text-xl">videocam</span>
              </div>
            </div>
            
            {/* Content with staggered animation */}
            <div className="flex-1">
              <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 group-hover:from-purple-100 group-hover:via-blue-100 group-hover:to-purple-100 transition-all duration-300 animate-pulse
                max-sm:text-xs max-sm:font-bold
                md:text-sm md:font-bold lg:text-base lg:font-black" style={{ animationDuration: '3s' }}>
                Coming Soon
              </div>
              <div className="text-[11px] text-purple-200/80 group-hover:text-purple-100 transition-colors duration-300 font-semibold tracking-wide
                max-sm:text-[8px] max-sm:font-medium
                md:text-[9px] md:font-medium lg:text-[10px] lg:font-semibold">
                🌟 Meet feature launching soon
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute top-2 right-4 text-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-bounce max-sm:hidden md:hidden lg:block" style={{ animationDelay: '0s' }}>✨</div>
            <div className="absolute bottom-2 right-8 text-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300 animate-bounce max-sm:hidden md:hidden lg:block" style={{ animationDelay: '0.2s' }}>🚀</div>
          </div>
        </div>

        {/* Creator cards - commented for future use */}
        {/* {items.map(renderCreatorCard)} */}
      </div>
    </section>
  );
}
