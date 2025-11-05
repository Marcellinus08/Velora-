// src/components/studio/header.tsx
"use client";

export default function StudioHeader() {
  return (
    <div className="relative">
      {/* Gradient background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 rounded-3xl blur-2xl opacity-50" />
      
      <div className="relative flex flex-col gap-3 py-4">
        {/* Studio icon and badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm">
            <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
                Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-300 border border-purple-500/30">
                Creator Hub
              </span>
            </div>
            <p className="text-sm text-neutral-400 mt-1">
              Manage your content, campaigns, and earnings in one place
            </p>
          </div>
        </div>

        {/* Decorative line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mt-2" />
      </div>
    </div>
  );
}
