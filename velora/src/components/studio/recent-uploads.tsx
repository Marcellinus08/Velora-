"use client";

import Image from "next/image";
import { useState } from "react";
import type { StudioVideo } from "./types";

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
        className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3a2 2 0 110 4 2 2 0 010-4zm0 5a2 2 0 110 4 2 2 0 010-4zm0 5a2 2 0 110 4 2 2 0 010-4z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="block w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800/70"
          >
            Edit
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="block w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-900/30"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudioRecentUploads({
  items = [],
  showCount = 3,
}: {
  items?: StudioVideo[];
  showCount?: number;
}) {
  const fmt = new Intl.NumberFormat("en-US");

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
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-neutral-100">
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
                {fmt.format(v.views)} views • {v.date}
              </div>
            </div>

            {/* CRUD menu (replaces Public/Unlisted/Draft badge) */}
            <CrudMenu
              onEdit={() => console.log("Edit", v.id)}
              onDuplicate={() => console.log("Duplicate", v.id)}
              onDelete={() => console.log("Delete", v.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
