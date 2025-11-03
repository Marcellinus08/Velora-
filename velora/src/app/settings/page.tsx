// src/app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SettingsHeader from "@/components/settings/header";
import { SettingsPageSkeleton } from "@/components/skeletons/settings-skeleton";

// Lazy load SettingsAccount component
const SettingsAccount = dynamic(() => import("@/components/settings/account"), {
  loading: () => <div className="mt-6" />,
  ssr: true,
});

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  // Simulate initial load time
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <SettingsHeader />
        <div className="mt-6">
          <SettingsAccount />
        </div>
      </main>
    </div>
  );
}
