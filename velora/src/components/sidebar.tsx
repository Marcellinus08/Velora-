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
    "flex items-center gap-4 rounded-lg px-3 py-3 text-base font-medium transition-all duration-300 ease-out cursor-pointer"; // Meningkatkan padding dan ukuran font

  // Menggunakan warna ungu untuk teks aktif dan background ungu saat aktif
  const activeCls =
    "text-[#8a2be2] font-semibold bg-neutral-800 border-l-4 border-[#8a2be2]"; // Teks aktif dengan background dan border
  const inactiveCls =
    "text-neutral-50 hover:bg-neutral-700 hover:text-neutral-50 hover:scale-105 hover:shadow-lg";

  // Mobile bottom nav styles
  const mobileBase = "flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs font-medium transition-all duration-200 cursor-pointer min-w-[60px] md:max-lg:min-w-[80px] md:max-lg:py-3";
  const mobileActiveCls = "text-[#8a2be2] font-semibold";
  const mobileInactiveCls = "text-neutral-400 hover:text-neutral-200";

  // util ikon (Material Icons Round)
  const Icon = ({ name }: { name: string }) => (
    <span
      className="material-icons-round text-[28px] leading-none transition-transform duration-200 group-hover:scale-110 md:text-[28px]" // Meningkatkan ukuran ikon
      aria-hidden="true"
    >
      {name}
    </span>
  );

  const MobileIcon = ({ name }: { name: string }) => (
    <span
      className="material-icons-round text-[24px] leading-none md:max-lg:text-[26px]"
      aria-hidden="true"
    >
      {name}
    </span>
  );

  const navItems = [
    { href: "/", icon: "home", label: "Home" },
    { href: "/subscription", icon: "subscriptions", label: "Subscribe" },
    { href: "/meet", icon: "videocam", label: "Meet" },
    { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
    { href: "/community", icon: "forum", label: "Community" },
  ];

  return (
    <>
      {/* Desktop Sidebar - Hidden on tablet and mobile */}
      <aside className="fixed left-0 top-[57px] hidden h-[calc(100vh-57px)] w-64 flex-shrink-0 flex-col gap-y-2 overflow-y-auto border-r border-solid border-neutral-800 bg-neutral-900 px-3 py-4 lg:flex z-30">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`${base} ${isActive(item.href) ? activeCls : inactiveCls}`}
            >
              <Icon name={item.icon} />
              <span>{item.label === "Home" ? "Homepage" : item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile & Tablet Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-neutral-900 border-t border-neutral-800 safe-area-pb">
        <div className="flex items-center justify-around max-w-lg mx-auto md:max-lg:max-w-2xl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`${mobileBase} ${isActive(item.href) ? mobileActiveCls : mobileInactiveCls}`}
            >
              <MobileIcon name={item.icon} />
              <span className="text-[10px] leading-tight md:max-lg:text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
