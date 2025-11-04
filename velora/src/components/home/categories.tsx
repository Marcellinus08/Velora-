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
    <div className="relative pb-6">
      {/* Categories */}
      <div className="flex items-center gap-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-neutral-800 scrollbar-thumb-neutral-600">
        {cats.map((cat, i) => (
          <button
            key={cat.name}
            className={`group relative whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
              i === 0
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg hover:from-purple-700 hover:to-purple-600 hover:shadow-xl"
                : "bg-neutral-800/60 text-neutral-200 hover:bg-neutral-700/80 border border-neutral-700/50 hover:border-neutral-600"
            }`}
          >
            {/* Background glow for active category */}
            {i === 0 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300" />
            )}
            
            {/* Category content */}
            <div className="relative">
              <span className="font-medium">{cat.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Decorative bottom border */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent opacity-50" />
    </div>
  );
}
