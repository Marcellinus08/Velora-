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
    const file = e.target.files?.[0];
    
    if (!file) {
      onChooseMedia(null);
      return;
    }
    
    // Validate file type - only allow JPG and PNG
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Invalid file type. Please upload only JPG or PNG images.');
      e.target.value = ''; // Reset input
      onChooseMedia(null);
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 10MB.');
      e.target.value = ''; // Reset input
      onChooseMedia(null);
      return;
    }
    
    onChooseMedia(file);
  }

  return (
    <section className="rounded-3xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 sm:p-8 shadow-2xl max-sm:rounded-2xl max-sm:p-4 md:p-6 md:rounded-2xl">
      {/* Points Info Banner */}
      <div className="mb-6 max-sm:mb-4 md:mb-5 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 p-4 max-sm:p-3 md:p-3.5">
        <div className="flex items-start gap-3 max-sm:gap-2 md:gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 max-sm:w-7 max-sm:h-7 md:w-7 md:h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 max-sm:w-4 max-sm:h-4 md:w-4 md:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm max-sm:text-xs md:text-sm font-semibold text-yellow-400 mb-1 max-sm:mb-0.5 md:mb-0.5">Earn Points with Every Campaign!</h3>
            <p className="text-xs max-sm:text-[11px] md:text-xs text-neutral-300 leading-relaxed">
              Create campaigns and earn <span className="font-semibold text-yellow-400">{Math.floor(priceUsd * 10)} points</span>. Points boost your ranking and unlock rewards!
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 max-sm:mb-4 max-sm:gap-2.5 md:mb-5 md:gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 max-sm:w-8 max-sm:h-8 max-sm:rounded-lg md:w-9 md:h-9 md:rounded-lg">
          <svg className="w-6 h-6 text-white max-sm:w-4 max-sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-100 max-sm:text-base md:text-lg">Campaign Details</h2>
          <p className="text-sm text-neutral-400 max-sm:text-xs md:text-sm">Fill in the details below to launch your campaign</p>
        </div>
      </div>

      <div className="space-y-6 max-sm:space-y-4 md:space-y-5">
        {/* Video Selection */}
        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200 max-sm:mb-1.5 max-sm:text-xs max-sm:gap-1.5 md:mb-2 md:text-sm md:gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 max-sm:w-1.5 max-sm:h-1.5 md:w-2 md:h-2"></div>
            Select Video to Promote <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedVideoId}
              onChange={(e) => onChangeVideoId?.(e.target.value)}
              className="w-full rounded-xl border border-neutral-600/50 bg-neutral-800/50 backdrop-blur-sm px-4 py-3 text-neutral-100 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-200 appearance-none cursor-pointer max-sm:rounded-lg max-sm:px-3 max-sm:py-2.5 max-sm:text-sm md:rounded-xl md:px-4 md:py-3 md:text-base"
              disabled={myVideos.length === 0}
            >
              <option value="">-- Choose a video --</option>
              {myVideos.length > 0 ? (
                myVideos.map((video) => (
                  <option key={video.id} value={video.id} className="bg-neutral-800">
                    {video.title}
                  </option>
                ))
              ) : (
                <option disabled className="bg-neutral-800">No videos available</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none max-sm:pr-2 md:pr-3">
              <svg className="w-5 h-5 text-neutral-400 max-sm:w-4 max-sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {myVideos.length === 0 && (
            <div className="mt-2 flex items-start gap-2 text-xs text-amber-400 max-sm:mt-1.5 max-sm:text-[11px] max-sm:gap-1.5 md:mt-2 md:text-xs md:gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 max-sm:w-3.5 max-sm:h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>
                No videos found. Please{" "}
                <a href="/studio" className="underline hover:text-amber-300 transition-colors">
                  upload a video in Studio
                </a>
                {" "}first before creating an ad campaign.
              </span>
            </div>
          )}
        </div>

        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200 max-sm:mb-1.5 max-sm:text-xs max-sm:gap-1.5 md:mb-2 md:text-sm md:gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 max-sm:w-1.5 max-sm:h-1.5 md:w-2 md:h-2"></div>
            Ad Title
          </label>
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="w-full rounded-xl border border-neutral-600/50 bg-neutral-800/50 backdrop-blur-sm px-4 py-3 text-neutral-100 placeholder:text-neutral-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 max-sm:rounded-lg max-sm:px-3 max-sm:py-2.5 max-sm:text-sm md:rounded-xl md:px-4 md:py-3 md:text-base"
            placeholder="e.g. Learn Photography — 3-Day Promo"
          />
        </div>

        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200 max-sm:mb-1.5 max-sm:text-xs max-sm:gap-1.5 md:mb-2 md:text-sm md:gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 max-sm:w-1.5 max-sm:h-1.5 md:w-2 md:h-2"></div>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onChangeDesc(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-xl border border-neutral-600/50 bg-neutral-800/50 backdrop-blur-sm px-4 py-3 text-neutral-100 placeholder:text-neutral-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-200 max-sm:rounded-lg max-sm:px-3 max-sm:py-2.5 max-sm:text-sm max-sm:rows-3 md:rounded-xl md:px-4 md:py-3 md:text-base"
            placeholder="Write a short, compelling description for your ad..."
          />
        </div>

        {/* CTA Button Text */}
        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200 max-sm:mb-1.5 max-sm:text-xs max-sm:gap-1.5 md:mb-2 md:text-sm md:gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 max-sm:w-1.5 max-sm:h-1.5 md:w-2 md:h-2"></div>
            Button Text (Call-to-Action)
          </label>
          <input
            value={ctaText}
            onChange={(e) => onChangeCtaText?.(e.target.value)}
            className="w-full rounded-xl border border-neutral-600/50 bg-neutral-800/50 backdrop-blur-sm px-4 py-3 text-neutral-100 placeholder:text-neutral-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-all duration-200 max-sm:rounded-lg max-sm:px-3 max-sm:py-2.5 max-sm:text-sm md:rounded-xl md:px-4 md:py-3 md:text-base"
            placeholder="e.g. Watch Now, Learn More, Get Started"
          />
        </div>

        <div className="group">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200 max-sm:mb-1.5 max-sm:text-xs max-sm:gap-1.5 md:mb-2 md:text-sm md:gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 max-sm:w-1.5 max-sm:h-1.5 md:w-2 md:h-2"></div>
            Upload Campaign Banner <span className="text-red-400">*</span>
          </label>

          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleChoose}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-neutral-600/50 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-all duration-200 p-6 text-center max-sm:rounded-lg max-sm:p-4 md:rounded-xl md:p-5">
              <div className="flex flex-col items-center gap-3 max-sm:gap-2 md:gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center max-sm:w-10 max-sm:h-10 max-sm:rounded-lg md:w-11 md:h-11 md:rounded-lg">
                  <svg className="w-6 h-6 text-purple-400 max-sm:w-5 max-sm:h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-neutral-200 font-medium max-sm:text-sm md:text-sm">Click to upload campaign banner</p>
                  <p className="text-xs text-neutral-400 mt-1 max-sm:text-[11px] max-sm:mt-0.5 md:text-xs md:mt-1">PNG or JPG up to 10MB • 16:9 ratio recommended</p>
                  <p className="text-xs text-purple-400 mt-1 max-sm:text-[11px] max-sm:mt-0.5 md:text-xs md:mt-1">Preview shows exactly how it will appear in carousel</p>
                </div>
              </div>
            </div>
          </div>
          
          {media && (
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-sm:mt-2 max-sm:gap-2 max-sm:p-2.5 max-sm:rounded-lg md:mt-2.5 md:gap-2.5 md:p-2.5 md:rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 max-sm:w-7 max-sm:h-7 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                <svg className="w-4 h-4 text-emerald-400 max-sm:w-3.5 max-sm:h-3.5 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-300 truncate max-sm:text-xs md:text-sm">{media.name}</p>
                <p className="text-xs text-emerald-400/70 max-sm:text-[11px] md:text-xs">{Math.round((media.size / 1024 / 1024) * 10) / 10} MB</p>
              </div>
            </div>
          )}

          {mediaURL && (
            <div className="mt-4 rounded-xl overflow-hidden border border-neutral-600/50 bg-neutral-900 max-sm:mt-3 max-sm:rounded-lg md:mt-3.5 md:rounded-lg">
              <p className="text-xs text-neutral-400 py-2 text-center bg-neutral-800/50 max-sm:text-[11px] max-sm:py-1.5 md:text-xs md:py-2">
                Preview (Same view as carousel)
              </p>
              {/* Container dengan aspect ratio yang sama dengan carousel */}
              <div className="relative w-full">
                <div className="relative w-full h-[200px] sm:h-[280px] lg:h-[360px] max-sm:h-[160px] md:h-[220px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={mediaURL} 
                    alt="Campaign Banner Preview" 
                    className="h-full w-full object-cover"
                  />
                  {/* Overlay gradient sama seperti carousel */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none max-sm:h-12 md:h-14" />
                  
                  {/* Sponsored badge preview */}
                  <div className="absolute top-3 right-3 bg-purple-600 px-2.5 py-1 rounded-full text-[11px] font-medium text-white shadow-lg max-sm:top-2 max-sm:right-2 max-sm:px-2 max-sm:py-0.5 max-sm:text-[9px] md:top-2.5 md:right-2.5 md:px-2 md:py-0.5 md:text-[10px]">
                    <span className="flex items-center gap-1 max-sm:gap-0.5 md:gap-0.5">
                      <svg className="w-2.5 h-2.5 max-sm:w-2 max-sm:h-2 md:w-2 md:h-2" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-neutral-700/50 max-sm:gap-3 max-sm:pt-3 md:gap-4 md:pt-4">
          <div className="group">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200 max-sm:mb-1.5 max-sm:text-xs max-sm:gap-1.5 md:mb-2 md:text-sm md:gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 max-sm:w-1.5 max-sm:h-1.5 md:w-2 md:h-2"></div>
              Campaign Duration
            </label>
            <div className="rounded-xl border border-neutral-600/50 bg-neutral-800/30 px-4 py-3 flex items-center gap-3 max-sm:rounded-lg max-sm:px-3 max-sm:py-2.5 max-sm:gap-2 md:rounded-lg md:px-3 md:py-2.5 md:gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center max-sm:w-7 max-sm:h-7 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                <svg className="w-4 h-4 text-indigo-400 max-sm:w-3.5 max-sm:h-3.5 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-neutral-100 font-medium max-sm:text-sm md:text-sm">{durationDays} days</span>
            </div>
          </div>

          <div className="group">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200 max-sm:mb-1.5 max-sm:text-xs max-sm:gap-1.5 md:mb-2 md:text-sm md:gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 max-sm:w-1.5 max-sm:h-1.5 md:w-2 md:h-2"></div>
              Campaign Price
            </label>
            <div className="rounded-xl border border-neutral-600/50 bg-neutral-800/30 px-4 py-3 flex items-center gap-3 max-sm:rounded-lg max-sm:px-3 max-sm:py-2.5 max-sm:gap-2 md:rounded-lg md:px-3 md:py-2.5 md:gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center max-sm:w-7 max-sm:h-7 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                <svg className="w-4 h-4 text-emerald-400 max-sm:w-3.5 max-sm:h-3.5 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-neutral-100 font-medium max-sm:text-sm md:text-sm">{fmtUSD(priceUsd)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
