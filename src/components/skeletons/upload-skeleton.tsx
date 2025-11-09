// src/components/skeletons/upload-skeleton.tsx
"use client";

export default function UploadSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6 max-sm:mb-4 md:mb-5">
        <div className="h-8 w-48 bg-neutral-700/50 rounded-lg mb-2 max-sm:h-7 max-sm:w-40 max-sm:mb-1.5 md:h-7 md:w-44 md:mb-2"></div>
        <div className="h-4 w-96 bg-neutral-800/50 rounded max-sm:h-3.5 max-sm:w-64 md:h-4 md:w-80"></div>
      </div>

      {/* Upload File Section */}
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 p-6 mb-6 max-sm:rounded-xl max-sm:p-4 max-sm:mb-4 md:p-5 md:rounded-xl md:mb-5">
        <div className="flex items-center gap-3 mb-4 max-sm:gap-2.5 max-sm:mb-3 md:gap-2.5 md:mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-700/50 max-sm:w-9 max-sm:h-9 max-sm:rounded-lg md:w-9 md:h-9 md:rounded-lg"></div>
          <div>
            <div className="h-5 w-28 bg-neutral-700/50 rounded mb-1 max-sm:h-4 max-sm:w-24 md:h-4 md:w-26"></div>
            <div className="h-3 w-40 bg-neutral-800/50 rounded max-sm:h-2.5 max-sm:w-32 md:h-3 md:w-36"></div>
          </div>
        </div>
        <div className="min-h-[260px] rounded-xl border-2 border-dashed border-neutral-600/50 bg-neutral-900/50 flex items-center justify-center max-sm:min-h-[200px] max-sm:rounded-lg md:min-h-[220px] md:rounded-lg">
          <div className="text-center">
            <div className="w-10 h-10 bg-neutral-700/50 rounded-full mx-auto mb-3 max-sm:w-8 max-sm:h-8 max-sm:mb-2.5 md:w-9 md:h-9 md:mb-2.5"></div>
            <div className="h-4 w-56 bg-neutral-700/50 rounded mx-auto mb-1 max-sm:h-3.5 max-sm:w-48 md:h-4 md:w-52"></div>
            <div className="h-3 w-44 bg-neutral-800/50 rounded mx-auto max-sm:h-2.5 max-sm:w-36 md:h-3 md:w-40"></div>
          </div>
        </div>
      </div>

      {/* Video Details Section */}
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 p-6 mb-6 max-sm:rounded-xl max-sm:p-4 max-sm:mb-4 md:p-5 md:rounded-xl md:mb-5">
        <div className="flex items-center gap-3 mb-6 max-sm:gap-2.5 max-sm:mb-4 md:gap-2.5 md:mb-5">
          <div className="w-10 h-10 rounded-xl bg-neutral-700/50 max-sm:w-9 max-sm:h-9 max-sm:rounded-lg md:w-9 md:h-9 md:rounded-lg"></div>
          <div>
            <div className="h-5 w-32 bg-neutral-700/50 rounded mb-1 max-sm:h-4 max-sm:w-28 md:h-4 md:w-30"></div>
            <div className="h-3 w-40 bg-neutral-800/50 rounded max-sm:h-2.5 max-sm:w-32 md:h-3 md:w-36"></div>
          </div>
        </div>
        
        <div className="space-y-4 max-sm:space-y-3 md:space-y-3.5">
          {/* Title field skeleton */}
          <div>
            <div className="h-4 w-12 bg-neutral-700/50 rounded mb-2 max-sm:h-3.5 max-sm:w-10 max-sm:mb-1.5 md:h-4 md:w-11 md:mb-2"></div>
            <div className="h-10 w-full bg-neutral-800/50 rounded-lg max-sm:h-9 max-sm:rounded-md md:h-10 md:rounded-md"></div>
          </div>
          
          {/* Description field skeleton */}
          <div>
            <div className="h-4 w-24 bg-neutral-700/50 rounded mb-2 max-sm:h-3.5 max-sm:w-20 max-sm:mb-1.5 md:h-4 md:w-22 md:mb-2"></div>
            <div className="h-32 w-full bg-neutral-800/50 rounded-lg max-sm:h-24 max-sm:rounded-md md:h-28 md:rounded-md"></div>
          </div>
          
          {/* Category field skeleton */}
          <div>
            <div className="h-4 w-20 bg-neutral-700/50 rounded mb-2 max-sm:h-3.5 max-sm:w-16 max-sm:mb-1.5 md:h-4 md:w-18 md:mb-2"></div>
            <div className="h-10 w-full bg-neutral-800/50 rounded-lg max-sm:h-9 max-sm:rounded-md md:h-10 md:rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 p-6 mb-6 max-sm:rounded-xl max-sm:p-4 max-sm:mb-4 md:p-5 md:rounded-xl md:mb-5">
        <div className="flex items-center justify-between mb-4 max-sm:mb-3 md:mb-3.5">
          <div className="h-5 w-36 bg-neutral-700/50 rounded max-sm:h-4 max-sm:w-32 md:h-4 md:w-34"></div>
          <div className="h-6 w-12 bg-neutral-800/50 rounded-full max-sm:h-5 max-sm:w-10 md:h-5.5 md:w-11"></div>
        </div>
        
        <div className="rounded-lg border border-neutral-700/50 bg-neutral-900/60 p-4 max-sm:p-3 max-sm:rounded-md md:p-3.5 md:rounded-md">
          <div className="flex items-center justify-between mb-3 max-sm:mb-2.5 md:mb-2.5">
            <div className="flex items-center gap-2 max-sm:gap-1.5 md:gap-2">
              <div className="w-6 h-6 rounded-full bg-neutral-700/50 max-sm:w-5 max-sm:h-5 md:w-5.5 md:h-5.5"></div>
              <div className="h-4 w-24 bg-neutral-700/50 rounded max-sm:h-3.5 max-sm:w-20 md:h-4 md:w-22"></div>
            </div>
          </div>
          <div className="h-10 w-full bg-neutral-800/50 rounded-lg mb-3 max-sm:h-9 max-sm:mb-2.5 max-sm:rounded-md md:h-10 md:mb-2.5 md:rounded-md"></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-sm:gap-1.5 md:gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-neutral-800/50 rounded-lg max-sm:h-9 max-sm:rounded-md md:h-10 md:rounded-md"></div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center max-sm:mt-4 md:mt-5">
          <div className="h-10 w-36 bg-neutral-700/50 rounded-lg max-sm:h-9 max-sm:w-32 max-sm:rounded-md md:h-10 md:w-34 md:rounded-md"></div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 p-6 mb-6 max-sm:rounded-xl max-sm:p-4 max-sm:mb-4 md:p-5 md:rounded-xl md:mb-5">
        <div className="flex items-center justify-between mb-4 max-sm:mb-3 md:mb-3.5">
          <div className="h-5 w-20 bg-neutral-700/50 rounded max-sm:h-4 max-sm:w-16 md:h-4 md:w-18"></div>
          <div className="h-3 w-48 bg-neutral-800/50 rounded max-sm:h-2.5 max-sm:w-40 md:h-3 md:w-44"></div>
        </div>
        
        <div className="mt-4 max-sm:mt-3 md:mt-3.5">
          <div className="h-3 w-32 bg-neutral-700/50 rounded mb-2 max-sm:h-2.5 max-sm:w-28 max-sm:mb-1.5 md:h-3 md:w-30 md:mb-2"></div>
          <div className="h-2 w-full bg-neutral-700/50 rounded-full max-sm:h-1.5 md:h-1.5"></div>
          <div className="mt-2 flex justify-between max-sm:mt-1.5 md:mt-2">
            <div className="h-3 w-12 bg-neutral-800/50 rounded max-sm:h-2.5 max-sm:w-10 md:h-3 md:w-11"></div>
            <div className="h-3 w-16 bg-neutral-700/50 rounded max-sm:h-2.5 max-sm:w-14 md:h-3 md:w-15"></div>
            <div className="h-3 w-14 bg-neutral-800/50 rounded max-sm:h-2.5 max-sm:w-12 md:h-3 md:w-13"></div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 max-sm:mt-3 max-sm:gap-2.5 md:mt-3.5 md:gap-3">
          <div className="rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-4 max-sm:p-3 max-sm:rounded-md md:p-3.5 md:rounded-md">
            <div className="h-3 w-20 bg-neutral-700/50 rounded mb-2 max-sm:h-2.5 max-sm:w-16 max-sm:mb-1.5 md:h-3 md:w-18 md:mb-2"></div>
            <div className="h-10 w-full bg-neutral-800/50 rounded-lg mb-3 max-sm:h-9 max-sm:mb-2.5 max-sm:rounded-md md:h-10 md:mb-2.5 md:rounded-md"></div>
            <div className="space-y-2 max-sm:space-y-1.5 md:space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-neutral-800/50 rounded max-sm:h-2.5 max-sm:w-20 md:h-3 md:w-22"></div>
                <div className="h-4 w-16 bg-neutral-700/50 rounded max-sm:h-3.5 max-sm:w-14 md:h-4 md:w-15"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-neutral-800/50 rounded max-sm:h-2.5 max-sm:w-16 md:h-3 md:w-18"></div>
                <div className="h-4 w-14 bg-neutral-700/50 rounded max-sm:h-3.5 max-sm:w-12 md:h-4 md:w-13"></div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-4 max-sm:p-3 max-sm:rounded-md md:p-3.5 md:rounded-md">
            <div className="flex justify-between mb-3 max-sm:mb-2.5 md:mb-2.5">
              <div className="h-3 w-20 bg-neutral-700/50 rounded max-sm:h-2.5 max-sm:w-16 md:h-3 md:w-18"></div>
              <div className="h-6 w-20 bg-neutral-700/50 rounded-full max-sm:h-5 max-sm:w-16 md:h-5.5 md:w-18"></div>
            </div>
            <div className="h-3 w-full bg-neutral-700/50 rounded-full mb-2 max-sm:h-2.5 max-sm:mb-1.5 md:h-2.5 md:mb-2"></div>
            <div className="grid grid-cols-3 gap-2 mt-auto max-sm:gap-1.5 md:gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-neutral-800/50 rounded-md max-sm:h-7 md:h-7.5"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload & Publish Section */}
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 p-6 max-sm:rounded-xl max-sm:p-4 md:p-5 md:rounded-xl">
        <div className="flex items-center gap-3 mb-4 max-sm:gap-2.5 max-sm:mb-3 md:gap-2.5 md:mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-700/50 max-sm:w-9 max-sm:h-9 max-sm:rounded-lg md:w-9 md:h-9 md:rounded-lg"></div>
          <div>
            <div className="h-5 w-40 bg-neutral-700/50 rounded mb-1 max-sm:h-4 max-sm:w-36 md:h-4 md:w-38"></div>
            <div className="h-3 w-44 bg-neutral-800/50 rounded max-sm:h-2.5 max-sm:w-36 md:h-3 md:w-40"></div>
          </div>
        </div>
        
        <div className="flex gap-3 max-sm:gap-2.5 md:gap-2.5">
          <div className="h-10 w-36 bg-neutral-700/50 rounded-lg max-sm:h-9 max-sm:w-32 max-sm:rounded-md md:h-10 md:w-34 md:rounded-md"></div>
          <div className="h-10 w-28 bg-neutral-800/50 rounded-lg max-sm:h-9 max-sm:w-24 max-sm:rounded-md md:h-10 md:w-26 md:rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
