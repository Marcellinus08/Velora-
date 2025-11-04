const cats = [
  { name: "All", icon: "🎯" },
  { name: "Cooking", icon: "👨‍🍳" },
  { name: "Business", icon: "💼" },
  { name: "Music", icon: "🎵" },
  { name: "Arts & Crafts", icon: "🎨" },
  { name: "Development", icon: "💻" },
  { name: "Fitness", icon: "💪" },
  { name: "Photography", icon: "📸" },
];

export default function Categories() {
  return (
    <div className="relative pb-3 sm:pb-4">
      {/* Categories */}
      <div className="flex items-center gap-x-1.5 sm:gap-x-2 overflow-x-auto pb-2 
                      [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cats.map((cat, i) => (
          <button
            key={cat.name}
            className={`group relative whitespace-nowrap rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-medium transition-all duration-300 cursor-pointer flex-shrink-0 ${
              i === 0
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg hover:from-purple-700 hover:to-purple-600 hover:shadow-xl"
                : "bg-neutral-800/60 text-neutral-200 hover:bg-neutral-700/80 border border-neutral-700/50 hover:border-neutral-600"
            }`}
          >
            {/* Background glow for active category */}
            {i === 0 && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300" />
            )}
            
            {/* Category content */}
            <div className="relative">
              <span className="font-medium">{cat.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Decorative bottom border */}
      <div className="mt-2 sm:mt-3 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent opacity-50" />
    </div>
  );
}
