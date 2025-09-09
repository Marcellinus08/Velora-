"use client";

export default function CommunityTabs() {
  const tabs = [
    "All Topics",
    "Cooking",
    "Business",
    "Music",
    "Arts & Crafts",
    "Development",
    "Fitness",
    "Photography",
  ];

  return (
    <div className="border-b border-neutral-800">
      <div className="flex items-center gap-x-2 overflow-x-auto">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={[
              "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
              i === 0
                ? "border-[var(--primary-500)] text-neutral-50"
                : "border-transparent text-neutral-400 hover:border-neutral-700 hover:text-neutral-50",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
