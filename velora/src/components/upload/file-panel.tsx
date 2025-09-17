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
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-neutral-200">File</h2>

      {!file && (
        <label
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-950 p-8 text-center transition-colors hover:border-neutral-600"
        >
          <input
            type="file"
            accept={accept}
            onChange={onInputChange}
            aria-label="Choose video file"
            className="hidden"
          />
          <svg className="mb-3 h-10 w-10 text-neutral-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 12h-2V6H7v6H5l7 7 7-7zM5 4h14v2H5z" />
          </svg>
          <div className="text-neutral-200">
            Drag & drop video here, or <span className="underline">browse</span>
          </div>
          <div className="mt-1 text-xs text-neutral-500">Accepted: MP4, WebM, MOV, MKV</div>
        </label>
      )}

      {file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm">
            <div className="truncate text-neutral-200">{file.name}</div>
            <div className="ml-3 shrink-0 text-neutral-400">{fmtBytes(file.size)}</div>
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
                  className="aspect-video w-full rounded-lg border border-neutral-800 bg-black"
                />
              )}
              <div className="mt-3 text-sm text-neutral-400">
                Duration: {duration}
              </div>
            </div>

            {/* Right: thumbnail preview + actions */}
            <div className="lg:col-span-3">
              <p className="mb-2 text-sm text-neutral-300">Thumbnail</p>
              <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                {thumbURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbURL} alt="Thumbnail preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-3 text-center text-xs text-neutral-500">
                    No thumbnail yet — capture from video or upload image.
                  </span>
                )}
              </div>

              {/* Buttons under the thumbnail box */}
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onCaptureThumb}
                  className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
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
                  className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
                >
                  Upload Thumbnail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-800/50 bg-red-900/20 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
    </section>
  );
});

export default UploadFilePanel;
