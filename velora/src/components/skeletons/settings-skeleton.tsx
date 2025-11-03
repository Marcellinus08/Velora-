// src/components/skeletons/settings-skeleton.tsx
"use client";

/**
 * Skeleton components untuk halaman settings
 * Menampilkan loading state yang match dengan design settings page
 */

/**
 * SettingsHeaderSkeleton
 * Skeleton untuk settings header
 */
export function SettingsHeaderSkeleton() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-lg shadow-black/50">
      <div className="skel h-8 w-48 rounded mb-2" />
      <div className="skel h-4 w-96 rounded mt-3" />
    </section>
  );
}

/**
 * SettingsAccountSkeleton
 * Skeleton untuk account settings form
 * Mencakup: avatar picker, username input, availability check, save button
 */
export function SettingsAccountSkeleton() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-6 shadow-lg shadow-black/50">
      {/* Title */}
      <div className="skel h-5 w-32 rounded mb-6" />

      {/* Avatar section */}
      <div className="mb-6 flex items-center gap-4">
        {/* Avatar circle */}
        <div className="skel h-20 w-20 rounded-full ring-2 ring-neutral-700" />

        {/* Avatar controls */}
        <div className="flex-1 space-y-3">
          {/* Choose button */}
          <div className="skel h-10 w-32 rounded-lg" />

          {/* Help text lines */}
          <div className="space-y-2">
            <div className="skel h-3 w-64 rounded" />
            <div className="skel h-3 w-48 rounded" />
          </div>
        </div>
      </div>

      {/* Username section */}
      <div className="space-y-3">
        {/* Label */}
        <div className="skel h-4 w-24 rounded" />

        {/* Input field */}
        <div className="skel h-10 w-full rounded-lg" />

        {/* Availability status */}
        <div className="skel h-3 w-40 rounded" />
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        {/* Save button */}
        <div className="skel h-10 w-24 rounded-xl" />

        {/* Hint/message */}
        <div className="skel h-4 w-32 rounded" />
      </div>
    </section>
  );
}

/**
 * SettingsPageSkeleton
 * Full page skeleton untuk settings halaman
 */
export function SettingsPageSkeleton() {
  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <SettingsHeaderSkeleton />

          {/* Account settings skeleton */}
          <div className="mt-6">
            <SettingsAccountSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
