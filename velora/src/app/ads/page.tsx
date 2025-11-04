// src/app/ads/page.tsx
import type { Metadata } from "next";
import AdsClient from "./_client";

export const metadata: Metadata = {
  title: "Create Advertisement",
};

export default function AdsPage() {
  return (
    <div className="flex h-full grow flex-row pb-16 md:pb-0">
      <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
        <AdsClient />
      </main>
    </div>
  );
}
