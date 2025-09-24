// src/components/sidebar.tsx
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

  const base =
    "flex items-center gap-4 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  const activeCls = "bg-neutral-800 text-neutral-50";
  const inactiveCls = "text-neutral-50 hover:bg-neutral-700";

  // util ikon (Material Icons Round)
  const Icon = ({ name }: { name: string }) => (
    <span
      className="material-icons-round text-[24px] leading-none"
      aria-hidden="true"
    >
      {name}
    </span>
  );

  return (
    <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 flex-shrink-0 flex-col gap-y-2 overflow-y-auto border-r border-solid border-neutral-800 bg-neutral-900 px-3 py-4 md:flex">
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
          href="/subscription" // ganti jika route kamu ejaannya lain
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
  );
}
