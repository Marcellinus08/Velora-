const cats = [
  { name: "All", icon: "🎯", color: "from-purple-500 to-pink-500" },
  { name: "Cooking", icon: "👨‍🍳", color: "from-orange-500 to-red-500" },
  { name: "Business", icon: "💼", color: "from-blue-500 to-indigo-500" },
  { name: "Music", icon: "🎵", color: "from-green-500 to-teal-500" },
  { name: "Arts & Crafts", icon: "🎨", color: "from-pink-500 to-rose-500" },
  { name: "Development", icon: "💻", color: "from-cyan-500 to-blue-500" },
  { name: "Fitness", icon: "💪", color: "from-yellow-500 to-amber-500" },
  { name: "Photography", icon: "📸", color: "from-violet-500 to-purple-500" },
];

export default function Categories() {
  return (
    <div className="relative pb-6">
      {/* Categories */}
      <div className="flex items-center gap-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-neutral-800 scrollbar-thumb-neutral-600">
        {cats.map((cat, i) => (
          <button
            key={cat.name}
            className={`group relative whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer ${
              i === 0
                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg hover:shadow-xl animate-pulse hover:animate-none`
                : "bg-neutral-800/60 text-neutral-200 hover:bg-neutral-700/80 border border-neutral-700/50 hover:border-neutral-600"
            }`}
            style={i === 0 ? {} : { animationDelay: `${i * 100}ms` }}
          >
            {/* Background glow for active category */}
            {i === 0 && (
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${cat.color} opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300`} />
            )}
            
            {/* Category content */}
            <div className="relative">
              <span className="font-medium">{cat.name}</span>
            </div>

            {/* Hover effect for non-active categories */}
            {i !== 0 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-3/4 ${
              i === 0 ? "bg-white/60" : "bg-gradient-to-r from-purple-400 to-blue-400"
            }`} />
          </button>
        ))}
      </div>

      {/* Decorative bottom border */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent opacity-50" />
    </div>
  );
}
