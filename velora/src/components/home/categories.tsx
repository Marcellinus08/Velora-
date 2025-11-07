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
    <div className="relative pb-6 max-sm:pb-3 md:pb-4 lg:pb-5">
      {/* Categories */}
      <div className="flex items-center gap-x-3 overflow-x-auto pb-2 
        scrollbar-thin scrollbar-track-neutral-800 scrollbar-thumb-neutral-600
        [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        max-sm:gap-x-2 max-sm:pb-1.5 max-sm:-mx-0
        md:gap-x-2.5 md:pb-1.5 lg:gap-x-3 lg:pb-2">
        {cats.map((cat, i) => (
          <button
            key={cat.name}
            className={`group relative whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
              i === 0
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg hover:from-purple-700 hover:to-purple-600 hover:shadow-xl"
                : "bg-neutral-800/60 text-neutral-200 hover:bg-neutral-700/80 border border-neutral-700/50 hover:border-neutral-600"
            } max-sm:px-3 max-sm:py-1.5 max-sm:text-xs max-sm:rounded-lg max-sm:font-semibold
              md:px-3 md:py-2 md:text-xs md:rounded-lg lg:px-4 lg:py-2.5 lg:text-sm`}
          >
            {/* Background glow for active category */}
            {i === 0 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300
                max-sm:rounded-lg max-sm:blur-md
                md:rounded-lg md:blur-md lg:rounded-xl lg:blur-lg" />
            )}
            
            {/* Category content */}
            <div className="relative">
              <span className="font-medium">{cat.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Decorative bottom border */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent opacity-50
        max-sm:mt-2 md:mt-3 lg:mt-4" />
    </div>
  );
}
