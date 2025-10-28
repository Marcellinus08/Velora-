"use client";

import type { FormProps } from "./types";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function AdForm({
  title,
  description,
  media,
  mediaURL,
  durationDays,
  priceUsd,
  onChangeTitle,
  onChangeDesc,
  onChooseMedia,
  myVideos = [],
  selectedVideoId = "",
  onChangeVideoId,
  ctaText = "Watch Now",
  onChangeCtaText,
}: FormProps) {
  function handleChoose(e: React.ChangeEvent<HTMLInputElement>) {
    onChooseMedia(e.target.files?.[0] ?? null);
  }

  return (
    <section className="rounded-3xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Campaign Details</h2>
      </div>

      <div className="space-y-6">
        {/* Video Selection */}
        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            Select Video to Promote <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedVideoId}
              onChange={(e) => onChangeVideoId?.(e.target.value)}
              className="w-full rounded-xl border border-neutral-600/50 bg-neutral-800/50 backdrop-blur-sm px-4 py-3 text-neutral-100 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">-- Choose a video --</option>
              {myVideos.length > 0 ? (
                myVideos.map((video) => (
                  <option key={video.id} value={video.id} className="bg-neutral-800">
                    {video.title}
                  </option>
                ))
              ) : (
                <option disabled className="bg-neutral-800">Loading videos...</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {myVideos.length === 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              No videos found. Please upload a video first in Studio.
            </div>
          )}
        </div>

        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            Ad Title
          </label>
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="w-full rounded-xl border border-neutral-600/50 bg-neutral-800/50 backdrop-blur-sm px-4 py-3 text-neutral-100 placeholder:text-neutral-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200"
            placeholder="e.g. Learn Photography — 3-Day Promo"
          />
        </div>

        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onChangeDesc(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-xl border border-neutral-600/50 bg-neutral-800/50 backdrop-blur-sm px-4 py-3 text-neutral-100 placeholder:text-neutral-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-200"
            placeholder="Write a short, compelling description for your ad..."
          />
        </div>

        {/* CTA Button Text */}
        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            Button Text (Call-to-Action)
          </label>
          <input
            value={ctaText}
            onChange={(e) => onChangeCtaText?.(e.target.value)}
            className="w-full rounded-xl border border-neutral-600/50 bg-neutral-800/50 backdrop-blur-sm px-4 py-3 text-neutral-100 placeholder:text-neutral-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all duration-200"
            placeholder="e.g. Watch Now, Learn More, Get Started"
          />
        </div>

        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
            Upload Campaign Banner <span className="text-red-400">*</span>
          </label>

          <div className="relative">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleChoose}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-neutral-600/50 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-all duration-200 p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-neutral-200 font-medium">Click to upload carousel banner</p>
                  <p className="text-xs text-neutral-400 mt-1">PNG, JPG, MP4 up to 10MB • 16:9 ratio recommended</p>
                  <p className="text-xs text-pink-400 mt-1">Preview shows exactly how it will appear in carousel</p>
                </div>
              </div>
            </div>
          </div>
          
          {media && (
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-300 truncate">{media.name}</p>
                <p className="text-xs text-emerald-400/70">{Math.round((media.size / 1024 / 1024) * 10) / 10} MB</p>
              </div>
            </div>
          )}

          {mediaURL && (
            <div className="mt-4 rounded-xl overflow-hidden border border-neutral-600/50 bg-neutral-900">
              <p className="text-xs text-neutral-400 py-2 text-center bg-neutral-800/50">
                Preview (Same view as carousel)
              </p>
              {/* Container dengan aspect ratio yang sama dengan carousel */}
              <div className="relative w-full">
                <div className="relative w-full h-[200px] sm:h-[280px] lg:h-[360px]">
                  {media?.type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={mediaURL} 
                      alt="Carousel Preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video 
                      src={mediaURL} 
                      controls 
                      className="h-full w-full object-cover"
                    />
                  )}
                  {/* Overlay gradient sama seperti carousel */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                  
                  {/* Sponsored badge preview */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-1 rounded-full text-[11px] font-medium text-white shadow-lg">
                    <span className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Sponsored
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-neutral-700/50">
          <div className="group">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
              Campaign Duration
            </label>
            <div className="rounded-xl border border-neutral-600/50 bg-neutral-800/30 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-neutral-100 font-medium">{durationDays} days</span>
            </div>
          </div>

          <div className="group">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              Campaign Price
            </label>
            <div className="rounded-xl border border-neutral-600/50 bg-neutral-800/30 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-neutral-100 font-medium">{fmtUSD(priceUsd)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
