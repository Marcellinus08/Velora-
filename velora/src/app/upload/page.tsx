"use client";

import Header from "@/components/header";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ---------- Config ---------- */
const ACCEPT =
  "video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska";
const MAX_SIZE_MB = 1024; // 1 GB
const CATEGORIES = [
  "Education",
  "Technology",
  "Cooking",
  "Gaming",
  "Sports",
  "Travel",
  "Music",
  "Photography",
  "Finance",
  "Comedy",
  "News",
  "Lifestyle",
  "How-to & Style",
  "Film & Animation",
];

const fmtBytes = (n: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};
/* ---------------------------- */

export default function UploadVideoPage() {
  const router = useRouter();

  // File & preview
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<string>("-");
  const [error, setError] = useState<string>("");

  // Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(""); // ← placeholder default

  // Thumbnail (optional capture from player)
  const [thumbURL, setThumbURL] = useState<string | null>(null);

  // Upload simulation
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // cleanup preview URLs/timers
  useEffect(() => {
    return () => {
      if (fileURL) URL.revokeObjectURL(fileURL);
      if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
      if (timer.current) clearInterval(timer.current);
    };
  }, [fileURL, thumbURL]);

  function setVideoFile(f?: File) {
    setError("");
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Maximum file size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setFileURL((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setThumbURL(null);
    setProgress(0);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setVideoFile(f);
  }
  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    setVideoFile(f);
  }
  function onDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  function onLoadedMeta() {
    const vid = videoRef.current;
    if (!vid) return;
    const d = Math.floor(vid.duration || 0);
    const mm = Math.floor(d / 60).toString().padStart(2, "0");
    const ss = Math.floor(d % 60).toString().padStart(2, "0");
    setDuration(`${mm}:${ss}`);
  }

  function captureThumb() {
    const vid = videoRef.current;
    if (!vid) return;
    const canvas = document.createElement("canvas");
    const ratio = vid.videoWidth / vid.videoHeight || 16 / 9;
    const w = 640;
    const h = Math.round(w / ratio);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(vid, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
      setThumbURL(url);
    }, "image/jpeg");
  }

  function startUpload() {
    if (!file || !title.trim() || !category) return;
    setUploading(true);
    setProgress(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.max(1, Math.round((100 - p) * 0.07));
        if (next >= 100) {
          clearInterval(timer.current!);
          return 100;
        }
        return next;
      });
    }, 120);
  }

  function resetAll() {
    setFile(null);
    if (fileURL) URL.revokeObjectURL(fileURL);
    setFileURL(null);
    setTitle("");
    setDescription("");
    setCategory(""); // reset ke placeholder
    setThumbURL(null);
    setProgress(0);
    setUploading(false);
    setError("");
  }

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setUploading(false), 400);
    }
  }, [progress]);

  const canStart = !!file && title.trim() !== "" && category !== "" && !uploading;

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-50">
          Upload Video
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Select a video file, fill the details, then start upload (demo only).
        </p>

        {/* Layout: grid 12 kolom */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: File & Preview */}
          <section className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-neutral-200">
              File
            </h2>

            {!file && (
              <label
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-950 p-8 text-center transition-colors hover:border-neutral-600"
              >
                <input type="file" accept={ACCEPT} onChange={onInputChange} className="hidden" />
                <svg className="mb-3 h-10 w-10 text-neutral-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 12h-2V6H7v6H5l7 7 7-7zM5 4h14v2H5z" />
                </svg>
                <div className="text-neutral-200">
                  Drag & drop video here, or <span className="underline">browse</span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Accepted: MP4, WebM, MOV, MKV (max {MAX_SIZE_MB} MB)
                </div>
              </label>
            )}

            {file && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm">
                  <div className="truncate text-neutral-200">{file.name}</div>
                  <div className="ml-3 shrink-0 text-neutral-400">{fmtBytes(file.size)}</div>
                </div>

                {fileURL && (
                  <video
                    ref={videoRef}
                    src={fileURL}
                    controls
                    onLoadedMetadata={onLoadedMeta}
                    className="aspect-video w-full rounded-lg border border-neutral-800 bg-black"
                  />
                )}

                <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
                  <span>Duration: {duration}</span>
                  <span className="h-4 w-px bg-neutral-800" />
                  <button
                    type="button"
                    onClick={captureThumb}
                    className="rounded-md bg-neutral-800 px-3 py-1.5 text-neutral-200 hover:bg-neutral-700"
                  >
                    Capture Thumbnail
                  </button>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-md bg-neutral-800 px-3 py-1.5 text-neutral-200 hover:bg-neutral-700"
                  >
                    Replace File
                  </button>
                </div>

                {thumbURL && (
                  <div>
                    <p className="mb-2 text-sm text-neutral-300">Thumbnail</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbURL}
                      alt="Thumbnail preview"
                      className="max-h-48 w-full rounded-lg border border-neutral-800 object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-800/50 bg-red-900/20 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}
          </section>

          {/* RIGHT: Details + Upload */}
          <div className="lg:col-span-5 space-y-6">
            <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-neutral-200">Details</h3>

              <div className="mt-3 space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-neutral-300">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your video a descriptive title"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-neutral-300">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Tell viewers about your video…"
                    className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-neutral-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className={`w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 focus:border-neutral-500 focus:outline-none ${
                      category === "" ? "text-neutral-500" : "text-neutral-100"
                    }`}
                  >
                    <option value="" disabled>
                      — Select category —
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

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
                  onClick={startUpload}
                  disabled={!canStart}
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-700"
                >
                  Start Upload
                </button>
                <button
                  onClick={resetAll}
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-700"
                >
                  Reset
                </button>
                {progress === 100 && (
                  <button
                    onClick={() => router.push("/studio")}
                    className="inline-flex items-center justify-center rounded-xl bg-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-600"
                  >
                    Go to Studio
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs text-neutral-500">
                This page is a front-end demo. Replace the progress simulation
                with your real upload API when ready.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
