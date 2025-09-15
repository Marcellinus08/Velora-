"use client";

import { useEffect, useState } from "react";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { Button } from "@/components/ui/button";
import { useAccount, useBalance } from "wagmi";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AbstractProfile } from "@/components/abstract-profile";
import { useAbstractProfile } from "@/hooks/use-abstract-profile";
import { getDisplayName } from "@/lib/address-utils";

const shortAddr = (addr?: `0x${string}`) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

interface ConnectWalletButtonProps {
  className?: ClassValue;
  customDropdownItems?: React.ReactNode[];
  customTrigger?: React.ReactNode;

  dropdownAvatarSize?: "xs" | "sm" | "md" | "lg";
  dropdownAvatarClassName?: ClassValue;
}

export function ConnectWalletButton({
  className,
  customDropdownItems,
  customTrigger,
  dropdownAvatarSize = "xs",
  dropdownAvatarClassName,
}: ConnectWalletButtonProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isConnected, status, address } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({ address });
  const { login, logout } = useLoginWithAbstract();
  const { data: ap } = useAbstractProfile();

  const isConnecting = status === "connecting" || status === "reconnecting";
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  // SSR placeholder
  if (!mounted) {
    return (
      <button
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white px-5",
          "text-sm font-semibold text-neutral-900 shadow-sm"
        )}
        aria-hidden
        tabIndex={-1}
      >
        <span>Sign In</span>
        <AbstractLogo className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  // Not connected / connecting
  if (!isConnected || isConnecting) {
    return (
      <button
        onClick={isConnecting ? undefined : login}
        disabled={isConnecting}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white px-5",
          "text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-200",
          "disabled:cursor-not-allowed disabled:opacity-70",
          className
        )}
      >
        <span>{isConnecting ? "Connecting…" : "Sign In"}</span>
        <AbstractLogo className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  // Balance loading
  if (isBalanceLoading) {
    return (
      <button
        disabled
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-neutral-800 px-4",
          "text-sm font-semibold text-neutral-100"
        )}
      >
        <WalletIcon className="h-4 w-4" />
        Loading…
        <AbstractLogo className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  // Connected
  const formattedBalance = balance
    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
    : "0.0000 ETH";

  const username =
    ap?.user?.name?.trim()
      ? getDisplayName(ap.user.name, address)
      : shortAddr(address as `0x${string}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {customTrigger ? (
          <div className="cursor-pointer outline-none" role="button" tabIndex={0}>
            {customTrigger}
          </div>
        ) : (
          <Button className={cn("min-w-[160px] px-3", className)}>
            <WalletIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{formattedBalance}</span>
            <AbstractLogo className="ml-2 h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-[260px] rounded-xl p-0 overflow-hidden"
      >
        {/* Header compact */}
        <div className="px-3.5 py-2.5 border-b border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="shrink-0">
              <AbstractProfile
                size={dropdownAvatarSize}
                showTooltip={false}
                hoverScale={false}
                ring
                ringWidth={1.5}
                className={cn(dropdownAvatarClassName)}
              />
            </div>

            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[15px] sm:text-[16px] font-semibold text-neutral-100">
                {username}
              </div>

              <div className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                <span className="truncate font-mono">
                  {shortAddr(address as `0x${string}`)}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyAddress();
                  }}
                  className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-800"
                  aria-label="Copy address"
                  title={copied ? "Copied!" : "Copy"}
                >
                  {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {customDropdownItems ? (
          <div className="py-0.5">
            {customDropdownItems.map((it, idx) => (
              <div key={idx}>{it}</div>
            ))}
          </div>
        ) : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              Disconnect
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* === Icons === */
function WalletIcon({ className }: { className?: ClassValue }) {
  return (
    <svg className={cn(className)} width="16" height="16" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M128 96C92.7 96 64 124.7 64 160L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 256C576 220.7 547.3 192 512 192L136 192C122.7 192 112 181.3 112 168C112 154.7 122.7 144 136 144L520 144C533.3 144 544 133.3 544 120C544 106.7 533.3 96 520 96L128 96zM480 320C497.7 320 512 334.3 512 352C512 369.7 497.7 384 480 384C462.3 384 448 369.7 448 352C448 334.3 462.3 320 480 320z"/>
    </svg>
  );
}
function CopyIcon({ className }: { className?: ClassValue }) {
  return (
    <svg className={cn(className)} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10"/>
    </svg>
  );
}
function CheckIcon({ className }: { className?: ClassValue }) {
  return (
    <svg className={cn(className)} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function AbstractLogo({ className }: { className?: ClassValue }) {
  return (
    <svg className={cn(className)} width="20" height="18" viewBox="0 0 52 47" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M33.7221 31.0658L43.997 41.3463L39.1759 46.17L28.901 35.8895C28.0201 35.0081 26.8589 34.5273 25.6095 34.5273C24.3602 34.5273 23.199 35.0081 22.3181 35.8895L12.0432 46.17L7.22205 41.3463L17.4969 31.0658H33.7141H33.7221Z"/>
      <path fill="currentColor" d="M35.4359 28.101L49.4668 31.8591L51.2287 25.2645L37.1978 21.5065C35.9965 21.186 34.9954 20.4167 34.3708 19.335C33.7461 18.2613 33.586 17.0033 33.9063 15.8013L37.6623 1.76283L31.0713 0L27.3153 14.0385L35.4279 28.093L35.4359 28.101Z"/>
      <path fill="currentColor" d="M15.7912 28.101L1.76028 31.8591L-0.00158691 25.2645L14.0293 21.5065C15.2306 21.186 16.2316 20.4167 16.8563 19.335C17.4809 18.2613 17.6411 17.0033 17.3208 15.8013L13.5648 1.76283L20.1558 0L23.9118 14.0385L15.7992 28.093L15.7912 28.101Z"/>
    </svg>
  );
}
