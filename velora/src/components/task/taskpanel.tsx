function TaskPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`min-h-0 h-full rounded-lg bg-neutral-800 p-6 flex flex-col ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-50">Your Task</h2>
        <div className="flex items-center gap-2">
          <svg className="size-5 text-yellow-400" viewBox="0 0 256 256" fill="currentColor">
            <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
          </svg>
          <span className="font-semibold text-neutral-50">100 pts</span>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-bold text-neutral-50">
            1
          </div>
          <p className="font-semibold text-neutral-50">
            Which ingredient is the most essential for a great tomato sauce?
          </p>
        </div>

        <div className="space-y-3 pl-10">
          {["Fresh tomatoes", "Garlic", "Olive oil", "All of the above"].map((label) => (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-700 p-3 transition-colors hover:bg-neutral-700/50 has-[:checked]:border-[var(--primary-500)] has-[:checked]:bg-violet-900/20"
            >
              <input
                type="radio"
                name="q1"
                className="form-radio size-4 border-neutral-600 bg-neutral-800 text-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-neutral-800"
              />
              <span className="text-sm text-neutral-50">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button className="w-full rounded-full bg-[var(--primary-500)] py-2.5 text-sm font-semibold text-neutral-50 hover:bg-violet-500">
          Next
        </button>
      </div>
    </div>
  );
}

export default TaskPanel;
