"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { StudioVideo } from "./types";
import Swal from "sweetalert2"; // Import SweetAlert2 for confirmation dialogs
import { toast } from "@/components/ui/toast"; // Import toast for notifications
import EditVideoModal from "@/components/studio/edit-video-modal";

/* ===== Helpers ===== */
const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-icons-round ${className}`} aria-hidden="true">
    {name}
  </span>
);

const nf = new Intl.NumberFormat("en-US");
function formatUSD(n?: number) {
  if (n == null || !isFinite(n)) return "0.00";
  if (n < 1000) return n.toFixed(2);
  if (n < 1_000_000) return `${(n / 1_000).toFixed(2)}k`;
  return `${(n / 1_000_000).toFixed(2)}m`;
}

/* ===== CRUD menu small ===== */
function CrudMenu({
  onEdit,
}: {
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop & Tablet - Dropdown menu */}
      <div className="relative max-sm:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          onBlur={() => setOpen(false)}
          className="rounded-full p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 cursor-pointer"
          aria-label="Open menu"
          aria-expanded={open}
          type="button"
        >
          <MI name="more_vert" className="text-[14px] leading-none align-middle" />
        </button>

        {open && (
          <div className="absolute right-full top-0 mr-2 z-50 w-[90px] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 p-1 backdrop-blur shadow-lg">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] text-neutral-200 hover:bg-neutral-800/70 cursor-pointer"
            >
              <MI name="edit" className="text-[14px] leading-none align-middle" />
              <span>Edit</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile - Direct Edit Button */}
      <button
        onClick={onEdit}
        className="hidden max-sm:flex items-center gap-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/50 px-3 py-1.5 text-neutral-200 hover:text-white transition-all duration-200 shadow-lg backdrop-blur-sm"
        aria-label="Edit video"
        type="button"
      >
        <MI name="edit" className="text-[14px] leading-none" />
        <span className="text-xs font-medium">Edit</span>
      </button>
    </>
  );
}

/* ===== Recent uploads list ===== */
export default function StudioRecentUploads({
  items = [],
  showCount = 3,
  expanded = false,
}: {
  items?: StudioVideo[];
  showCount?: number;
  expanded?: boolean;
}) {
  const [rows, setRows] = useState<StudioVideo[]>(items);
  useEffect(() => setRows(items), [items]);

  const [editing, setEditing] = useState<null | {
    id: string;
    title: string;
    description: string | null;
  }>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl max-sm:rounded-lg border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
        <div className="p-8 max-sm:p-6 text-center">
          <div className="flex flex-col items-center gap-3 max-sm:gap-2">
            <div className="w-16 h-16 max-sm:w-12 max-sm:h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
              <svg className="w-8 h-8 max-sm:w-6 max-sm:h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-neutral-400 font-medium max-sm:text-sm">No uploads yet.</p>
            <p className="text-sm max-sm:text-xs text-neutral-500">Upload your first video to start sharing your content.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl max-sm:rounded-lg border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
        <ul className="divide-y divide-neutral-800/50">
          {(expanded ? rows : rows.slice(0, showCount)).map((v) => (
            <li key={v.id} className="group relative p-4 max-sm:p-3 hover:bg-neutral-800/20 transition-all duration-200">
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-blue-600/0 to-transparent opacity-0 group-hover:from-purple-600/5 group-hover:via-blue-600/5 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex items-center gap-4 max-sm:gap-3 max-sm:flex-col">
                {/* Thumbnail with enhanced styling */}
                <div className="relative w-32 h-20 max-sm:w-full max-sm:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800/50 border border-neutral-700/50 group-hover:border-neutral-600/50 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-purple-900/10">
                  <Image
                    src={v.thumb}
                    alt={v.title}
                    fill
                    sizes="(max-width: 639px) 100vw, 128px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={false}
                  />
                  
                  {/* Points badge */}
                  {typeof v.points === "number" && v.points > 0 && (
                    <div className="absolute top-1 left-1 max-sm:top-1.5 max-sm:left-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md border border-neutral-700/80 bg-neutral-900/90 backdrop-blur px-2 py-1 text-xs max-sm:text-[10px] font-semibold text-neutral-100">
                        <svg className="w-3 h-3 max-sm:w-2.5 max-sm:h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{nf.format(v.points)}</span>
                      </span>
                    </div>
                  )}
                  
                  {/* Duration badge */}
                  <div className="absolute bottom-1 right-1 max-sm:bottom-1.5 max-sm:right-1.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] max-sm:text-[9px] font-semibold backdrop-blur-sm bg-black/75 text-white">
                      {v.duration}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0 max-sm:w-full">
                  <h3 className="font-semibold text-base max-sm:text-sm text-neutral-50 truncate group-hover:text-white transition-colors">
                    {v.title}
                  </h3>
                  {v.description && (
                    <p className="text-sm max-sm:text-xs text-neutral-400 line-clamp-1 mt-0.5">
                      {v.description}
                    </p>
                  )}
                  
                  {/* Video Details */}
                  <div className="flex items-center gap-3 max-sm:gap-2 mt-2 text-xs max-sm:text-[11px] text-neutral-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 max-sm:w-3 max-sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{v.date}</span>
                    </div>
                  </div>
                </div>

                {/* Stats - Compact Design */}
                <div className="flex-shrink-0 flex items-center gap-4 max-sm:gap-2 max-sm:w-full max-sm:justify-between">
                  {/* Buyers */}
                  <div className="flex items-center gap-2 max-sm:gap-1.5 bg-neutral-800/50 rounded-lg px-3 py-2 max-sm:px-2 max-sm:py-1.5 border border-neutral-700/50 max-sm:flex-1">
                    <div className="text-center max-sm:flex max-sm:items-center max-sm:gap-1.5 max-sm:w-full max-sm:justify-between">
                      <p className="text-[9px] max-sm:text-[8px] text-neutral-500 font-semibold uppercase tracking-wider">Buyers</p>
                      <p className="text-xl max-sm:text-base font-bold bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent mt-0.5 max-sm:mt-0">
                        {nf.format(v.buyers ?? 0)}
                      </p>
                    </div>
                    <svg className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5 max-sm:hidden text-purple-400/60" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Revenue */}
                  <div className="flex items-center gap-2 max-sm:gap-1.5 bg-neutral-800/50 rounded-lg px-3 py-2 max-sm:px-2 max-sm:py-1.5 border border-neutral-700/50 max-sm:flex-1">
                    <div className="text-center max-sm:flex max-sm:items-center max-sm:gap-1.5 max-sm:w-full max-sm:justify-between">
                      <p className="text-[9px] max-sm:text-[8px] text-neutral-500 font-semibold uppercase tracking-wider">Revenue</p>
                      <p className="text-xl max-sm:text-base font-bold bg-gradient-to-br from-emerald-400 to-teal-400 bg-clip-text text-transparent mt-0.5 max-sm:mt-0">
                        ${formatUSD(v.revenueUsd ?? 0)}
                      </p>
                    </div>
                    <svg className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5 max-sm:hidden text-emerald-400/60" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Menu */}
                  <div className="flex items-center max-sm:absolute max-sm:top-3 max-sm:right-3">
                    <CrudMenu
                      onEdit={() =>
                        setEditing({
                          id: v.id,
                          title: v.title,
                          description: v.description ?? null,
                        })
                      }
                    />
                  </div>
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
                  ? { ...x, title: updated.title, description: updated.description ?? undefined }
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
