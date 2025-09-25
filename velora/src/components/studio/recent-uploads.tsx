"use client";

import Image from "next/image";
import { useState } from "react";
import type { StudioVideo } from "./types";

/* ===== Helpers ===== */
const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-icons-round ${className}`} aria-hidden="true">
    {name}
  </span>
);

const nf = new Intl.NumberFormat("en-US");
function formatUSD(n?: number) {
  if (n == null || !isFinite(n)) return "$0";
  if (n < 1) return `$${n.toFixed(4)}`;
  if (n < 1000) return `$${n.toFixed(2)}`;
  if (n < 1_000_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${(n / 1_000_000).toFixed(1)}m`;
}

/* ===== CRUD menu kecil ===== */
function CrudMenu({
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="rounded-full p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
        aria-label="Open menu"
        aria-expanded={open}
        type="button"
      >
        <MI name="more_vert" className="text-[14px] leading-none align-middle" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800/70"
          >
            <MI name="edit" className="text-[14px] leading-none align-middle" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-300 hover:bg-red-900/30"
          >
            <MI name="delete" className="text-[14px] leading-none align-middle" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== Recent uploads list ===== */
export default function StudioRecentUploads({
  items = [],
  showCount = 3,
}: {
  items?: StudioVideo[];
  showCount?: number;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-neutral-400">
        No uploads yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40">
      <ul className="divide-y divide-neutral-800">
        {items.slice(0, showCount).map((v) => (
          <li key={v.id} className="relative flex items-start gap-3 p-3">
            {/* Thumb */}
            <div className="relative h-[92px] w-[164px] shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
              <Image
                src={v.thumb}
                alt={v.title}
                fill
                sizes="164px"
                className="object-cover"
                priority={false}
              />
              {/* Kanan-bawah: durasi */}
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] leading-none text-neutral-100">
                {v.duration}
              </span>
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-neutral-50">
                {v.title}
              </p>
              {v.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                  {v.description}
                </p>
              )}
              <div className="mt-1 text-sm text-neutral-400">
                {nf.format(v.views)} views • {v.date}
              </div>
            </div>

            {/* Kanan atas: ikon kecil + angka (kiri tombol ⋮) */}
            <div className="ml-auto flex items-start gap-1 pt-1">
              {/* Tinggi seragam supaya sejajar */}
              <div className="flex h-6 items-center gap-3 pr-1">
                {v.buyers != null && (
                  <div
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-300"
                    aria-label={`${nf.format(v.buyers)} buyers`}
                    title={`${nf.format(v.buyers)} buyers`}
                  >
                    <MI name="shopping_bag" className="text-[12px] leading-none -mt-px" />
                    <span className="leading-none">{nf.format(v.buyers)}</span>
                  </div>
                )}
                {v.revenueUsd != null && (
                  <div
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-300 tabular-nums"
                    aria-label={`${formatUSD(v.revenueUsd)} revenue`}
                    title={`${formatUSD(v.revenueUsd)} revenue`}
                  >
                    <MI name="attach_money" className="text-[12px] leading-none -mt-px" />
                    <span className="leading-none">{formatUSD(v.revenueUsd)}</span>
                  </div>
                )}
              </div>

              {/* Tombol ⋮ disamakan tinggi-nya agar rata */}
              <div className="flex h-6 items-center">
                <CrudMenu
                  onEdit={() => console.log("Edit", v.id)}
                  onDuplicate={() => console.log("Duplicate", v.id)}
                  onDelete={() => console.log("Delete", v.id)}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
