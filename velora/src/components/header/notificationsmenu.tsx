"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { MI } from "./MI";

export type Notif = {
  id: string;
  title: string;
  body?: string;
  time?: string;
  unread?: boolean;
};

export default function NotificationsMenu({ unreadCount = 0 }: { unreadCount?: number }) {
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex size-10 cursor-pointer border border-[var(--primary-500)] items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
            aria-label="Notification"
            title="Notification"
            type="button"
          >
            <MI name="notifications" className="text-[18px]" />
            {unreadCount > 0 && <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-[var(--primary-500)]" />}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" className="w-80 p-0 border-neutral-800 bg-neutral-900">
          <div className="px-4 py-3 border-b border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-100">Notifications</h3>
          </div>

          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/70">
              <MI name="notifications_none" className="text-[22px] text-neutral-300" />
            </div>
            <p className="mt-3 text-sm font-medium text-neutral-200">No notifications yet</p>
            <p className="mt-1 text-xs text-neutral-400">Notifications will appear here later.</p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
