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
            className="flex size-10 cursor-pointer border border-[var(--primary-500)] items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
            aria-label="Add"
            title="Add"
            type="button"
          >
            <MI name="add" className="text-[18px]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" className="w-48">
          <DropdownMenuItem onClick={() => router.push("/call-rates")} className="cursor-pointer hover:text-purple-600">
            <MI name="call" className="text-[16px]" />
            Set call rates
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/ads")} className="cursor-pointer hover:text-purple-600">
            <MI name="ads_click" className="text-[16px]" />
            Create ads
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/upload")} className="cursor-pointer hover:text-purple-600">
            <MI name="file_upload" className="text-[16px]" />
            Upload video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
