// src/components/header/index.tsx
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
import { PointsSheet, WalletSheet } from "./wallet-panels";

import React from "react";

export default function SiteHeader() {
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;

  const { username, avatarUrl } = useProfileAvatar(
    address as `0x${string}` | undefined
  );
  const usdceText = useUsdceBalance();

  // modal states
  const [openWallet, setOpenWallet] = React.useState(false);
  const [openPoints, setOpenPoints] = React.useState(false);

  return (
    <header
      className="sticky top-0 z-20 grid w-full items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 py-2 sm:px-6 lg:px-8
                 grid-cols-[auto_1fr_auto] md:[grid-template-columns:var(--sidebar-w,16rem)_1fr_auto]"
    >
      {/* Column 1: Logo */}
      <div className="flex items-center gap-4">
        {/* Mobile menu (tetap) */}
        <button
          className="flex items-center justify-center rounded-full p-2 text-neutral-50 hover:bg-neutral-800 md:hidden"
          aria-label="Open menu"
          type="button"
        >
          <MI name="menu" className="text-[18px] leading-none" />
        </button>

        {/* Logo + brand text */}
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center gap-2 select-none"
        >
          {/* <Image
            src="/glonic_logo.png"
            alt="Glonic Logo"
            priority
            width={200}
            height={60}
            className="h-10 w-auto sm:h-11 lg:h-12"
          /> */}
          <span className="text-xs sm:text-2xl font-bold tracking-tight leading-none text-neutral-50">
            GLO
            <span className="text-[var(--primary-500)]">N</span>IC
          </span>
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
            {/* Badge ⭐ Points + USDC.e */}
            <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">

              {/* Points */}
              <button
                onClick={() => setOpenPoints(true)}
                className="group flex items-center gap-2 rounded-full px-2 py-1 outline-none transition hover:bg-neutral-700"
                aria-label="Open points"
                title="Open points"
              >
                <MI name="star" className="text-[18px] text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-neutral-50">2,500</span>
              </button>

              <div className="h-5 w-px bg-neutral-700" />

              {/* USDC.e */}
              <button
                onClick={() => setOpenWallet(true)}
                className="group flex items-center gap-2 rounded-full px-2 py-1 outline-none transition hover:bg-neutral-700"
                aria-label="Open wallet"
                title="Open wallet"
              >
                <MI name="account_balance_wallet" className="text-[18px] text-[var(--primary-500)] group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-neutral-50">USDC.e {usdceText}</span>
              </button>
            </div>

            {/* Add menu (Create Ads, Upload, Set Call Rates → /call-rates) */}
            <AddMenu />

            <NotificationsMenu unreadCount={0} />
            <WalletDropdown
              address={address as `0x${string}`}
              avatarUrl={avatarUrl}
              username={username}
            />
          </>
        )}
      </div>

      <ProfileUpsertOnLogin />

      {/* ---------- Modals ---------- */}
      <PointsSheet
        open={openPoints}
        onClose={() => setOpenPoints(false)}
        points={2500}
        level="Bronze"
        nextTarget={5000}
        portfolioPts={0}
        plPts={0}
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
