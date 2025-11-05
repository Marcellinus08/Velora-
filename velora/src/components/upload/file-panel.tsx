// src/components/upload/file-panel.tsx
"use client";

import React, { forwardRef, useRef } from "react";

type Props = {
  accept: string;
  file: File | null;
  fileURL: string | null;
  duration: string;
  thumbURL: string | null;
  error?: string;
  fmtBytes: (n: number) => string;

  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
  onLoadedMeta: () => void;

  onCaptureThumb: () => void;
  onUploadThumb: (file?: File) => void;
};

const UploadFilePanel = forwardRef<HTMLVideoElement, Props>(function UploadFilePanel(
  {
    accept,
    file,
    fileURL,
    duration,
    thumbURL,
    error,
    fmtBytes,
    onInputChange,
    onDrop,
    onDragOver,
    onLoadedMeta,
    onCaptureThumb,
    onUploadThumb,
  },
  videoRef
) {
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const triggerThumbPicker = () => {
    thumbInputRef.current?.click();
  };

  const handleThumbPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    onUploadThumb(f);
    // reset input agar bisa pilih file yang sama lagi
    e.currentTarget.value = "";
  };

  return (
    <section className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 12h-2V6H7v6H5l7 7 7-7zM5 4h14v2H5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Upload File</h2>
          <p className="text-xs text-neutral-400">Select or drag video file</p>
        </div>
      </div>

      {!file && (
        <label
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-600/50 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 p-8 text-center transition-all hover:border-violet-500/50 hover:bg-violet-500/5"
        >
          <input
            type="file"
            accept={accept}
            onChange={onInputChange}
            aria-label="Choose video file"
            className="hidden"
          />
          <svg className="mb-3 h-10 w-10 text-violet-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 12h-2V6H7v6H5l7 7 7-7zM5 4h14v2H5z" />
          </svg>
          <div className="text-neutral-100">
            Drag & drop video here, or <span className="text-violet-300 underline">browse</span>
          </div>
          <div className="mt-1 text-xs text-neutral-400">Accepted: MP4, WebM, MOV, MKV</div>
        </label>
      )}

      {file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-neutral-700/50 bg-neutral-900/60 px-3 py-2 text-sm">
            <div className="truncate text-neutral-200 font-medium">{file.name}</div>
            <div className="ml-3 shrink-0 text-violet-300 font-semibold">{fmtBytes(file.size)}</div>
          </div>

          {/* grid: video (left) + thumbnail (right) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left: video + info */}
            <div className="lg:col-span-9">
              {fileURL && (
                <video
                  ref={videoRef}
                  src={fileURL}
                  controls
                  onLoadedMetadata={onLoadedMeta}
                  className="aspect-video w-full rounded-lg border border-neutral-700/50 bg-black shadow-lg"
                />
              )}
              <div className="mt-3 text-sm text-neutral-400">
                <span className="font-semibold text-neutral-300">Duration:</span> {duration}
              </div>
            </div>

            {/* Right: thumbnail preview + actions */}
            <div className="lg:col-span-3">
              <p className="mb-2 text-sm font-semibold text-violet-300">Thumbnail</p>
              <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-700/50 bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 shadow-lg">
                {thumbURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbURL} alt="Thumbnail preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-3 text-center text-xs text-neutral-400">
                    No thumbnail — capture from video or upload image.
                  </span>
                )}
              </div>

              {/* Buttons under the thumbnail box */}
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onCaptureThumb}
                  className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-3 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                >
                  Capture Thumbnail
                </button>

                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbPicked}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={triggerThumbPicker}
                  className="w-full rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all"
                >
                  Upload Thumbnail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-medium">
          <span className="text-red-400">⚠️ Error:</span> {error}
        </div>
      )}
    </section>
  );
});

export default UploadFilePanel;
