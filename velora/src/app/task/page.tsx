// src/app/task/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

import HeroPlayer from "@/components/task/heroplayer";
import TaskPanel, { TaskItem } from "@/components/task/taskpanel";
import VideoInfoSection from "@/components/task/videoinfo";
import Comments from "@/components/task/comments";
import type { Comment, RecommendedVideo, VideoInfo } from "@/components/task/types";

/* Helpers */
const safe = (s?: string | null, fb = "") => (typeof s === "string" && s.trim() ? s : fb);
const safeThumb = (s?: string | null) => safe(s, "/placeholder-thumb.png");
const shortenAddr = (addr?: string | null) => {
  const a = safe(addr);
  return a ? (a.length <= 12 ? a : `${a.slice(0, 6)}...${a.slice(-4)}`) : "";
};
const titleize = (s: string) =>
  s
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

type VideoRow = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  video_url: string | null;
  video_path?: string | null;
  thumb_url: string | null;
  abstract_id: string | null;
  points_total?: number | null;
  tasks_json?: any;
  creator?: { username: string | null; avatar_url: string | null } | null;
};

export default function TaskPage() {
  const sp = useSearchParams();
  const idFromQuery = sp.get("id") || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [row, setRow] = useState<VideoRow | null>(null);
  const [reco, setReco] = useState<RecommendedVideo[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        // ✅ JANGAN pakai komentar di dalam select()
        const selectCols = `
          id,
          title,
          description,
          category,
          video_url,
          video_path,
          thumb_url,
          abstract_id,
          points_total,
          tasks_json,
          creator:profiles!videos_abstract_id_fkey(username,avatar_url)
        `;

        const oneReq = idFromQuery
          ? supabase.from("videos").select(selectCols).eq("id", idFromQuery).single()
          : supabase.from("videos").select(selectCols).order("created_at", { ascending: false }).limit(1).maybeSingle();

        const { data: one, error: e1 } = await oneReq;
        if (e1) throw e1;
        if (!one) throw new Error("Video tidak ditemukan.");

        if (!alive) return;
        setRow(one as unknown as VideoRow);

        // tasks
        let pulled: TaskItem[] = [];
        let points = Number(one.points_total || 0) || 0;

        const { data: taskRows } = await supabase
          .from("video_tasks")
          .select("id, order_no, question, options, points")
          .eq("video_id", (one as any).id)
          .order("order_no", { ascending: true });

        if (Array.isArray(taskRows) && taskRows.length > 0) {
          pulled = taskRows.map((r) => {
            let opts: string[] = [];
            const raw = (r as any).options;
            if (Array.isArray(raw)) opts = raw;
            else if (typeof raw === "string") {
              try {
                const p = JSON.parse(raw);
                opts = Array.isArray(p) ? p : [];
              } catch {
                opts = raw
                  .split("|")
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
            }
            return { id: String(r.id), question: String(r.question ?? ""), options: opts, points: r.points ?? undefined };
          });
          if (!points) points = pulled.reduce((a, b) => a + (b.points || 0), 0);
        } else if (Array.isArray(one.tasks_json)) {
          pulled = (one.tasks_json as any[]).map((t, i) => ({
            id: `${one.id}_${i}`,
            question: String(t?.question ?? ""),
            options: Array.isArray(t?.options) ? (t.options as string[]) : [],
            points: typeof t?.points === "number" ? t.points : undefined,
          }));
          if (!points) points = pulled.reduce((a, b) => a + (b.points || 0), 0);
        }

        setTasks(pulled);
        setTotalPoints(points);

        // rekomendasi
        const { data: others } = await supabase
          .from("videos")
          .select(`id, title, thumb_url, creator:profiles!videos_abstract_id_fkey(username)`)
          .neq("id", one.id)
          .order("created_at", { ascending: false })
          .limit(8);

        if (alive) {
          const mapped: RecommendedVideo[] = (others || []).map((v) => ({
            id: (v as any).id,
            title: safe((v as any).title, "Untitled"),
            creator: safe((v as any)?.creator?.username, "Creator"),
            thumbnail: safeThumb((v as any).thumb_url),
          }));
          setReco(mapped);
        }
      } catch (e: any) {
        if (alive) setErr(e?.message || "Gagal memuat data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [idFromQuery]);

  // Bentuk data untuk komponen info (termasuk tag dari category)
  const videoInfo: VideoInfo | null = useMemo(() => {
    if (!row) return null;
    const wallet = safe(row.abstract_id, "");
    const walletShort = wallet ? shortenAddr(wallet) : "—";
    const displayName = safe(row.creator?.username, walletShort || "Unknown");
    const tags = row.category ? [titleize(row.category)] : [];

    return {
      title: safe(row.title, "Untitled"),
      views: "Streaming",
      heroImage: safeThumb(row.thumb_url),
      description: safe(row.description, "No description has been provided by the creator."),
      creator: {
        name: displayName,
        followers: walletShort,
        avatar: safe(row.creator?.avatar_url, ""), // kosong → fallback Abstract di komponen
        wallet,
      },
      tags,
    };
  }, [row]);

  // komentar dummy
  const comments: Comment[] = [
    {
      id: 1,
      name: "Siti Aisyah",
      time: "2 hari lalu",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocK_1Y-3-HjG-2y9y-iY_p-A-g_F-tZ-kC-d-P-Y=s96-c",
      text: "Video yang sangat bermanfaat! Saya belajar banyak teknik baru yang bisa saya terapkan di dapur.",
    },
    {
      id: 2,
      name: "Budi Santoso",
      time: "1 minggu lalu",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocL8R-V_3y_c-f_W-j-X_q_Z-j_E-z_T-v_R-z_X=s96-c",
      text: "Penjelasan jelas dan mudah diikuti. Terima kasih telah berbagi ilmu!",
    },
  ];

  const videoSrc = useMemo(() => (row ? safe(row.video_url, row.video_path || "") : ""), [row]);

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      {err && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

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
            <section className="col-span-12 lg:col-span-8">
              {videoSrc ? (
                <HeroPlayer src={videoSrc} poster={safeThumb(row.thumb_url)} controls autoPlay={false} muted={false} />
              ) : (
                <div className="grid aspect-video place-items-center rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-400">
                  URL video tidak tersedia.
                </div>
              )}
            </section>

            <aside className="col-span-12 lg:col-span-4">
              <TaskPanel className="h-full" tasks={tasks} totalPoints={totalPoints} />
            </aside>

            {videoInfo && <VideoInfoSection video={videoInfo} recommendations={reco} />}
          </div>

          <Comments items={comments} />
        </>
      )}
    </main>
  );
}
