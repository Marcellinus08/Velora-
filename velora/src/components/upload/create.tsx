"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import UploadFilePanel from "./file-panel";
import UploadDetailsPanel from "./details-panel";
import UploadActionPanel from "./upload-panel";

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

const VIDEO_BUCKET = "videos";
const THUMB_BUCKET = "thumbnails";
/* -------------------------------- */

const fmtBytes = (n: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024; i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

export default function UploadCreate() {
  // File & preview
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<string>("-");
  const [durationSec, setDurationSec] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");

  // Thumbnail
  const [thumbURL, setThumbURL] = useState<string | null>(null);
  const [thumbBlob, setThumbBlob] = useState<Blob | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* cleanup URLs/timer */
  useEffect(() => {
    return () => {
      if (fileURL) URL.revokeObjectURL(fileURL);
      if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
      if (timer.current) clearInterval(timer.current);
    };
  }, [fileURL, thumbURL]);

  /* pick file helpers */
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
    setThumbBlob(null);
    setProgress(0);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVideoFile(e.target.files?.[0]);
  }
  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setVideoFile(e.dataTransfer.files?.[0]);
  }
  function onDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  function onLoadedMeta() {
    const vid = videoRef.current;
    if (!vid) return;
    const d = Math.floor(vid.duration || 0);
    setDurationSec(d);
    const mm = Math.floor(d / 60).toString().padStart(2, "0");
    const ss = Math.floor(d % 60).toString().padStart(2, "0");
    setDuration(`${mm}:${ss}`);
  }

  /* capture thumbnail */
  function captureThumb() {
    const vid = videoRef.current;
    if (!vid) return;
    if (!vid.videoWidth || !vid.videoHeight) return;

    const canvas = document.createElement("canvas");
    const w = 640;
    const h = Math.round((vid.videoHeight / vid.videoWidth) * w);
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
      setThumbBlob(blob);
    }, "image/jpeg", 0.9);
  }

  /* supabase storage helper */
  async function uploadToSupabase(
    bucket: string,
    path: string,
    data: File | Blob,
    contentType?: string
  ) {
    const { data: uploadRes, error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(path, data, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadErr) throw uploadErr;

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return { path: uploadRes?.path ?? path, publicUrl: pub.publicUrl };
  }

  async function startUpload() {
    try {
      if (!file || !title.trim() || !category) return;

      setError("");
      setUploading(true);
      setProgress(5);
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        setProgress((p) => (p >= 95 ? p : p + 1));
      }, 150);

      // 1) video
      const fileExt = file.name.split(".").pop() || "mp4";
      const videoNameSafe = file.name.replace(/\s+/g, "_");
      const videoPath = `videos/${Date.now()}_${videoNameSafe}`;
      const videoRes = await uploadToSupabase(
        VIDEO_BUCKET,
        videoPath,
        file,
        file.type || `video/${fileExt}`
      );

      // 2) thumbnail (optional)
      let thumbRes: { path: string; publicUrl: string } | null = null;
      if (thumbBlob) {
        const thumbPath = `thumbs/${Date.now()}_${videoNameSafe}.jpg`;
        thumbRes = await uploadToSupabase(
          THUMB_BUCKET,
          thumbPath,
          thumbBlob,
          "image/jpeg"
        );
      }

      // 3) metadata
      const { error: insertErr } = await supabase.from("videos").insert({
        title,
        description,
        category,
        duration_seconds: durationSec,
        video_path: videoRes.path,
        video_url: videoRes.publicUrl,
        thumb_path: thumbRes?.path ?? null,
        thumb_url: thumbRes?.publicUrl ?? null,
      });
      if (insertErr) throw insertErr;

      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      setProgress(100);
      setUploading(false);

      await Swal.fire({
        icon: "success",
        title: "Upload complete!",
        text: "Your video was uploaded successfully.",
        confirmButtonText: "OK",
      });

      resetAll();
    } catch (e: any) {
      console.error(e);
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      setUploading(false);
      setProgress(0);
      setError(e?.message || "Upload failed. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: e?.message || "Please try again.",
        confirmButtonText: "OK",
      });
    }
  }

  function resetAll() {
    setFile(null);
    if (fileURL) URL.revokeObjectURL(fileURL);
    setFileURL(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setThumbURL(null);
    setThumbBlob(null);
    setProgress(0);
    setUploading(false);
    setError("");
    setDuration("-");
    setDurationSec(0);
  }

  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(() => setUploading(false), 400);
      return () => clearTimeout(t);
    }
  }, [progress]);

  const canStart =
    !!file && title.trim() !== "" && category !== "" && !uploading;

  return (
    // TIDAK ADA PADDING DI SINI — padding diatur di page.tsx agar sama seperti Studio
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-50">
        Upload Video
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        Select a video file, fill the details, then start upload.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <UploadFilePanel
            ref={videoRef}
            accept={ACCEPT}
            file={file}
            fileURL={fileURL}
            duration={duration}
            thumbURL={thumbURL}
            error={error}
            fmtBytes={fmtBytes}
            onInputChange={onInputChange}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onLoadedMeta={onLoadedMeta}
            onReplaceFile={() => setFile(null)}
            onCaptureThumb={captureThumb}
          />
        </section>

        <div className="lg:col-span-5 space-y-6">
          <UploadDetailsPanel
            title={title}
            description={description}
            category={category}
            categories={CATEGORIES}
            onChangeTitle={setTitle}
            onChangeDescription={setDescription}
            onChangeCategory={setCategory}
          />

          <UploadActionPanel
            uploading={uploading}
            progress={progress}
            canStart={canStart}
            onStartUpload={startUpload}
            onReset={resetAll}
          />
        </div>
      </div>
    </div>
  );
}
