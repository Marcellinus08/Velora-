// src/app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SettingsHeader from "@/components/settings/header";
import { SettingsPageSkeleton } from "@/components/skeletons/settings-skeleton";

// Lazy load SettingsAccount component with proper loading skeleton
const SettingsAccount = dynamic(() => import("@/components/settings/account"), {
  loading: () => <div className="mt-6" />,
  ssr: true,
});

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  // Load initial data (simulating fetch)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Show full-page skeleton while loading (like Profile and Studio pages)
  if (loading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Background decorative elements - matching other pages */}
        <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        </div>

        {/* Header section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl" />
          <div className="relative">
            <SettingsHeader />
          </div>
        </div>

        {/* Settings Account section */}
        <div className="relative mt-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-blue-500/3 to-pink-500/3 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <SettingsAccount />
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
