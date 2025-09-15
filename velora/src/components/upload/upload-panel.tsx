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
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-neutral-200">Upload</h3>

      {uploading && (
        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-2 bg-[var(--primary-500)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onStartUpload}
          disabled={!canStart}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-700"
        >
          Start Upload
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-700"
        >
          Reset
        </button>
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Files are uploaded to Supabase Storage and metadata saved in Postgres.
      </p>
    </section>
  );
}
