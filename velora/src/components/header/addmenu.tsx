// src/components/header/addmenu.tsx
"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MI } from "./MI";

export default function AddMenu() {
  const router = useRouter();

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex size-8 sm:size-10 cursor-pointer border border-[var(--primary-500)] items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
            aria-label="Add"
            title="Add"
            type="button"
          >
            <MI name="add" className="text-[16px] sm:text-[18px]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" className="w-52 p-0 border-neutral-800 bg-neutral-900">
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
