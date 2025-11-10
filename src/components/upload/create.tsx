// src/components/upload/create.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import UploadFilePanel from "./file-panel";
import UploadDetailsPanel from "./details-panel";
import UploadActionPanel from "./upload-panel";
import { useAccount } from "wagmi";

/* ---------- Config ---------- */
const ACCEPT =
  "video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska";
const MAX_SIZE_MB = 4096; // 4GB untuk Supabase Pro
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
  "Podcast",
  "Other",
] as const;

const STUDIO_BUCKET = "studio";

/* ---------- Utils ---------- */
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

/* ===== Pricing helpers (UI only) ===== */
export type PriceRule = {
  min_cents: number;
  max_cents: number;
  step_cents: number;
  default_cents: number;
};

// $1 – $100 (step $1)
const DEFAULT_PRICE_RULE: PriceRule = {
  min_cents: 100,
  max_cents: 10000,
  step_cents: 100,
  default_cents: 1999, // $19.99
};

function getRuleForCategory(_category: string): PriceRule {
  return DEFAULT_PRICE_RULE;
}

function suggestPriceByDuration(durationSec: number, rule: PriceRule): number {
  const m = Math.max(1, Math.round(durationSec / 60));
  let usd = m <= 10 ? 12 : m <= 30 ? 19 : m <= 60 ? 29 : 39;
  const cents = Math.round(usd * 100);
  const snapped = Math.min(
    Math.max(Math.round(cents / rule.step_cents) * rule.step_cents, rule.min_cents),
    rule.max_cents
  );
  return snapped;
}

/* ===== Tasks (quiz) ===== */
export type TaskItem = {
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
};

const emptyTask = (): TaskItem => ({
  question: "",
  options: ["", "", "", ""],
  answerIndex: 0,
});

/* ---------- Error helpers ---------- */
type PgSupabaseError =
  | {
      message?: string;
      details?: string;
      hint?: string;
      code?: string; // e.g. '42703' (undefined_column), '23503' (fk), '23505' (unique)
    }
  | any;

function pickErrMsg(e: PgSupabaseError) {
  if (!e) return "Unknown error";
  return (
    e?.message ||
    e?.error_description ||
    e?.error ||
    (typeof e === "string" ? e : JSON.stringify(e))
  );
}

function isUndefinedColumnErr(e: PgSupabaseError) {
  // Postgres undefined_column
  return e?.code === "42703" || /column .* does not exist/i.test(`${e?.message ?? ""}`);
}

