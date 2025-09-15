// src/app/ads/page.tsx
import CreateAd from "@/components/ads/create";

export const metadata = {
  title: "Create Advertisement",
};

export default function AdsPage() {
  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <CreateAd />
      </main>
    </div>
  );
}
