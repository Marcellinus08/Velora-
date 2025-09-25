// src/app/studio/page.tsx
import Sidebar from "@/components/sidebar";
import StudioHeader from "@/components/studio/header";
import StudioStats from "@/components/studio/stats";
import StudioActions from "@/components/studio/actions";
import StudioRecentPanel from "@/components/studio/recent";
import type { StudioVideo, StudioAd } from "@/components/studio/types";

export const metadata = {
  title: "Studio",
};

export default function StudioPage() {
  // Dummy data (buyers & revenueUsd opsional; bila tak ada, barisnya tak akan tampil)
  const videos: StudioVideo[] = [
    {
      id: "v1",
      title: "Cooking Masterclass: Knife Skills",
      thumb:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAoJxTecPhE_PaHpo4ZMSRgsJyjjbygHj90EAayCOOo8Z61pIDLDKnANPpOPMRJmq9pRh3GMZuQ6uk1F3nKNawraJTtfehJfC_EZ7qgQX7ktNINJtTTaNVMIDSty3QfcJigHJbB3XiHQiekgePmLgzhWdD4qqrOg1SkYCaulR27KioxNtGqHocE0ZH5NdikY51LvDifBXYWb0FaNbVIWW5BUhX2AyI6Nya7Aw0kimRjnIV-d2QKl-v9HkNwdMBubIFjjRe9LfWk-bXH",
      views: 12500,
      duration: "12:34",
      date: "2d ago",
      description: "Fundamental grips, safety, and precision techniques to speed up your prep.",
      buyers: 320,            // <-- opsional
      revenueUsd: 6400,       // <-- opsional
    },
    {
      id: "v2",
      title: "Portrait Photography: Natural Light",
      thumb:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAHrvuNync_nTfcbA8iztllr7QKztBcoVpacwu54RVKBswSfbItkTVJlz3hT84f_fPd19JQbWdWflKUR5QZhd8dnNvJ9PbUD467CPGDlp32MM7J2zKjZGdvNcFnBnUSg769Z3vxEf62UlUqigg401KvZvlTFSSHmkqrf6s3avv9qjWvIxYKX5cP8AMXFIbF6THqs5CLCJ66iZ9y9vN6xDJi6RYXOdodIArH96v7OdGhL42jSmFEiKnMxg0BQ2A_M4g3wW6O0qXmMdU-",
      views: 8800,
      duration: "08:10",
      date: "5d ago",
      description: "Find flattering angles and soft light using windows and simple reflectors.",
      buyers: 210,
      revenueUsd: 3150,
    },
    {
      id: "v3",
      title: "Food Styling for Beginners",
      thumb:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCFe4gqN3yVnS3U4O9JHjQXJfO6Gqz6o4z0H5yKkq2J8m3G5s2Bx0GtqVx7oLwG0kq9QjY2xJ4-",
      views: 5400,
      duration: "06:22",
      date: "1w ago",
      description: "Step-by-step plating and styling tricks to make dishes look irresistible.",
      buyers: 95,
      revenueUsd: 950,
    },
  ];

  const ads: StudioAd[] = [
    { id: "a1", name: "Cooking Course Launch", status: "Active", budget: "$150", spend: "$64", ctr: 3.4, date: "Running" },
    { id: "a2", name: "Portrait Workshop Promo", status: "Paused", budget: "$200", spend: "$120", ctr: 2.1, date: "Paused yesterday" },
    { id: "a3", name: "Cooking Course Launch", status: "Paused", budget: "$150", spend: "$64", ctr: 3.4, date: "Paused yesterday" },
    { id: "a4", name: "Cooking Course Launch", status: "Active", budget: "$150", spend: "$64", ctr: 3.4, date: "Running" },
    { id: "a5", name: "Portrait Workshop Promo", status: "Paused", budget: "$200", spend: "$120", ctr: 2.1, date: "Paused yesterday" },
  ];

  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <StudioHeader />

        <div className="mt-6">
          <StudioStats
            totals={{
              videos: 42,
              campaigns: 6,
              points: 2500,
              earningsUsd: 356.2,
            }}
          />
        </div>

        <div className="mt-6">
          <StudioActions />
        </div>

        <div className="mt-8">
          <StudioRecentPanel videos={videos} ads={ads} />
        </div>
      </main>
    </div>
  );
}
