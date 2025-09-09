const cats = [
  "All",
  "Cooking",
  "Business",
  "Music",
  "Arts & Crafts",
  "Development",
  "Fitness",
  "Photography",
];

export default function Categories() {
  return (
    <div className="border-b border-neutral-800 pb-4">
      <div className="flex items-center gap-x-2 overflow-x-auto">
        {cats.map((c, i) => (
          <button
            key={c}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
              i === 0
                ? "bg-neutral-50 text-neutral-900"
                : "bg-neutral-800 text-neutral-50 hover:bg-neutral-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
