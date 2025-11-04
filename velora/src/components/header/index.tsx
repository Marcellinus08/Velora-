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
import { useUsdceBalance } from "./useusdcebalance"; // <-- ini hook baru
import { useUserPoints } from "./useuserpoints"; // <-- hook untuk total points
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
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);
  
  // Show skeleton while data is loading after connection
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
      className="fixed top-0 left-0 right-0 z-40 grid w-full items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-3 py-2.5 sm:px-4 md:px-6 lg:px-8
                 grid-cols-[auto_1fr_auto] md:[grid-template-columns:var(--sidebar-w,16rem)_1fr_auto]"
    >
      {/* Column 1: Logo */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link href="/" aria-label="Home" className="flex items-center gap-1.5 select-none cursor-pointer">
          <Image
            src="/glonic_logo_main.png"
            alt="Glonic Logo"
            priority
            width={32}
            height={32}
            className="h-8 w-8 md:h-9 md:w-9 object-contain"
          />
          <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight leading-none text-neutral-50">
            GLO<span className="text-[var(--primary-500)]">N</span>IC
          </span>
        </Link>
      </div>

      {/* Column 2: Search - Hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <SearchBar />
      </div>
      
      {/* Mobile search icon - Only visible on mobile */}
      <div className="flex md:hidden items-center justify-center">
        <button
          onClick={() => setShowMobileSearch(true)}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-colors"
          aria-label="Search"
        >
          <MI name="search" className="text-[20px]" />
        </button>
      </div>

      {/* Column 3: Right */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {!isConnected ? (
          <div className="flex items-center gap-2">
            <ConnectWalletButton className="min-w-28 px-4" />
          </div>
        ) : showWalletSkeleton ? (
          <HeaderWalletSectionSkeleton />
        ) : (
          <>
            <div className="hidden sm:flex items-center gap-2 md:gap-3 rounded-full bg-neutral-800 px-3 md:px-4 py-1.5">
              <button
                onClick={() => setOpenPoints(true)}
                className="group flex items-center gap-1.5 rounded-full px-2 py-1 outline-none transition hover:bg-neutral-700 cursor-pointer"
                aria-label="Open points"
                title="Open points"
              >
                <MI name="star" className="text-[18px] text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-neutral-50">
                  {totalPoints.toLocaleString()}
                </span>
              </button>

              <div className="h-5 w-px bg-neutral-700" />

              <button
                onClick={() => setOpenWallet(true)}
                className="group flex items-center gap-1.5 rounded-full px-2 py-1 outline-none transition hover:bg-neutral-700 cursor-pointer"
                aria-label="Open wallet"
                title="Open wallet"
              >
                <MI name="account_balance_wallet" className="text-[18px] text-[var(--primary-500)] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-neutral-50 hidden lg:inline">USDC.e</span>
                <span className="text-sm font-semibold text-neutral-50">{usdceText}</span>
              </button>
            </div>

            <AddMenu />
            <NotificationsMenu />
            <WalletDropdown address={address as `0x${string}`} avatarUrl={avatarUrl} username={username} avatarLoading={avatarLoading} />
          </>
        )}
      </div>

      <ProfileUpsertOnLogin />

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-neutral-900/95 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-2 p-3 border-b border-neutral-800">
            <button
              onClick={() => setShowMobileSearch(false)}
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-neutral-800 text-neutral-200 transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <MI name="arrow_back" className="text-[20px]" />
            </button>
            <div className="flex-1">
              <SearchBar isMobileOverlay onClose={() => setShowMobileSearch(false)} />
            </div>
          </div>
        </div>
      )}

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
