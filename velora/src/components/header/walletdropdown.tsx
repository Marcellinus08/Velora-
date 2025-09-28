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

const short = (addr?: `0x${string}`) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "-";

export default function WalletDropdown({
  address,
  avatarUrl,
  username,
}: {
  address?: `0x${string}`;
  avatarUrl?: string | null;
  username?: string | null;
}) {
  const router = useRouter();
  const { logout } = useLoginWithAbstract();
  const [openFeedback, setOpenFeedback] = useState(false);

  const itemCls = "px-3 py-2 text-[13px]";

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
              <AvatarTrigger avatarUrl={avatarUrl} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="bottom"
            className="w-72 p-0 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
              <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-[var(--primary-500)]">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AbstractProfile
                    size="xs"
                    showTooltip={false}
                    className="!h-8 !w-8"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-neutral-100">
                  {username ?? short(address)}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{short(address)}</span>
                  <button
                    className="rounded p-1 hover:bg-neutral-800"
                    aria-label="Copy address"
                    title="Copy address"
                    onClick={() => {
                      if (address) navigator.clipboard?.writeText(address);
                    }}
                  >
                    <MI name="content_copy" className="text-[16px]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="py-1">
              <DropdownMenuItem
                className={itemCls}
                onClick={() => router.push("/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className={itemCls}
                onClick={() => router.push("/studio")}
              >
                Studio
              </DropdownMenuItem>
              <DropdownMenuItem
                className={itemCls}
                onClick={() => router.push("/settings")}
              >
                Setting
              </DropdownMenuItem>

              <div className="h-px my-0.5 bg-neutral-800" />

              {/* Open feedback modal (no navigation) */}
              <DropdownMenuItem
                className={itemCls}
                onClick={() => setOpenFeedback(true)}
              >
                Feedback
              </DropdownMenuItem>

              <div className="h-px my-0.5 bg-neutral-800" />
              <DropdownMenuItem
                className={itemCls + " text-destructive"}
                onClick={() => logout()}
              >
                Disconnect
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal open={openFeedback} onClose={() => setOpenFeedback(false)} />
    </>
  );
}
