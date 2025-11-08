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
    <section className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Upload & Publish</h3>
          <p className="text-xs text-neutral-400">Complete your video upload</p>
        </div>
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-neutral-200">Uploading…</span>
            <span className="text-purple-300 font-bold">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800/50 border border-purple-500/20">
            <div
              className="h-2.5 bg-gradient-to-r from-purple-500 to-purple-600 transition-all shadow-lg shadow-purple-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onStartUpload}
          disabled={!canStart}
          aria-disabled={!canStart}
          className="inline-flex items-center gap-2 justify-center rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Start Upload
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 justify-center rounded-lg border border-neutral-600/50 bg-neutral-900/50 px-6 py-2.5 text-sm font-bold text-neutral-200 hover:bg-neutral-800/50 hover:border-neutral-500 transition-all"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v4l5-5-5-5v4z" />
          </svg>
          Reset
        </button>
      </div>
    </section>
  );
}
