"use client";

import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import ProfileUpsertOnLogin from "@/components/boot/profile-upsert-on-login";

import { MI } from "./MI";
import SearchBar from "./searchbar";
import AddMenu from "./addmenu";
import NotificationsMenu from "./notificationsmenu";
import WalletDropdown from "./walletdropdown";
import { useProfileAvatar } from "./useprofileavatar";
import { useUsdceBalance } from "./useusdcebalance";

export default function SiteHeader() {
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;

  const { username, avatarUrl } = useProfileAvatar(address as `0x${string}` | undefined);
  const usdceText = useUsdceBalance();

  return (
    <header
      className="sticky top-0 z-20 grid w-full items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 py-2 sm:px-6 lg:px-8
                 grid-cols-[auto_1fr_auto] md:[grid-template-columns:var(--sidebar-w,16rem)_1fr_auto]"
    >
      {/* Column 1: Logo */}
      <div className="flex items-center gap-4">
        <button
          className="flex items-center justify-center rounded-full p-2 text-neutral-50 hover:bg-neutral-800 md:hidden"
          aria-label="Open menu"
          type="button"
        >
          <MI name="menu" className="text-[18px] leading-none" />
        </button>

        <Link href="/" aria-label="Home">
          <Image
            src="/logo.png"
            alt="Velora Logo"
            width={512}
            height={128}
            priority
            className="h-[44px] w-auto sm:h-[42px] lg:h-[46px]"
          />
        </Link>
      </div>

      {/* Column 2: Search */}
      <SearchBar />

      {/* Column 3: Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {!isConnected ? (
          <div className="flex items-center gap-2">
            <ConnectWalletButton className="min-w-28 px-4" />
          </div>
        ) : (
          <>
            <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">
              <div className="flex items-center gap-2">
                <MI name="star" className="text-[18px] text-yellow-400" />
                <span className="text-sm font-semibold text-neutral-50">2.500</span>
              </div>
              <div className="h-5 w-px bg-neutral-700" />
              <div className="flex items-center gap-2">
                <MI name="account_balance_wallet" className="text-[18px] text-[var(--primary-500)]" />
                <span className="text-sm font-semibold text-neutral-50">USDC.e {usdceText}</span>
              </div>
            </div>

            <AddMenu />
            <NotificationsMenu unreadCount={0} />
            <WalletDropdown address={address as `0x${string}`} avatarUrl={avatarUrl} username={username} />
          </>
        )}
      </div>

      <ProfileUpsertOnLogin />
    </header>
  );
}
