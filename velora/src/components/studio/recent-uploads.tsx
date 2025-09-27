"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { StudioVideo } from "./types";
import Swal from "sweetalert2"; // Import SweetAlert2
import EditVideoModal from "@/components/studio/edit-video-modal";

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

/* ===== CRUD menu small ===== */
function CrudMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
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
        <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 p-1 backdrop-blur">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] text-neutral-200 hover:bg-neutral-800/70"
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
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] text-red-300 hover:bg-red-900/30"
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
  const [rows, setRows] = useState<StudioVideo[]>(items);
  useEffect(() => setRows(items), [items]);

  const [editing, setEditing] = useState<null | {
    id: string;
    title: string;
    description: string | null;
  }>(null);

  // Delete function to remove the video
  const handleDelete = (videoId: string) => {
    // Show SweetAlert2 for delete confirmation
    Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete the video!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'No, Keep it',
      position: 'top-end', // Position to the top-right
      toast: true, // Make the alert a toast (small)
      timer: 3000, // Auto close after 3 seconds
      timerProgressBar: true, // Optional: Add a progress bar
      showConfirmButton: true, // Show confirm button
    }).then(async (result) => {
      if (result.isConfirmed) {
        // If user confirms, delete video from database
        const { error } = await fetch(`/api/studio/videos/${videoId}`, {
          method: 'DELETE',
        }).then((res) => res.json());

        if (error) {
          Swal.fire({
            text: 'There was an error deleting the video.',
            icon: 'error',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          // After successful deletion, update state and show success alert
          setRows((prev) => prev.filter((v) => v.id !== videoId));
          Swal.fire({
            text: 'The video has been deleted successfully.',
            icon: 'success',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-neutral-400">
        No uploads yet.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40">
        <ul className="divide-y divide-neutral-800">
          {rows.slice(0, showCount).map((v) => (
            <li key={v.id} className="relative flex items-start gap-3 p-3">
              {/* Thumbnail */}
              <div className="relative h-[92px] w-[164px] shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                <Image
                  src={v.thumb}
                  alt={v.title}
                  fill
                  sizes="164px"
                  className="object-cover"
                  priority={false}
                />
                {typeof v.points === "number" && (
                  <span
                    className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-[3px]
                               text-xs font-semibold text-neutral-100 ring-1 ring-black/40"
                    title={`${nf.format(v.points)} points`}
                  >
                    <MI name="star" className="text-[12px] text-yellow-400" />
                    {nf.format(v.points)}
                  </span>
                )}
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

              {/* Top-right: small icons + numbers (left of ⋮ button) */}
              <div className="ml-auto flex items-start gap-1 pt-1">
                <div className="flex h-6 items-center gap-4 pr-1">
                  <div
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-300"
                    title={`${nf.format(v.buyers ?? 0)} buyers`}
                  >
                    <MI name="shopping_bag" className="text-[12px] leading-none -mt-px" />
                    <span className="leading-none">{nf.format(v.buyers ?? 0)}</span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-300 tabular-nums"
                    title={`${formatUSD(v.revenueUsd ?? 0)} revenue`}
                  >
                    <MI name="attach_money" className="text-[12px] leading-none -mt-px" />
                    <span className="leading-none">{formatUSD(v.revenueUsd ?? 0)}</span>
                  </div>
                </div>

                <div className="flex h-6 items-center">
                  <CrudMenu
                    onEdit={() =>
                      setEditing({
                        id: v.id,
                        title: v.title,
                        description: v.description ?? null,
                      })
                    }
                    onDelete={() => handleDelete(v.id)} // Call delete handler
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <EditVideoModal
          open={true}
          videoId={editing.id}
          initialTitle={editing.title}
          initialDescription={editing.description}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setRows((prev) =>
              prev.map((x) =>
                x.id === updated.id
                  ? { ...x, title: updated.title, description: updated.description ?? null }
                  : x
              )
            );
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
