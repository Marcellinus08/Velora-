// src/components/studio/header.tsx
"use client";

export default function StudioHeader() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-50">Studio</h1>
      <p className="text-sm text-neutral-400">
        Manage your uploads and ad campaigns from one place.
      </p>
    </div>
  );
}
