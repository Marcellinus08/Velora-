"use client";

import { useRef, useState, MouseEvent } from "react";

const cats = [
  { name: "All", icon: "" },
  { name: "Education", icon: "" },
  { name: "Technology", icon: "" },
  { name: "Cooking", icon: "" },
  { name: "Gaming", icon: "" },
  { name: "Sports", icon: "" },
  { name: "Travel", icon: "" },
  { name: "Music", icon: "" },
  { name: "Photography", icon: "" },
  { name: "Finance", icon: "" },
  { name: "Comedy", icon: "" },
  { name: "News", icon: "" },
  { name: "Lifestyle", icon: "" },
  { name: "How-to & Style", icon: "" },
  { name: "Film & Animation", icon: "" },
  { name: "Podcast", icon: "" },
  { name: "Other", icon: "" },
];

export default function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
    setTimeout(() => setHasDragged(false), 100);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    setHasDragged(true);
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = "grab";
      }
    }
  };

  const handleCategoryClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="relative pb-6 max-sm:pb-3 w-full">
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full overflow-x-scroll overflow-y-hidden pb-4 max-sm:pb-3 scrollbar-thin scrollbar-track-neutral-800/50 scrollbar-thumb-neutral-600 hover:scrollbar-thumb-neutral-500 cursor-grab active:cursor-grabbing"
        style={{ userSelect: "none" }}
      >
        <div className="flex items-center gap-x-3 max-sm:gap-x-2 min-w-max">
          {cats.map((cat, i) => (
            <button
              key={cat.name}
              onClick={handleCategoryClick}
              className={`group relative whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
                i === 0
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg hover:from-purple-700 hover:to-purple-600 hover:shadow-xl"
                  : "bg-neutral-800/60 text-neutral-200 hover:bg-neutral-700/80 border border-neutral-700/50 hover:border-neutral-600"
              } max-sm:px-3 max-sm:py-1.5 max-sm:text-xs max-sm:rounded-lg max-sm:font-semibold`}
            >
              {i === 0 && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300 max-sm:rounded-lg max-sm:blur-md" />
              )}
              <div className="relative">
                <span className="font-medium">{cat.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent opacity-50 max-sm:mt-2" />
    </div>
  );
}