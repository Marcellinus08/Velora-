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
      className={`px-3 py-3 text-sm font-medium transition-colors ${active ? "border-b-2 border-purple-500 text-neutral-50" : "border-transparent text-neutral-400 hover:text-neutral-200"}`}
    >
      {children}
    </button>
  );
}
