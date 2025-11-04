// src/components/skeletons/settings-skeleton.tsx
"use client";

/**
 * Skeleton components untuk halaman settings
 * Menampilkan loading state yang match dengan design settings page
 */

/**
 * SettingsHeaderSkeleton
 * Skeleton untuk settings header dengan staggered delays
 */
export function SettingsHeaderSkeleton() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 shadow-lg shadow-black/50">
      <div className="skel h-8 w-48 rounded mb-2" style={{ animationDelay: '0.05s' }} />
      <div className="skel h-4 w-96 rounded mt-3" style={{ animationDelay: '0.1s' }} />
    </section>
  );
}

/**
 * SettingsAccountSkeleton
 * Skeleton untuk account settings form
 * Mencakup: avatar picker, username input, availability check, save button
 * dengan staggered animation delays
 */
export function SettingsAccountSkeleton() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-6 shadow-lg shadow-black/50">
      {/* Title */}
      <div className="skel h-5 w-32 rounded mb-6" style={{ animationDelay: '0.05s' }} />

      {/* Avatar section */}
      <div className="mb-6 flex items-center gap-4">
        {/* Avatar circle */}
        <div className="skel h-20 w-20 rounded-full ring-2 ring-neutral-700" style={{ animationDelay: '0.1s' }} />

        {/* Avatar controls */}
        <div className="flex-1 space-y-3">
          {/* Choose button */}
          <div className="skel h-10 w-32 rounded-lg" style={{ animationDelay: '0.15s' }} />

          {/* Help text lines */}
          <div className="space-y-2">
            <div className="skel h-3 w-64 rounded" style={{ animationDelay: '0.2s' }} />
            <div className="skel h-3 w-48 rounded" style={{ animationDelay: '0.25s' }} />
          </div>
        </div>
      </div>

      {/* Username section */}
      <div className="space-y-3">
        {/* Label */}
        <div className="skel h-4 w-24 rounded" style={{ animationDelay: '0.15s' }} />

        {/* Input field */}
        <div className="skel h-10 w-full rounded-lg" style={{ animationDelay: '0.2s' }} />

        {/* Availability status */}
        <div className="skel h-3 w-40 rounded" style={{ animationDelay: '0.25s' }} />
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        {/* Save button */}
        <div className="skel h-10 w-24 rounded-xl" style={{ animationDelay: '0.3s' }} />

        {/* Hint/message */}
        <div className="skel h-4 w-32 rounded" style={{ animationDelay: '0.35s' }} />
      </div>
    </section>
  );
}

/**
 * SettingsPageSkeleton
 * Full page skeleton untuk settings halaman
 * dengan background elements dan staggered animation
 */
export function SettingsPageSkeleton() {
  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Background decorative elements - matching other pages */}
        <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        </div>

        <div className="space-y-6">
          {/* Header skeleton */}
          <SettingsHeaderSkeleton />

          {/* Account settings skeleton */}
          <div className="relative mt-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-blue-500/3 to-pink-500/3 rounded-2xl blur-xl" />
            <div className="relative">
              <SettingsAccountSkeleton />
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="fixed bottom-8 right-8 opacity-20 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }} />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20 animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
          </div>
        </div>
      </main>
    </div>
  );
}
