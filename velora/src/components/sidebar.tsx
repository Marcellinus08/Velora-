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

  return (
    <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 flex-shrink-0 flex-col gap-y-2 overflow-y-auto border-r border-solid border-neutral-800 bg-neutral-900 px-3 py-4 md:flex">
      <nav className="flex flex-col gap-1">
        {/* Homepage */}
        <Link
          href="/"
          aria-current={isActive("/") ? "page" : undefined}
          className={`${base} ${isActive("/") ? activeCls : inactiveCls}`}
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
          <span>Homepage</span>
        </Link>

        {/* Subscription */}
        <Link
          href="/subscription" /* ganti ke "/subcription" jika folder route kamu memang pakai ejaan itu */
          aria-current={isActive("/subscription") ? "page" : undefined}
          className={`${base} ${isActive("/subscription") ? activeCls : inactiveCls}`}
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.062 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          <span>Subscription</span>
        </Link>

        {/* Meet */}
        <Link
          href="/meet"
          aria-current={isActive("/meet") ? "page" : undefined}
          className={`${base} ${isActive("/meet") ? activeCls : inactiveCls}`}
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106A1 1 0 0016 8v4a1 1 0 00.553.894l2 1A1 1 0 0020 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
          </svg>
          <span>Meet</span>
        </Link>

        {/* Leaderboard */}
        <Link
          href="/leaderboard"
          aria-current={isActive("/leaderboard") ? "page" : undefined}
          className={`${base} ${isActive("/leaderboard") ? activeCls : inactiveCls}`}
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
            ></path>
          </svg>
          <span>Leaderboard</span>
        </Link>

        {/* Community */}
        <Link
          href="/community"
          aria-current={isActive("/community") ? "page" : undefined}
          className={`${base} ${isActive("/community") ? activeCls : inactiveCls}`}
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
            ></path>
          </svg>
          <span>Community</span>
        </Link>
      </nav>
    </aside>
  );
}
