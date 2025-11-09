// src/components/header/addmenu.tsx
"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MI } from "./MI";
import { useState, useEffect } from "react";

export default function AddMenu() {
  const router = useRouter();
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  // Prevent body scroll when mobile sheet is open
  useEffect(() => {
    if (showMobileSheet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileSheet]);

  const handleCreateAds = () => {
    setShowMobileSheet(false);
    router.push("/ads");
  };

  const handleUploadVideo = () => {
    setShowMobileSheet(false);
    router.push("/upload");
  };

  return (
    <div className="relative">
      {/* Mobile Bottom Sheet */}
      {showMobileSheet && (
        <>
          {/* Backdrop */}
          <div 
            className="max-sm:fixed max-sm:inset-0 max-sm:bg-black/60 max-sm:z-50 sm:hidden"
            onClick={() => setShowMobileSheet(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:z-[60] max-sm:bg-neutral-900 max-sm:rounded-t-2xl max-sm:shadow-2xl max-sm:animate-slide-up sm:hidden">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-neutral-700 rounded-full" />
            </div>

            {/* Options */}
            <div className="px-3 pb-8 pt-1">
              {/* Create ads */}
              <button
                onClick={handleCreateAds}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-neutral-900 hover:bg-[var(--primary-500)]/10 active:bg-[var(--primary-500)]/20 transition-all group border border-transparent hover:border-[var(--primary-500)]/30"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-800/60 group-hover:bg-[var(--primary-500)]/20 transition-colors">
                  <MI name="ads_click" className="text-[22px] text-neutral-400 group-hover:text-[var(--primary-500)] transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[15px] font-semibold text-neutral-100 group-hover:text-white transition-colors">Create ads</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Promote your content</p>
                </div>
              </button>

              {/* Upload video */}
              <button
                onClick={handleUploadVideo}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-neutral-900 hover:bg-[var(--primary-500)]/10 active:bg-[var(--primary-500)]/20 transition-all group border border-transparent hover:border-[var(--primary-500)]/30 mt-2"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-800/60 group-hover:bg-[var(--primary-500)]/20 transition-colors">
                  <MI name="file_upload" className="text-[22px] text-neutral-400 group-hover:text-[var(--primary-500)] transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[15px] font-semibold text-neutral-100 group-hover:text-white transition-colors">Upload video</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Share your content</p>
                </div>
              </button>
            </div>

            {/* Safe area bottom padding - to cover tab bar */}
            <div className="h-20" />
          </div>
        </>
      )}

      {/* Desktop/Tablet Dropdown - Hidden on Mobile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              // On mobile, prevent dropdown and show bottom sheet instead
              if (window.innerWidth < 640) {
                e.preventDefault();
                setShowMobileSheet(true);
              }
            }}
            className="flex size-8 sm:size-10 cursor-pointer border border-[var(--primary-500)] items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
            aria-label="Add"
            title="Add"
            type="button"
          >
            <MI name="add" className="text-[16px] sm:text-[18px]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" className="max-sm:hidden w-52 p-0 border-neutral-800 bg-neutral-900">
          <div className="py-2 px-2">
            <DropdownMenuItem onClick={() => router.push("/ads")} className="cursor-pointer hover:text-neutral-50 hover:bg-neutral-800 rounded-lg transition-all text-neutral-200 text-sm font-medium py-3 px-4 flex items-center gap-3 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/60 group-hover:bg-purple-500/20 transition-colors">
                <MI name="ads_click" className="text-[18px] text-neutral-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <span>Create ads</span>
            </DropdownMenuItem>

            <div className="h-px my-2 bg-neutral-800" />

            <DropdownMenuItem onClick={() => router.push("/upload")} className="cursor-pointer hover:text-neutral-50 hover:bg-neutral-800 rounded-lg transition-all text-neutral-200 text-sm font-medium py-3 px-4 flex items-center gap-3 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/60 group-hover:bg-purple-500/20 transition-colors">
                <MI name="file_upload" className="text-[18px] text-neutral-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <span>Upload video</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
