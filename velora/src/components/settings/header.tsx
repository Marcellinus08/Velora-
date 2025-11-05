// src/components/settings/header.tsx
export default function SettingsHeader() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h1 className="text-2xl font-bold text-neutral-50">Settings</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Manage your profile, privacy, and account preferences
      </p>
    </section>
  );
}