/* =================================================================== */

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

  // Pricing state
  const [priceRule, setPriceRule] = useState<PriceRule>(DEFAULT_PRICE_RULE);
  const [priceCents, setPriceCents] = useState<number>(DEFAULT_PRICE_RULE.default_cents);

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([emptyTask()]);

  // Thumbnail
  const [thumbURL, setThumbURL] = useState<string | null>(null);
  const [thumbBlob, setThumbBlob] = useState<Blob | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wallet
  const { address, status } = useAccount();
  const [abstractId, setAbstractId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "connected" && address) {
      const addrLower = address.toLowerCase() as `0x${string}`;
      setAbstractId(addrLower);

      // jaga-jaga: pastikan profile row ada
      (async () => {
        try {
          await (supabase as any)
            .from("profiles")
            .upsert(
              { abstract_id: addrLower } as any,
              { onConflict: "abstract_id", ignoreDuplicates: false }
            );
        } catch {
          /* ignore */
        }
      })();
    } else {
      setAbstractId(null);
    }
  }, [address, status]);

  // update rule & suggested price saat kategori/durasi berubah
  useEffect(() => {
    const rule = getRuleForCategory(category);
    setPriceRule(rule);
    setPriceCents((prev) => {
      const chosen = prev || rule.default_cents;
      const suggested = suggestPriceByDuration(durationSec, rule);
      const target = prev ? chosen : suggested;
      const clamped = Math.min(
        Math.max(Math.round(target / rule.step_cents) * rule.step_cents, rule.min_cents),
        rule.max_cents
      );
      return clamped;
    });
  }, [category, durationSec]);

  // cleanup
  useEffect(() => {
    return () => {
      if (fileURL?.startsWith("blob:")) URL.revokeObjectURL(fileURL);
      if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
      if (timer.current) clearInterval(timer.current);
    };
  }, [fileURL, thumbURL]);

  /* ---------- File handlers ---------- */
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

  function onUploadThumb(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Thumbnail must be an image.");
      return;
    }
    const url = URL.createObjectURL(file);
    if (thumbURL?.startsWith("blob:")) URL.revokeObjectURL(thumbURL);
    setThumbURL(url);
    setThumbBlob(file);
  }

  /* ---------- Supabase helpers ---------- */
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

  // Insert with targeted fallback: hanya drop field yang kolomnya TIDAK ADA.
  async function insertVideoRowSmart(payload: Record<string, any>) {
    // 1) coba full
    let { error } = await (supabase as any).from("videos").insert(payload as any);
    if (!error) return;

    console.log('[insertVideoRowSmart] First insert failed:', error);

    // jika error karena kolom tidak ada atau generated column, kita hapus field yang bikin error, lalu retry
    if (isUndefinedColumnErr(error) || error?.message?.includes('cannot insert') || error?.message?.includes('GENERATED')) {
      const msg = (error?.message || "").toLowerCase();
      const strip: string[] = [];
      if (msg.includes("tasks_json")) strip.push("tasks_json");
      if (msg.includes("currency")) strip.push("currency");
      if (msg.includes("points_total")) strip.push("points_total"); // Handle generated column
      // (tambahkan nama kolom lain kalau memang belum ada di schema)

      if (strip.length) {
        console.log('[insertVideoRowSmart] Retrying without fields:', strip);
        const trimmed = { ...payload };
        for (const k of strip) delete (trimmed as any)[k];
        const second = await (supabase as any).from("videos").insert(trimmed as any);
        if (second.error) {
          console.error('[insertVideoRowSmart] Second insert also failed:', second.error);
          throw second.error;
        }
        console.log('[insertVideoRowSmart] Second insert succeeded!');
        return;
      }
    }

    // error lain → lempar biar ketahuan (mis. RLS, foreign key, dll.)
    throw error;
  }

  /* ---------- Submit ---------- */
  async function startUpload() {
    try {
      if (!file || !title.trim() || !category) return;

      const aid = abstractId?.trim();
      if (!aid) {
        setError("No connected wallet. Please connect your wallet first.");
        return;
      }

      setError("");
      setUploading(true);
      setProgress(5);
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        setProgress((p) => (p >= 95 ? p : p + 1));
      }, 150);

      // 1) upload video
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

      // 2) upload thumb (opsional)
      let thumbRes: { path: string; publicUrl: string } | null = null;
      if (thumbBlob) {
        const mime = (thumbBlob as any).type || "image/jpeg";
        const ext =
          mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
        const thumbPath = `thumbnails/${stamp}_${base}.${ext}`;
        thumbRes = await uploadToSupabase(STUDIO_BUCKET, thumbPath, thumbBlob, mime);
      }

      // 3) normalisasi harga (range $1–$100, step $1)
      const ruleNow = getRuleForCategory(category);
      const normalizedCents = Math.min(
        Math.max(
          Math.round(priceCents / ruleNow.step_cents) * ruleNow.step_cents,
          ruleNow.min_cents
        ),
        ruleNow.max_cents
      );

      console.groupCollapsed("[UPLOAD] Payload debug");
      console.log("priceCents(raw):", priceCents);
      console.log("normalizedCents:", normalizedCents);
      console.log("rule:", ruleNow);
      console.groupEnd();

      // 4) insert metadata
      const payload = {
        abstract_id: aid,
        title,
        description,
        category,
        duration_seconds: durationSec,
        video_path: videoRes.path,
        video_url: videoRes.publicUrl,
        thumb_path: thumbRes?.path ?? null,
        thumb_url: thumbRes?.publicUrl ?? null,

        price_cents: normalizedCents,
        currency: "USD",
        tasks_json: tasks, // kalau kolom tidak ada → akan di-trim otomatis
        
        // Calculate total points: $1 = 10 points
        // So points_total = (price_cents / 100) * 10
        points_total: Math.floor((normalizedCents / 100) * 10),
      };

      await insertVideoRowSmart(payload);

      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      setProgress(100);
      setUploading(false);

      toast.success(
        "Upload complete!",
        `Video: ${title}\nYour video was uploaded successfully`,
        6000
      );

      resetAll();
    } catch (e: any) {
      // error reporting yang JELAS
      const msg = pickErrMsg(e);
      console.error("Upload failed:", e);
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      setUploading(false);
      setProgress(0);
      setError(msg);
      toast.error(
        "Upload failed",
        `Error: ${msg}\nPlease try again or check your file`,
        6000
      );
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
    setPriceRule(DEFAULT_PRICE_RULE);
    setPriceCents(DEFAULT_PRICE_RULE.default_cents);
    setTasks([emptyTask()]);
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

  const canStart = !!file && title.trim() !== "" && category !== "" && !uploading;

  return (
    <div>
      {/* Header - Same style as Ads */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-50 max-sm:text-xl md:text-xl">
          Upload Video
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-sm:text-xs max-sm:mt-0.5 md:text-sm md:mt-1">Share your content with the community and start earning rewards</p>
      </div>

      {/* TOP: FILE + THUMBNAIL */}
      <section className="mt-6 max-sm:mt-4 md:mt-5">
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

      {/* BOTTOM: details + actions */}
      <div className="mt-6 space-y-6 max-sm:mt-4 max-sm:space-y-4 md:mt-5 md:space-y-5">
        <UploadDetailsPanel
          title={title}
          description={description}
          category={category}
          categories={[...CATEGORIES]}
          onChangeTitle={setTitle}
          onChangeDescription={setDescription}
          onChangeCategory={setCategory}
          /* pricing props */
          durationSec={durationSec}
          priceRule={priceRule}
          priceCents={priceCents}
          onChangePriceCents={setPriceCents}
          onUseSuggested={() =>
            setPriceCents(suggestPriceByDuration(durationSec, priceRule))
          }
          /* tasks props */
          tasks={tasks}
          onAddEmptyTask={() => setTasks((prev) => [...prev, emptyTask()])}
          onChangeTask={(index, task) =>
            setTasks((prev) => prev.map((t, i) => (i === index ? task : t)))
          }
          onRemoveTask={(index) =>
            setTasks((prev) => prev.filter((_, i) => i !== index))
          }
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
