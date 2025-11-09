// src/components/upload/upload-panel.tsx
"use client";

type Props = {
  uploading: boolean;
  progress: number;
  canStart: boolean;
  onStartUpload: () => void;
  onReset: () => void;
};

export default function UploadActionPanel({
  uploading,
  progress,
  canStart,
  onStartUpload,
  onReset,
}: Props) {
  return (
    <section className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl max-sm:rounded-xl max-sm:p-4 md:p-5 md:rounded-xl">
      <div className="flex items-center gap-3 mb-4 max-sm:gap-2.5 max-sm:mb-3 md:gap-2.5 md:mb-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center max-sm:w-9 max-sm:h-9 max-sm:rounded-lg md:w-9 md:h-9 md:rounded-lg">
          <svg className="w-5 h-5 text-white max-sm:w-4.5 max-sm:h-4.5 md:w-4.5 md:h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white max-sm:text-base md:text-base">Upload & Publish</h3>
          <p className="text-xs text-neutral-400 max-sm:text-[11px] md:text-xs">Complete your video upload</p>
        </div>
      </div>

      {uploading && (
        <div className="mt-4 max-sm:mt-3 md:mt-3.5">
          <div className="mb-3 flex items-center justify-between text-sm max-sm:mb-2.5 max-sm:text-xs md:mb-2.5 md:text-sm">
            <span className="font-semibold text-neutral-200">Uploading…</span>
            <span className="text-purple-300 font-bold">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800/50 border border-purple-500/20 max-sm:h-2 md:h-2">
            <div
              className="h-2.5 bg-gradient-to-r from-purple-500 to-purple-600 transition-all shadow-lg shadow-purple-500/50 max-sm:h-2 md:h-2"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 max-sm:mt-4 max-sm:gap-2.5 md:mt-5 md:gap-2.5">
        <button
          onClick={onStartUpload}
          disabled={!canStart}
          aria-disabled={!canStart}
          className="inline-flex items-center gap-2 justify-center rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none max-sm:gap-1.5 max-sm:px-5 max-sm:py-2 max-sm:text-xs max-sm:rounded-md md:gap-2 md:px-5 md:py-2.5 md:text-sm md:rounded-md"
        >
          <svg className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Start Upload
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 justify-center rounded-lg border border-neutral-600/50 bg-neutral-900/50 px-6 py-2.5 text-sm font-bold text-neutral-200 hover:bg-neutral-800/50 hover:border-neutral-500 transition-all max-sm:gap-1.5 max-sm:px-5 max-sm:py-2 max-sm:text-xs max-sm:rounded-md md:gap-2 md:px-5 md:py-2.5 md:text-sm md:rounded-md"
        >
          <svg className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v4l5-5-5-5v4z" />
          </svg>
          Reset
        </button>
      </div>
    </section>
  );
}
