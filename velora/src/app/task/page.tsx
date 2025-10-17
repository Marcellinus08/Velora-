// src/app/task/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

import HeroPlayer from "@/components/task/heroplayer";
import TaskPanel, { TaskItem } from "@/components/task/taskpanel";
import VideoInfoSection from "@/components/task/videoinfo";
import Comments from "@/components/task/comments";

import type {
  Comment,
  RecommendedVideo,
  VideoInfo,
} from "@/components/task/types";

/* ===================== Helpers ===================== */
const safe = (s?: string | null, fb = "") =>
  typeof s === "string" && s.trim() ? s : fb;

const safeThumb = (s?: string | null) => safe(s, "/placeholder-thumb.png");

/** Tampilkan alamat dalam bentuk pendek: 0x1234…ABCD */
const shortenAddr = (addr?: string | null) => {
  const a = safe(addr);
  if (!a) return "";
  return a.length <= 12 ? a : `${a.slice(0, 6)}...${a.slice(-4)}`;
};

/* --- session cache utk avatar Abstract (TTL 30 menit) --- */
const TTL_MS = 30 * 60 * 1000;
function readCacheUrl(key: string): string | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > TTL_MS) return null;
    return typeof v === "string" ? v : null;
  } catch {
    return null;
  }
}
function writeCacheUrl(key: string, value: string) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {}
}
function readCacheMiss(key: string): boolean {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return false;
    const { t } = JSON.parse(raw);
    return Date.now() - t <= TTL_MS;
  } catch {
    return false;
  }
}
function writeCacheMiss(key: string) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: "MISS" }));
  } catch {}
}

