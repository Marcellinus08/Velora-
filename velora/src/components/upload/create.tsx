// src/components/upload/create.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import UploadFilePanel from "./file-panel";
import UploadDetailsPanel from "./details-panel";
import UploadActionPanel from "./upload-panel";
import { useAccount } from "wagmi"; // ✅ tambahkan: ikuti referensi header

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
] as const;

// Satu bucket: 'studio' (folder: videos/, thumbnails/)
const STUDIO_BUCKET = "studio";
/* -------------------------------- */

const fmtBytes = (n: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
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

  // Abstract ID (ambil dari user login/profil)
  const [abstractId, setAbstractId] = useState<string | null>(null);

  // ✅ sesuai header: dapatkan address dari wagmi
  const { address, status } = useAccount();

  // ✅ helper kecil: resolve abstract_id mengikuti urutan di header
  async function resolveAbstractId(): Promise<string | null> {
    try {
      // 1) Jika wallet connect, gunakan address lowercased dan pastikan ada di profiles.abstract_id
      const addr = address?.toLowerCase();
      if (addr) {
        const { data } = await supabase
          .from("profiles")
          .select("abstract_id")
          .eq("abstract_id", addr)
          .maybeSingle();
        if (data?.abstract_id) return data.abstract_id;
      }

      // 2) Cek Supabase Auth user -> profiles.id
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("abstract_id")
          .eq("id", user.id)
          .maybeSingle();
        if (prof?.abstract_id) return prof.abstract_id;
      }

      // 3) Fallback localStorage (kalau kamu simpan di sana), dan validasi ada di tabel
      try {
        const fromLS = window.localStorage.getItem("abstract_id");
        if (fromLS) {
          const { data: prof2 } = await supabase
            .from("profiles")
            .select("abstract_id")
            .eq("abstract_id", fromLS.toLowerCase())
            .maybeSingle();
          if (prof2?.abstract_id) return prof2.abstract_id;
        }
      } catch {}

      return null;
    } catch {
      return null;
    }
  }

  // ✅ ganti useEffect lama: jangan ambil "row terbaru", tapi ambil milik user aktif
  useEffect(() => {
    let mounted = true;
    (async () => {
      const aid = await resolveAbstractId();
      if (mounted) setAbstractId(aid);
    })();
    return () => {
      mounted = false;
    };
    // refresh ketika status/address wallet berubah
  }, [address, status]);

  /* cleanup URLs/timer */
  useEffect(() => {
    return () => {
      if (fileURL?.startsWith("blob:")) URL.revokeObjectURL(fileURL);
      if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
      if (timer.current) clearInterval(timer.current);
    };
  }, [fileURL, thumbURL]);

  /* pick file helpers */
  function setVideoFile(f?: File) {
    setError("");
    if (!f) return;
    if (!f.type?.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Maximum file size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setFileURL((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
    if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
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

  /* capture thumbnail dari current frame video */
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
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
        setThumbURL(url);
        setThumbBlob(blob);
      },
      "image/jpeg",
      0.9
    );
  }

  /* pilih file thumbnail manual (image/*) */
  function onUploadThumb(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Thumbnail must be an image.");
      return;
    }
    const url = URL.createObjectURL(file);
    if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
    setThumbURL(url);
    setThumbBlob(file); // File adalah Blob, bisa langsung diupload
  }

  /* supabase storage helper */
  async function uploadToSupabase(
    bucket: string,
    path: string,
    data: File | Blob,
    contentType?: string
  ) {
    // path relatif, tanpa leading slash
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

      // Wajib ada abstract_id dari profil user yang aktif
      const aid = (abstractId || "").trim();
      if (!aid) {
        setError(
          "abstract_id tidak ditemukan di tabel profiles. Buat/isi profil dulu atau sesuaikan query pengambilan profil."
        );
        return;
      }

      setError("");
      setUploading(true);
      setProgress(5);
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        setProgress((p) => (p >= 95 ? p : p + 1));
      }, 150);

      // 1) video → studio/videos/...
      const fileExt = (file.name.split(".").pop() || "mp4").toLowerCase();
      const base = file.name.replace(/\s+/g, "_");
      const stamp = Date.now();
      const videoPath = `videos/${stamp}_${base}`;
      const videoRes = await uploadToSupabase(
        STUDIO_BUCKET,
        videoPath,
        file,
        file.type || `video/${fileExt}`
      );

      // 2) thumbnail (opsional) → studio/thumbnails/...
      let thumbRes: { path: string; publicUrl: string } | null = null;
      if (thumbBlob) {
        // deteksi mime/ekstensi dari blob (jika hasil capture = image/jpeg)
        const mime = (thumbBlob as any).type || "image/jpeg";
        const ext =
          mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
        const thumbPath = `thumbnails/${stamp}_${base}.${ext}`;
        thumbRes = await uploadToSupabase(
          STUDIO_BUCKET,
          thumbPath,
          thumbBlob,
          mime
        );
      }

      // 3) metadata → public.videos (sertakan abstract_id)
      const { error: insertErr } = await supabase.from("videos").insert({
        abstract_id: aid, // FK ke profiles.abstract_id
        title,
        description,
        category, // enum video_category
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
      const msg = e?.message || "Upload failed. Please try again.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: msg,
        confirmButtonText: "OK",
      });
    }
  }

  function resetAll() {
    setFile((prev) => {
      if (fileURL?.startsWith("blob:")) URL.revokeObjectURL(fileURL);
      return null;
    });
    setFileURL(null);
    setTitle("");
    setDescription("");
    setCategory("");
    if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
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
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-50">
        Upload Video
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        Select a video file, fill the details, then start upload.
      </p>

      {/* TOP: FILE + THUMBNAIL side-by-side */}
      <section className="mt-6">
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
          onCaptureThumb={captureThumb}
          onUploadThumb={onUploadThumb}
        />
      </section>

      {/* BOTTOM: inputs stacked below */}
      <div className="mt-6 space-y-6">
        <UploadDetailsPanel
          title={title}
          description={description}
          category={category}
          categories={[...CATEGORIES]}
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
  );
}
