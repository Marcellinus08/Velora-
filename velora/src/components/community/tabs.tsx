"use client";

export default function CommunityTabs({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (v: string) => void;
}) {
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
      <div className="flex items-center gap-x-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => {
          const active = (value ?? tabs[0]) === t;
          return (
            <button
              key={t}
              onClick={() => onChange?.(t)}
              className={[
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium cursor-pointer transition-colors max-sm:px-2.5 max-sm:py-1.5 max-sm:text-xs",
                active
                  ? "border-[var(--primary-500)] text-neutral-50"
                  : "border-transparent text-neutral-400 hover:border-neutral-700 hover:text-neutral-50",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
