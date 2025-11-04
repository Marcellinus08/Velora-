// src/components/header/index.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import ProfileUpsertOnLogin from "@/components/boot/profile-upsert-on-login";
import { HeaderSkeleton, HeaderWalletSectionSkeleton } from "@/components/skeletons/header-skeleton";

import { MI } from "./MI";
import SearchBar from "./searchbar";
import AddMenu from "./addmenu";
import NotificationsMenu from "./notificationsmenu";
import WalletDropdown from "./walletdropdown";
import { useProfileAvatar } from "./useprofileavatar";
import { useUsdceBalance } from "./useusdcebalance";
import { useUserPoints } from "./useuserpoints";
import { PointsSheet, WalletSheet } from "./wallet-panels";
import React, { useTransition } from "react";

export default function SiteHeader() {
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;

  const { username, avatarUrl, loading: avatarLoading } = useProfileAvatar(address as `0x${string}` | undefined);
  const usdceText = useUsdceBalance();
  const { totalPoints } = useUserPoints(address as `0x${string}` | undefined);

  const [openWallet, setOpenWallet] = React.useState(false);
  const [openPoints, setOpenPoints] = React.useState(false);
  
  const [isPending] = useTransition();
  const [wasConnected, setWasConnected] = React.useState(false);
  
  React.useEffect(() => {
    if (isConnected && !wasConnected) {
      setWasConnected(true);
    }
  }, [isConnected, wasConnected]);
  
  const showWalletSkeleton = isConnected && (!totalPoints || !usdceText);

  return (
    <header
      className="sticky top-0 z-20 grid w-full items-center gap-2 sm:gap-4 border-b border-neutral-800 bg-neutral-900 px-3 py-2 sm:px-4 sm:py-2 lg:px-8
                 grid-cols-[auto_1fr_auto] md:[grid-template-columns:var(--sidebar-w,16rem)_1fr_auto]"
    >
      {/* Column 1: Logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/" aria-label="Home" className="flex items-center gap-1.5 sm:gap-2 select-none cursor-pointer">
          <Image
            src="/glonic_logo_main.png"
            alt="Glonic Logo"
            priority
            width={200}
            height={60}
            className="h-8 w-auto sm:h-10 lg:h-8"
          />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-none text-neutral-50">
            GLO<span className="text-[var(--primary-500)]">N</span>IC
          </span>
        </Link>
      </div>

      {/* Column 2: Search */}
      <SearchBar />

      {/* Column 3: Right */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        {!isConnected ? (
          <div className="flex items-center gap-2">
            <ConnectWalletButton className="min-w-20 sm:min-w-28 px-2 sm:px-4 text-xs sm:text-sm" />
          </div>
        ) : showWalletSkeleton ? (
          <HeaderWalletSectionSkeleton />
        ) : (
          <>
            <div className="hidden items-center gap-2 sm:gap-3 lg:gap-4 rounded-full bg-neutral-800 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 md:flex">
              <button
                onClick={() => setOpenPoints(true)}
                className="group flex items-center gap-1 sm:gap-2 rounded-full px-1.5 sm:px-2 py-1 outline-none transition hover:bg-neutral-700 cursor-pointer"
                aria-label="Open points"
                title="Open points"
              >
                <MI name="star" className="text-[16px] sm:text-[18px] text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-semibold text-neutral-50">
                  {totalPoints.toLocaleString()}
                </span>
              </button>

              <div className="h-4 sm:h-5 w-px bg-neutral-700" />

              <button
                onClick={() => setOpenWallet(true)}
                className="group flex items-center gap-1 sm:gap-2 rounded-full px-1.5 sm:px-2 py-1 outline-none transition hover:bg-neutral-700 cursor-pointer"
                aria-label="Open wallet"
                title="Open wallet"
              >
                <MI name="account_balance_wallet" className="text-[16px] sm:text-[18px] text-[var(--primary-500)] group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-semibold text-neutral-50 hidden lg:inline">USDC.e {usdceText}</span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-50 lg:hidden">{usdceText}</span>
              </button>
            </div>

            <AddMenu />
            <NotificationsMenu />
            <WalletDropdown address={address as `0x${string}`} avatarUrl={avatarUrl} username={username} avatarLoading={avatarLoading} />
          </>
        )}
      </div>

      <ProfileUpsertOnLogin />

      {/* Modals */}
      <PointsSheet
        open={openPoints}
        onClose={() => setOpenPoints(false)}
        points={totalPoints}
      />
      <WalletSheet
        open={openWallet}
        onClose={() => setOpenWallet(false)}
        balanceText={usdceText}
        portfolioUsd={0}
        plUsd={0}
      />
    </header>
  );
}
