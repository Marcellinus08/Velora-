"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AvatarTrigger from "./avatartrigger";
import { AbstractProfile } from "@/components/abstract-profile";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { MI } from "./MI";
import FeedbackModal from "@/components/feedback/modal";
import { NotificationSheet } from "./notification-sheet";
import { useNotifications } from "@/hooks/use-notifications";

const short = (addr?: `0x${string}`) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "-";

export default function WalletDropdown({
  address,
  avatarUrl,
  username,
  avatarLoading = false,
}: {
  address?: `0x${string}`;
  avatarUrl?: string | null;
  username?: string | null;
  avatarLoading?: boolean;
}) {
  const router = useRouter();
  const { logout } = useLoginWithAbstract();
  const [openFeedback, setOpenFeedback] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const { unreadCount } = useNotifications(address);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
              aria-label="Open wallet menu"
              title="Open wallet menu"
              type="button"
            >
              <AvatarTrigger avatarUrl={avatarUrl} avatarLoading={avatarLoading} address={address} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="bottom"
            className="w-64 p-0 overflow-hidden border-neutral-700/50 bg-neutral-900/95 backdrop-blur-xl shadow-2xl max-sm:w-[180px] max-sm:max-w-[calc(100vw-2rem)] md:w-64"
          >
            {/* Header with gradient background */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-neutral-900 to-neutral-900 border-b border-purple-500/20">
              <div className="flex items-center gap-3 px-3 py-2.5 max-sm:gap-1.5 max-sm:px-2 max-sm:py-1.5 md:gap-3 md:px-3 md:py-2.5">
                <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-purple-500/40 shadow-lg flex-shrink-0 max-sm:h-8 max-sm:w-8 max-sm:ring-1 md:h-11 md:w-11">
                  {avatarLoading ? (
                    // ✅ Loading: show skeleton
                    <div className="skel h-full w-full rounded-full" />
                  ) : avatarUrl && !imgError ? (
                    // Dari DB - with error handling
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      onError={() => {
                        console.warn(`Failed to load avatar in dropdown: ${avatarUrl}`);
                        setImgError(true);
                      }}
                    />
                  ) : (
                    // Fallback: AbstractProfile (jika tidak ada di DB atau error)
                    <AbstractProfile
                      address={address}
                      size="xs"
                      showTooltip={false}
                      className="!h-12 !w-12 max-sm:!h-8 max-sm:!w-8 md:!h-11 md:!w-11"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-base font-bold text-neutral-50 max-sm:text-[11px] md:text-sm">
                    {username ?? short(address)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 max-sm:gap-0.5 max-sm:mt-0 md:gap-2 md:mt-1">
                    <span className="text-sm font-mono text-neutral-400 max-sm:text-[9px] md:text-xs">{short(address)}</span>
                    {copied ? (
                      <div className="flex items-center gap-1 text-green-400 max-sm:gap-0.5 md:gap-1">
                        <svg className="h-4 w-4 max-sm:h-2.5 max-sm:w-2.5 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium whitespace-nowrap max-sm:text-[9px] md:text-xs">Copied!</span>
                      </div>
                    ) : (
                      <button
                        className="rounded p-0.5 hover:bg-neutral-800/60 transition-colors group flex items-center justify-center max-sm:p-0 md:p-0.5"
                        aria-label="Copy address"
                        title="Copy address"
                        onClick={copyAddress}
                      >
                        <svg className="h-4 w-4 text-neutral-500 group-hover:text-neutral-400 transition-colors max-sm:h-2.5 max-sm:w-2.5 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="py-2 px-2 max-sm:py-1.5 max-sm:px-1.5 md:py-2 md:px-2">
              <DropdownMenuItem
                className="px-4 py-3 text-sm font-medium text-neutral-200 hover:text-neutral-50 hover:bg-neutral-800/60 rounded-lg transition-all cursor-pointer flex items-center gap-3 group max-sm:px-2.5 max-sm:py-2 max-sm:text-xs max-sm:gap-2 max-sm:rounded-md md:px-3.5 md:py-2.5 md:text-sm md:gap-2.5 md:rounded-md"
                onClick={() => router.push("/profile")}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/60 group-hover:bg-purple-500/20 transition-colors max-sm:w-6 max-sm:h-6 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                  <MI name="person" className="text-[18px] text-neutral-400 group-hover:text-purple-400 transition-colors max-sm:text-[15px] md:text-[16px]" />
                </div>
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="px-4 py-3 text-sm font-medium text-neutral-200 hover:text-neutral-50 hover:bg-neutral-800/60 rounded-lg transition-all cursor-pointer flex items-center gap-3 group max-sm:px-2.5 max-sm:py-2 max-sm:text-xs max-sm:gap-2 max-sm:rounded-md md:px-3.5 md:py-2.5 md:text-sm md:gap-2.5 md:rounded-md"
                onClick={() => router.push("/studio")}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/60 group-hover:bg-purple-500/20 transition-colors max-sm:w-6 max-sm:h-6 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                  <MI name="video_library" className="text-[18px] text-neutral-400 group-hover:text-purple-400 transition-colors max-sm:text-[15px] md:text-[16px]" />
                </div>
                <span>Studio</span>
              </DropdownMenuItem>

              {/* Notifications - Mobile Only - Moved above Settings */}
              <DropdownMenuItem
                className="md:hidden px-4 py-3 text-sm font-medium text-neutral-200 hover:text-neutral-50 hover:bg-neutral-800/60 rounded-lg transition-all cursor-pointer flex items-center gap-3 group max-sm:px-2.5 max-sm:py-2 max-sm:text-xs max-sm:gap-2 max-sm:rounded-md"
                onClick={() => setOpenNotifications(true)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/60 group-hover:bg-purple-500/20 transition-colors max-sm:w-6 max-sm:h-6 max-sm:rounded-md relative">
                  <MI name="notifications" className="text-[18px] text-neutral-400 group-hover:text-purple-400 transition-colors max-sm:text-[15px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary-500)] text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto text-xs font-semibold text-[var(--primary-500)]">{unreadCount}</span>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="px-4 py-3 text-sm font-medium text-neutral-200 hover:text-neutral-50 hover:bg-neutral-800/60 rounded-lg transition-all cursor-pointer flex items-center gap-3 group max-sm:px-2.5 max-sm:py-2 max-sm:text-xs max-sm:gap-2 max-sm:rounded-md md:px-3.5 md:py-2.5 md:text-sm md:gap-2.5 md:rounded-md"
                onClick={() => router.push("/settings")}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/60 group-hover:bg-purple-500/20 transition-colors max-sm:w-6 max-sm:h-6 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                  <MI name="settings" className="text-[18px] text-neutral-400 group-hover:text-purple-400 transition-colors max-sm:text-[15px] md:text-[16px]" />
                </div>
                <span>Setting</span>
              </DropdownMenuItem>

              <div className="h-px my-2 bg-neutral-800/50 max-sm:my-1.5 md:my-2" />

              {/* Open feedback modal (no navigation) */}
              <DropdownMenuItem
                className="px-4 py-3 text-sm font-medium text-neutral-200 hover:text-neutral-50 hover:bg-neutral-800/60 rounded-lg transition-all cursor-pointer flex items-center gap-3 group max-sm:px-2.5 max-sm:py-2 max-sm:text-xs max-sm:gap-2 max-sm:rounded-md md:px-3.5 md:py-2.5 md:text-sm md:gap-2.5 md:rounded-md"
                onClick={() => setOpenFeedback(true)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/60 group-hover:bg-blue-500/20 transition-colors max-sm:w-6 max-sm:h-6 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                  <MI name="feedback" className="text-[18px] text-neutral-400 group-hover:text-blue-400 transition-colors max-sm:text-[15px] md:text-[16px]" />
                </div>
                <span>Feedback</span>
              </DropdownMenuItem>

              <div className="h-px my-2 bg-neutral-800/50 max-sm:my-1.5 md:my-2" />
              
              <DropdownMenuItem
                className="px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer flex items-center gap-3 group max-sm:px-2.5 max-sm:py-2 max-sm:text-xs max-sm:gap-2 max-sm:rounded-md md:px-3.5 md:py-2.5 md:text-sm md:gap-2.5 md:rounded-md"
                onClick={() => logout()}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800/60 group-hover:bg-red-500/20 transition-colors max-sm:w-6 max-sm:h-6 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                  <MI name="logout" className="text-[18px] text-red-400 group-hover:text-red-300 transition-colors max-sm:text-[15px] md:text-[16px]" />
                </div>
                <span>Disconnect</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal open={openFeedback} onClose={() => setOpenFeedback(false)} />
      
      {/* Notification Sheet - Mobile Only */}
      <NotificationSheet 
        open={openNotifications} 
        onClose={() => setOpenNotifications(false)} 
        abstractId={address}
      />
    </>
  );
}
