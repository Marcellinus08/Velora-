// Server Components

import Image from "next/image";
import React from "react";

/** Section wrapper */
export function SubscriptionSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <h2 className="text-xl font-semibold text-neutral-50">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Satu baris item video */
export function SubscriptionVideoRow({
  title,
  thumb,
  subtext,
  primaryAction,
}: {
  title: string;
  thumb: string;
  subtext: string;
  primaryAction: { label: string; variant?: "primary" | "secondary" };
}) {
  const isPrimary = primaryAction.variant !== "secondary";

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-800/50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-28 overflow-hidden rounded-md">
            <Image src={thumb} alt={`${title} thumbnail`} fill className="object-cover" sizes="112px" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-50">{title}</h3>
            <p className="text-sm text-neutral-400">{subtext}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={[
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white",
              isPrimary
                ? "bg-[var(--primary-500)] hover:bg-opacity-80"
                : "bg-neutral-700 hover:bg-neutral-600",
            ].join(" ")}
          >
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              {isPrimary ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.21.727A4.992 4.992 0 0010 13a5 5 0 004.9-4h-2.553a1 1 0 01-.894-1.447l1.5-2.5a1 1 0 011.788 1.062l-1.5 2.5A1 1 0 0114.053 9H16a1 1 0 011 1v2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.727-1.21z"
                />
              )}
            </svg>
            <span>{primaryAction.label}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
