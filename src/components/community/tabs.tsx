"use client";

import { useRef, useState, MouseEvent } from "react";

export default function CommunityTabs({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (v: string) => void;
}) {
  const tabs = [
    "All",
    "Education",
    "Technology",
    "Cooking",
    "Gaming",
    "Sports",
    "Travel",
    "Music",
    "Photography",
    "Finance",
    "Comedy",
    "News",
    "Lifestyle",
    "How-to & Style",
    "Film & Animation",
    "Podcast",
    "Other",
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTabClick = (tabName: string) => {
    if (!hasMoved) {
      onChange?.(tabName);
    }
    setHasMoved(false);
  };

  return (
    <div className="border-b border-neutral-800 max-sm:w-full">
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-x-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:w-full cursor-grab active:cursor-grabbing"
        style={{ userSelect: "none" }}
      >
        {tabs.map((t) => {
          const active = (value ?? tabs[0]) === t;
          return (
            <button
              key={t}
              onClick={() => handleTabClick(t)}
              className={[
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium cursor-pointer transition-colors max-sm:px-2.5 max-sm:py-1.5 max-sm:text-xs md:px-3 md:py-2 md:text-sm",
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
