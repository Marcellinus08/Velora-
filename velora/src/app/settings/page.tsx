// src/app/settings/page.tsx
import SettingsHeader from "@/components/settings/header";
import SettingsAccount from "@/components/settings/account";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <SettingsHeader />

        {/* Account only (Security/Notifications/Billing, Wallet, Profile Links dihapus) */}
        <div className="mt-6">
          <SettingsAccount />
        </div>
      </main>
    </div>
  );
}