type VideoRow = {
  id: string;
  title: string | null;
  description: string | null;
  video_url: string | null;
  video_path?: string | null;
  thumb_url: string | null;
  abstract_id: string | null; // wallet pemilik video
  points_total?: number | null;
  tasks_json?: any;
  creator?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

/* ===================== Page ===================== */
export default function TaskPage() {
  const sp = useSearchParams();
  const idFromQuery = sp.get("id") || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [row, setRow] = useState<VideoRow | null>(null);
  const [reco, setReco] = useState<RecommendedVideo[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  // avatar yang akan dipakai (prioritas: DB → Abstract → placeholder)
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        // --- 1) Ambil 1 video (by id atau terbaru) ---
        const selectCols = `
          id, title, description, video_url, video_path, thumb_url, abstract_id,
          points_total, tasks_json,
          creator:profiles!videos_abstract_id_fkey(username, avatar_url)
        `;

        const oneReq = idFromQuery
          ? supabase.from("videos").select(selectCols).eq("id", idFromQuery).single()
          : supabase
              .from("videos")
              .select(selectCols)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

        const { data: one, error: e1 } = await oneReq;
        if (e1) throw e1;
        if (!one) throw new Error("Video tidak ditemukan.");

        if (!alive) return;

        setRow(one as unknown as VideoRow);

        // --- 2) Ambil tasks dari video_tasks; jika kosong → fallback tasks_json ---
        let pulledTasks: TaskItem[] = [];
        let pulledPoints = Number(one.points_total || 0) || 0;

        const { data: taskRows, error: tErr } = await supabase
          .from("video_tasks")
          .select("id, order_no, question, options, points")
          .eq("video_id", (one as any).id)
          .order("order_no", { ascending: true });

        if (tErr) {
          console.warn("video_tasks error:", tErr);
        }

        if (Array.isArray(taskRows) && taskRows.length > 0) {
          pulledTasks = taskRows.map((r) => {
            let opts: string[] = [];
            const raw = (r as any).options;
            if (Array.isArray(raw)) opts = raw as string[];
            else if (typeof raw === "string") {
              try {
                const p = JSON.parse(raw);
                if (Array.isArray(p)) opts = p;
              } catch {
                opts = raw.split("|").map((s) => s.trim()).filter(Boolean);
              }
            }
            return {
              id: String(r.id),
              question: String(r.question ?? ""),
              options: opts,
              points: typeof r.points === "number" ? r.points : undefined,
            } as TaskItem;
          });

          if (!pulledPoints) {
            pulledPoints = pulledTasks.reduce((a, b) => a + (b.points || 0), 0);
          }
        } else if (Array.isArray(one.tasks_json)) {
          pulledTasks = (one.tasks_json as any[]).map((t, i) => ({
            id: `${one.id}_${i}`,
            question: String(t?.question ?? ""),
            options: Array.isArray(t?.options) ? (t.options as string[]) : [],
            points: typeof t?.points === "number" ? t.points : undefined,
          }));
          if (!pulledPoints) {
            pulledPoints = pulledTasks.reduce((a, b) => a + (b.points || 0), 0);
          }
        }

        setTasks(pulledTasks);
        setTotalPoints(pulledPoints);

        // --- 3) Rekomendasi lain ---
        const { data: others, error: e2 } = await supabase
          .from("videos")
          .select(
            `
            id, title, thumb_url,
            creator:profiles!videos_abstract_id_fkey(username)
          `
          )
          .neq("id", one.id)
          .order("created_at", { ascending: false })
          .limit(8);

        if (e2) throw e2;

        if (!alive) return;

        const mapped: RecommendedVideo[] = (others || []).map((v) => ({
          id: (v as any).id,
          title: safe((v as any).title, "Untitled"),
          creator: safe((v as any)?.creator?.username, "Creator"),
          thumbnail: safeThumb((v as any).thumb_url),
        }));
        setReco(mapped);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Gagal memuat data.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [idFromQuery]);

  /* ==== Resolve avatar: DB > Abstract > placeholder ==== */
  useEffect(() => {
    // awal: pakai dari DB jika ada
    const dbAvatar = safe(row?.creator?.avatar_url);
    if (dbAvatar) {
      setAvatarUrl(dbAvatar);
      return;
    }

    // jika tak ada, coba Abstract
    const addr = safe(row?.abstract_id)?.toLowerCase();
    if (!addr) {
      setAvatarUrl(""); // akan diproses jadi placeholder di bawah
      return;
    }

    const cacheKeyOK = `absavatar:${addr}`;
    const cacheKeyMISS = `absavatar-miss:${addr}`;
    const cached = readCacheUrl(cacheKeyOK);
    if (cached) {
      setAvatarUrl(cached);
      return;
    }
    if (readCacheMiss(cacheKeyMISS)) {
      setAvatarUrl(""); // pakai placeholder
      return;
    }

    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/abstract/user/${addr}`, { cache: "force-cache" });
        if (r.ok) {
          const j = await r.json();
          const url: string | null = j?.profilePicture || j?.avatar || j?.imageUrl || null;
          if (url) {
            writeCacheUrl(cacheKeyOK, url);
            if (alive) setAvatarUrl(url);
            return;
          }
        }
        writeCacheMiss(cacheKeyMISS);
        if (alive) setAvatarUrl("");
      } catch {
        writeCacheMiss(cacheKeyMISS);
        if (alive) setAvatarUrl("");
      }
    })();

    return () => {
      alive = false;
    };
  }, [row?.creator?.avatar_url, row?.abstract_id]);

  // ====== bentuk data untuk komponen info ======
  const videoInfo: VideoInfo | null = useMemo(() => {
    if (!row) return null;

    const wallet = safe(row.abstract_id, "");
    const walletDisplay = wallet ? shortenAddr(wallet) : "—";
    const displayName = safe(row.creator?.username, walletDisplay || "Unknown");

    return {
      title: safe(row.title, "Untitled"),
      views: "Streaming",
      heroImage: safeThumb(row.thumb_url),
      description: safe(
        row.description,
        "No description has been provided by the creator."
      ),
      creator: {
        name: displayName,        // username || short wallet || "Unknown"
        followers: walletDisplay, // baris kedua: short wallet
        avatar: safeThumb(avatarUrl), // DB avatar > Abstract avatar > placeholder
      },
    };
  }, [row, avatarUrl]);

  // Komentar dummy (UI siap; sambungkan ke DB kalau sudah ada tabelnya)
  const comments: Comment[] = [
    {
      id: 1,
      name: "Siti Aisyah",
      time: "2 hari lalu",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocK_1Y-3-HjG-2y9y-iY_p-A-g_F-tZ-kC-d-P-Y=s96-c",
      text:
        "Video yang sangat bermanfaat! Saya belajar banyak teknik baru yang bisa saya terapkan di dapur.",
    },
    {
      id: 2,
      name: "Budi Santoso",
      time: "1 minggu lalu",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocL8R-V_3y_c-f_W-j-X_q_Z-j_E-z_T-v_R-z_X=s96-c",
      text:
        "Penjelasan jelas dan mudah diikuti. Terima kasih telah berbagi ilmu!",
    },
  ];

  // Sumber video: utamakan video_url; fallback ke video_path
  const videoSrc = useMemo(() => {
    if (!row) return "";
    return safe(row.video_url, row.video_path || "");
  }, [row]);

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      {err && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

      {/* skeleton minimal */}
      {loading && (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-neutral-800" />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="h-[420px] animate-pulse rounded-2xl bg-neutral-800" />
          </div>
        </div>
      )}

      {!loading && row && (
        <>
          <div className="grid grid-cols-12 items-stretch gap-8">
            {/* Player kiri */}
            <section className="col-span-12 lg:col-span-8">
              {videoSrc ? (
                <HeroPlayer
                  src={videoSrc}
                  poster={safeThumb(row.thumb_url)}
                  controls
                  autoPlay={false}
                  muted={false}
                />
              ) : (
                <div className="grid aspect-video place-items-center rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-400">
                  URL video tidak tersedia.
                </div>
              )}
            </section>

            {/* Panel task kanan */}
            <aside className="col-span-12 lg:col-span-4">
              <TaskPanel className="h-full" tasks={tasks} totalPoints={totalPoints} />
            </aside>

            {/* Info + rekomendasi */}
            {videoInfo && (
              <VideoInfoSection video={videoInfo} recommendations={reco} />
            )}
          </div>

          <Comments items={comments} />
        </>
      )}
    </main>
  );
}
