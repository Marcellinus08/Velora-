"use client";
export default function MI({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-icons-round ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}
