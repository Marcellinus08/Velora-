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
  const targetHref = href || (videoId ? `/task?id=${encodeURIComponent(videoId)}` : "/task");

  // Material Icon helper
  const MI = ({ name, className = "" }: { name: string; className?: string }) => (
    <span className={`material-icons-round ${className}`} aria-hidden="true">
      {name}
    </span>
  );

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-800/50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-28 overflow-hidden rounded-md">
            <Image
              src={thumb}
              alt={`${title} thumbnail`}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-50">{title}</h3>
            <p className="text-sm text-neutral-400">{subtext}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={targetHref} prefetch={false}>
            <button
              type="button"
              className={[
                "group relative inline-flex items-center gap-2 rounded-md px-4 py-2",
                "text-sm font-semibold text-white transition-all duration-200 ease-out",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-neutral-900",
                "hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
                isPrimary
                  ? [
                      "bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90",
                      "hover:shadow-[0_12px_24px_-6px_rgba(168,85,247,0.45)]",
                      "before:content-[''] before:absolute before:inset-0 before:rounded-md before:opacity-0 before:transition-opacity before:duration-200",
                      "before:bg-[radial-gradient(120px_80px_at_10%_10%,rgba(255,255,255,0.25),transparent)] group-hover:before:opacity-100",
                    ].join(" ")
                  : [
                      "bg-neutral-700 hover:bg-neutral-600",
                      "hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.35)]",
                      "before:content-[''] before:absolute before:inset-0 before:rounded-md before:opacity-0 before:transition-opacity before:duration-200",
                      "before:bg-[radial-gradient(120px_80px_at_10%_10%,rgba(255,255,255,0.15),transparent)] group-hover:before:opacity-100",
                    ].join(" "),
              ].join(" ")}
              aria-label={primaryAction.label}
            >
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
                <span className="absolute -left-10 top-0 h-full w-8 skew-x-[-20deg] bg-white/20 opacity-0 transition-all duration-300 group-hover:left-[110%] group-hover:opacity-100" />
              </span>

              <MI
                name={isPrimary ? "play_arrow" : "autorenew"}
                className="text-[16px] leading-none align-middle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
              />

              <span>{primaryAction.label}</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
