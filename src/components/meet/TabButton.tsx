// src/components/meet/TabButton.tsx
import React from "react";

export function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium cursor-pointer transition-colors",
        active
          ? "border-[var(--primary-500)] text-neutral-50"
          : "border-transparent text-neutral-400 hover:border-neutral-700 hover:text-neutral-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
