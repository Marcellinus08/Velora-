import React from "react";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-neutral-50">Meet</h2>
      <Link
        href="/meet/call-rates"
        className="cursor-pointer flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-500)]/40"
      >
        Set call rates
      </Link>
    </div>
  );
};
