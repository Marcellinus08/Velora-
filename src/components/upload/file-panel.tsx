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
    <section className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl max-sm:rounded-xl max-sm:p-4 md:p-5 md:rounded-xl">
      <div className="flex items-center gap-3 mb-4 max-sm:gap-2.5 max-sm:mb-3 md:gap-2.5 md:mb-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center max-sm:w-9 max-sm:h-9 max-sm:rounded-lg md:w-9 md:h-9 md:rounded-lg">
          <svg className="w-5 h-5 text-white max-sm:w-4.5 max-sm:h-4.5 md:w-4.5 md:h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 12h-2V6H7v6H5l7 7 7-7zM5 4h14v2H5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white max-sm:text-base md:text-base">Upload File</h2>
          <p className="text-xs text-neutral-400 max-sm:text-[11px] md:text-xs">Select or drag video file</p>
        </div>
      </div>

      {!file && (
        <label
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-600/50 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 p-8 text-center transition-all hover:border-violet-500/50 hover:bg-violet-500/5 max-sm:min-h-[200px] max-sm:p-6 max-sm:rounded-lg md:min-h-[220px] md:p-7 md:rounded-lg">
          <input
            type="file"
            accept={accept}
            onChange={onInputChange}
            aria-label="Choose video file"
            className="hidden"
          />
          <svg className="mb-3 h-10 w-10 text-violet-400 max-sm:h-8 max-sm:w-8 max-sm:mb-2.5 md:h-9 md:w-9 md:mb-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 12h-2V6H7v6H5l7 7 7-7zM5 4h14v2H5z" />
          </svg>
          <div className="text-neutral-100 max-sm:text-sm md:text-sm">
            Drag & drop video here, or <span className="text-violet-300 underline">browse</span>
          </div>
          <div className="mt-1 text-xs text-neutral-400 max-sm:text-[11px] md:text-xs">Accepted: MP4, WebM, MOV, MKV</div>
        </label>
      )}

      {file && (
        <div className="space-y-4 max-sm:space-y-3 md:space-y-3.5">
          <div className="flex items-center justify-between rounded-lg border border-neutral-700/50 bg-neutral-900/60 px-3 py-2 text-sm max-sm:px-2.5 max-sm:py-1.5 max-sm:text-xs md:px-2.5 md:py-2 md:text-sm">
            <div className="truncate text-neutral-200 font-medium">{file.name}</div>
            <div className="ml-3 shrink-0 text-violet-300 font-semibold">{fmtBytes(file.size)}</div>
          </div>

          {/* grid: video (left) + thumbnail (right) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 max-sm:gap-3 md:gap-3.5">
            {/* Left: video + info */}
            <div className="lg:col-span-9">
              {fileURL && (
                <video
                  ref={videoRef}
                  src={fileURL}
                  controls
                  onLoadedMetadata={onLoadedMeta}
                  className="aspect-video w-full rounded-lg border border-neutral-700/50 bg-black shadow-lg max-sm:rounded-md md:rounded-md"
                />
              )}
              <div className="mt-3 text-sm text-neutral-400 max-sm:mt-2 max-sm:text-xs md:mt-2.5 md:text-sm">
                <span className="font-semibold text-neutral-300">Duration:</span> {duration}
              </div>
            </div>

            {/* Right: thumbnail preview + actions */}
            <div className="lg:col-span-3">
              <p className="mb-2 text-sm font-semibold text-violet-300 max-sm:mb-1.5 max-sm:text-xs md:mb-2 md:text-sm">Thumbnail</p>
              <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-700/50 bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 shadow-lg max-sm:rounded-md md:rounded-md">
                {thumbURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbURL} alt="Thumbnail preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-3 text-center text-xs text-neutral-400 max-sm:text-[11px] max-sm:px-2 md:text-xs md:px-2.5">
                    No thumbnail — capture from video or upload image.
                  </span>
                )}
              </div>

              {/* Buttons under the thumbnail box */}
              <div className="mt-3 flex flex-col gap-2 max-sm:mt-2.5 max-sm:gap-1.5 md:mt-2.5 md:gap-2">
                <button
                  type="button"
                  onClick={onCaptureThumb}
                  className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 px-3 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-violet-500/50 transition-all max-sm:px-2.5 max-sm:py-1.5 max-sm:text-xs max-sm:rounded-md md:px-2.5 md:py-2 md:text-sm md:rounded-md"
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
                  className="w-full rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all max-sm:px-2.5 max-sm:py-1.5 max-sm:text-xs max-sm:rounded-md md:px-2.5 md:py-2 md:text-sm md:rounded-md"
                >
                  Upload Thumbnail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-medium max-sm:mt-3 max-sm:px-3 max-sm:py-2.5 max-sm:text-xs max-sm:rounded-lg md:mt-3.5 md:px-3.5 md:py-2.5 md:text-sm md:rounded-lg">
          <span className="text-red-400">⚠️ Error:</span> {error}
        </div>
      )}
    </section>
  );
});

export default UploadFilePanel;
