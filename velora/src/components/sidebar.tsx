"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const base =
    "flex items-center gap-4 rounded-lg px-3 py-3 text-base font-medium transition-all duration-300 ease-out cursor-pointer";

  const activeCls =
    "text-[#8a2be2] font-semibold bg-neutral-800 border-l-4 border-[#8a2be2]";
  const inactiveCls =
    "text-neutral-50 hover:bg-neutral-700 hover:text-neutral-50 hover:scale-105 hover:shadow-lg";

  // Mobile bottom nav styles
  const mobileBase =
    "flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs font-medium transition-all duration-200 cursor-pointer flex-1";
  
  const mobileActiveCls =
    "text-[#8a2be2]";
  const mobileInactiveCls =
    "text-neutral-400 hover:text-neutral-200";

  const Icon = ({ name }: { name: string }) => (
    <span
      className="material-icons-round text-[28px] leading-none transition-transform duration-200 group-hover:scale-110"
      aria-hidden="true"
    >
      {name}
    </span>
  );

  const MobileIcon = ({ name }: { name: string }) => (
    <span
      className="material-icons-round text-[24px] leading-none"
      aria-hidden="true"
    >
      {name}
    </span>
  );

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      <Link
        href="/"
        aria-current={isActive("/") ? "page" : undefined}
        className={`${base} ${isActive("/") ? activeCls : inactiveCls}`}
      >
        <Icon name="home" />
        <span>Homepage</span>
      </Link>

      <Link
        href="/subscription"
        aria-current={isActive("/subscription") ? "page" : undefined}
        className={`${base} ${isActive("/subscription") ? activeCls : inactiveCls}`}
      >
        <Icon name="subscriptions" />
        <span>Subscription</span>
      </Link>

      <Link
        href="/meet"
        aria-current={isActive("/meet") ? "page" : undefined}
        className={`${base} ${isActive("/meet") ? activeCls : inactiveCls}`}
      >
        <Icon name="videocam" />
        <span>Meet</span>
      </Link>

      <Link
        href="/leaderboard"
        aria-current={isActive("/leaderboard") ? "page" : undefined}
        className={`${base} ${isActive("/leaderboard") ? activeCls : inactiveCls}`}
      >
        <Icon name="leaderboard" />
        <span>Leaderboard</span>
      </Link>

      <Link
        href="/community"
        aria-current={isActive("/community") ? "page" : undefined}
        className={`${base} ${isActive("/community") ? activeCls : inactiveCls}`}
      >
        <Icon name="forum" />
        <span>Community</span>
      </Link>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 flex-shrink-0 flex-col gap-y-2 overflow-y-auto border-r border-solid border-neutral-800 bg-neutral-900 px-3 py-4 md:flex">
        <NavLinks />
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-lg px-2 py-1 md:hidden safe-area-inset-bottom">
        <Link
          href="/"
          aria-current={isActive("/") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="home" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          href="/subscription"
          aria-current={isActive("/subscription") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/subscription") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="subscriptions" />
          <span className="text-[10px]">Subscription</span>
        </Link>

        <Link
          href="/meet"
          aria-current={isActive("/meet") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/meet") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="videocam" />
          <span className="text-[10px]">Meet</span>
        </Link>

        <Link
          href="/leaderboard"
          aria-current={isActive("/leaderboard") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/leaderboard") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="leaderboard" />
          <span className="text-[10px]">Leaderboard</span>
        </Link>

        <Link
          href="/community"
          aria-current={isActive("/community") ? "page" : undefined}
          className={`${mobileBase} ${isActive("/community") ? mobileActiveCls : mobileInactiveCls}`}
        >
          <MobileIcon name="forum" />
          <span className="text-[10px]">Community</span>
        </Link>
      </nav>
    </>
  );
}

export { Sidebar };
