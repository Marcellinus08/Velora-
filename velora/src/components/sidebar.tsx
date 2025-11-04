"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // aktif jika path sama persis, atau berada di bawahnya (nested route)
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Desktop sidebar styles
  const base =
    "flex items-center gap-4 rounded-lg px-3 py-3 text-base font-medium transition-all duration-300 ease-out cursor-pointer";
  const activeCls =
    "text-[#8a2be2] font-semibold bg-neutral-800 border-l-4 border-[#8a2be2]";
  const inactiveCls =
    "text-neutral-50 hover:bg-neutral-700 hover:text-neutral-50 hover:scale-105 hover:shadow-lg";

  // Mobile bottom nav styles
  const mobileBase =
    "flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-all duration-200 cursor-pointer flex-1";
  const mobileActiveCls = "text-[#8a2be2] font-semibold";
  const mobileInactiveCls = "text-neutral-400 hover:text-neutral-200";

  // util ikon (Material Icons Round)
  const Icon = ({ name }: { name: string }) => (
    <span
      className="material-icons-round text-[28px] leading-none transition-transform duration-200 group-hover:scale-110 md:block hidden"
      aria-hidden="true"
    >
      {name}
    </span>
  );

  // Mobile icon - smaller
  const MobileIcon = ({ name }: { name: string }) => (
    <span
      className="material-icons-round text-[22px] leading-none"
      aria-hidden="true"
    >
      {name}
    </span>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="fixed left-0 top-[57px] hidden h-[calc(100vh-57px)] w-64 flex-shrink-0 flex-col gap-y-2 overflow-y-auto border-r border-solid border-neutral-800 bg-neutral-900 px-3 py-4 md:flex z-30">
        <nav className="flex flex-col gap-1">
          {/* Homepage */}
          <Link
            href="/"
            aria-current={isActive("/") ? "page" : undefined}
            className={`${base} ${isActive("/") ? activeCls : inactiveCls}`}
          >
            <Icon name="home" />
            <span>Homepage</span>
          </Link>

          {/* Subscription */}
          <Link
            href="/subscription"
            aria-current={isActive("/subscription") ? "page" : undefined}
            className={`${base} ${isActive("/subscription") ? activeCls : inactiveCls}`}
          >
            <Icon name="subscriptions" />
            <span>Subscription</span>
          </Link>

          {/* Meet */}
          <Link
            href="/meet"
            aria-current={isActive("/meet") ? "page" : undefined}
            className={`${base} ${isActive("/meet") ? activeCls : inactiveCls}`}
          >
            <Icon name="videocam" />
            <span>Meet</span>
          </Link>

          {/* Leaderboard */}
          <Link
            href="/leaderboard"
            aria-current={isActive("/leaderboard") ? "page" : undefined}
            className={`${base} ${isActive("/leaderboard") ? activeCls : inactiveCls}`}
          >
            <Icon name="leaderboard" />
            <span>Leaderboard</span>
          </Link>

          {/* Community */}
          <Link
            href="/community"
            aria-current={isActive("/community") ? "page" : undefined}
            className={`${base} ${isActive("/community") ? activeCls : inactiveCls}`}
          >
            <Icon name="forum" />
            <span>Community</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-lg pb-safe">
        <Link
          href="/"
          aria-current={isActive("/") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="home" />
          <span>Home</span>
        </Link>

        <Link
          href="/subscription"
          aria-current={isActive("/subscription") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/subscription") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="subscriptions" />
          <span>Subscribe</span>
        </Link>

        <Link
          href="/meet"
          aria-current={isActive("/meet") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/meet") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="videocam" />
          <span>Meet</span>
        </Link>

        <Link
          href="/leaderboard"
          aria-current={isActive("/leaderboard") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/leaderboard") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="leaderboard" />
          <span>Leaderboard</span>
        </Link>

        <Link
          href="/community"
          aria-current={isActive("/community") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/community") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="forum" />
          <span>Community</span>
        </Link>
      </nav>
    </>
  );
}
