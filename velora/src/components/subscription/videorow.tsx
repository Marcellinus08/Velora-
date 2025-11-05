// src/components/subscription/videorow.tsx
import Image from "next/image";
import Link from "next/link";

export function SubscriptionVideoRow({
  title,
  thumb,
  subtext,
  primaryAction,
  videoId,       // ← NEW
  href,          // ← optional: override link manually
}: {
  title: string;
  thumb: string;
  subtext: string;
  primaryAction: { label: string; variant?: "primary" | "secondary" };
  videoId?: string;
  href?: string;
}) {
  const isPrimary = primaryAction.variant !== "secondary";
  const targetHref = href || (videoId ? `/video?id=${encodeURIComponent(videoId)}` : "/video");

  // Material Icon helper
  const MI = ({ name, className = "" }: { name: string; className?: string }) => (
    <span className={`material-icons-round ${className}`} aria-hidden="true">
      {name}
    </span>
  );

  return (
    <div className="group rounded-lg border border-neutral-800 bg-neutral-800/50 p-3 sm:p-4 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/80 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative h-14 w-24 sm:h-16 sm:w-28 flex-shrink-0 overflow-hidden rounded-md ring-1 ring-neutral-700/50 transition-all duration-200 group-hover:ring-2 group-hover:ring-purple-500/50">
            <Image
              src={thumb}
              alt={`${title} thumbnail`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 96px, 112px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-neutral-50 transition-colors duration-200 group-hover:text-white truncate">{title}</h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">{subtext}</p>
          </div>
        </div>

        <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
          <Link href={targetHref} prefetch={false} className="cursor-pointer w-full sm:w-auto">
            <button
              type="button"
              className={[
                "group/btn w-full sm:w-auto relative inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-4 py-2",
                "text-xs sm:text-sm font-semibold text-white transition-all duration-200 ease-out",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-neutral-900",
                "hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
                isPrimary
                  ? [
                      "bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90",
                      "hover:shadow-[0_8px_16px_-4px_rgba(168,85,247,0.45)]",
                      "before:content-[''] before:absolute before:inset-0 before:rounded-md before:opacity-0 before:transition-opacity before:duration-200",
                      "before:bg-[radial-gradient(100px_60px_at_10%_10%,rgba(255,255,255,0.25),transparent)] group-hover/btn:before:opacity-100",
                    ].join(" ")
                  : [
                      "bg-neutral-700 hover:bg-neutral-600",
                      "hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.35)]",
                      "before:content-[''] before:absolute before:inset-0 before:rounded-md before:opacity-0 before:transition-opacity before:duration-200",
                      "before:bg-[radial-gradient(100px_60px_at_10%_10%,rgba(255,255,255,0.15),transparent)] group-hover/btn:before:opacity-100",
                    ].join(" "),
              ].join(" ")}
              aria-label={primaryAction.label}
            >
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
                <span className="absolute -left-10 top-0 h-full w-8 skew-x-[-20deg] bg-white/20 opacity-0 transition-all duration-300 group-hover/btn:left-[110%] group-hover/btn:opacity-100" />
              </span>

              <MI
                name={isPrimary ? "play_arrow" : "autorenew"}
                className="text-[14px] sm:text-[16px] leading-none align-middle transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:scale-110"
              />

              <span>{primaryAction.label}</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
