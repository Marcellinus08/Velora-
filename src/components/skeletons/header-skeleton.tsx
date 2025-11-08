// src/components/skeletons/header-skeleton.tsx
"use client";

/**
 * Skeleton components untuk header
 * Menampilkan loading state yang match dengan design header
 */

/**
 * HeaderLogoSkeleton
 * Skeleton untuk logo area dengan menu button
 */
export function HeaderLogoSkeleton() {
  return (
    <div className="flex items-center gap-4">
      {/* Menu button skeleton */}
      <div className="skel h-10 w-10 rounded-full md:hidden" />

      {/* Logo skeleton */}
      <div className="flex items-center gap-2 select-none">
        <div className="skel h-10 w-32 rounded sm:h-11 lg:h-8" />
      </div>
    </div>
  );
}

/**
 * HeaderSearchBarSkeleton
 * Skeleton untuk search bar
 */
export function HeaderSearchBarSkeleton() {
  return (
    <div className="skel h-10 w-full max-w-md rounded-full mx-auto" />
  );
}

/**
 * HeaderWalletSectionSkeleton
 * Skeleton untuk wallet dan points section (right side)
 */
export function HeaderWalletSectionSkeleton() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Wallet and Points Card Skeleton */}
      <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">
        {/* Points Button */}
        <div className="skel h-8 w-20 rounded-full" />

        {/* Divider */}
        <div className="h-5 w-px bg-neutral-700" />

        {/* Wallet Button */}
        <div className="skel h-8 w-32 rounded-full" />
      </div>

      {/* Add Menu Button */}
      <div className="skel h-10 w-10 rounded-full" />

      {/* Notifications Button */}
      <div className="skel h-10 w-10 rounded-full" />

      {/* Wallet Dropdown */}
      <div className="skel h-10 w-10 rounded-full" />
    </div>
  );
}

/**
 * HeaderNotConnectedSkeleton
 * Skeleton untuk state ketika wallet belum connected
 */
export function HeaderNotConnectedSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="skel h-10 w-32 rounded-lg" />
    </div>
  );
}

/**
 * HeaderSkeleton
 * Full header skeleton
 */
export function HeaderSkeleton() {
  return (
    <header
      className="sticky top-0 z-20 grid w-full items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 py-2 sm:px-6 lg:px-8
                 grid-cols-[auto_1fr_auto] md:[grid-template-columns:var(--sidebar-w,16rem)_1fr_auto]"
    >
      {/* Column 1: Logo */}
      <HeaderLogoSkeleton />

      {/* Column 2: Search */}
      <HeaderSearchBarSkeleton />

      {/* Column 3: Right */}
      <HeaderWalletSectionSkeleton />
    </header>
  );
}
