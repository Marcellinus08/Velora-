"use client";

export const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-icons-round ${className}`} aria-hidden="true">
    {name}
  </span>
);
