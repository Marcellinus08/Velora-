"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Pemutar video sederhana:
 * - MP4: pakai <video> langsung
 * - HLS (.m3u8): pakai hls.js bila diperlukan (Safari bisa native)
 */
type Props = {
  src: string;            // URL video (mp4 atau m3u8)
  poster?: string;        // thumbnail poster
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
};

export default function HeroPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  controls = true,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string>("");

  const isHls = useMemo(() => /\.m3u8($|\?)/i.test(src), [src]);

  useEffect(() => {
    setError("");
    const video = videoRef.current;
    if (!video) return;

    // HLS path
    if (isHls) {
      // Safari (dan iOS) bisa native
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      // Browser lain: load hls.js secara dinamis
      let hls: any;
      (async () => {
        try {
          const mod = await import("hls.js"); // npm i hls.js
          if (mod.default.isSupported()) {
            hls = new mod.default();
            hls.loadSource(src);
            hls.attachMedia(video);
          } else {
            setError("HLS tidak didukung di browser ini.");
          }
        } catch (e) {
          setError("Gagal memuat hls.js");
        }
      })();

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }

    // MP4 path
    video.src = src;
  }, [src, isHls]);

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-black ${className}`}>
      <video
        ref={videoRef}
        poster={poster}
        controls={controls}
        controlsList="nodownload"
        disablePictureInPicture={false}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
        onError={() => setError("Video gagal diputar (cek URL/CORS/MIME).")}
        onContextMenu={(e) => e.preventDefault()}
      />

      {error && (
        <div className="absolute inset-0 grid place-items-center p-4 text-center">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
