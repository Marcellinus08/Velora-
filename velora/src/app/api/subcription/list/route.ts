// /app/api/subscription/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type PurchaseRow = {
  id: string;
  created_at: string;
  buyer_id: string;
  video_id: string;       // uuid
  tx_hash: string | null;
  price_cents: number | null;
  currency: string | null;
  tasks_done: boolean | null;
  status: string | null;  // purchase_status
  // when joined:
  video?: any | null;
};

const isAddr = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s);
const centsToUsd = (c?: number | null) =>
  Math.max(0, Number(((c ?? 0) / 100).toFixed(2)));

/** Normalize satu video row agar front-end konsisten  */
function toVideoPayload(p: PurchaseRow, v: any) {
  return {
    purchaseId: p.id,
    purchasedAt: p.created_at,
    buyer: p.buyer_id,
    priceUsd: centsToUsd(p.price_cents),
    currency: p.currency || "USD",
    status: p.status || null,
    tasksDone: !!p.tasks_done,

    // video
    id: String(v?.id || p.video_id),
    title: String(v?.title ?? "Untitled"),
    description: v?.description ?? null,
    category: v?.category ?? null,
    durationSeconds: Number(v?.duration_seconds || 0),
    thumbUrl: v?.thumb_url || v?.thumb_path || "",
    videoUrl: v?.video_url || v?.video_path || "",
    creator: v?.abstract_id || null,
  };
}

/** Some apps belum sempat mendefine FK; join fallback ke 2-langkah */
async function fetchWithFallback(buyer: string) {
  // 1) Coba join langsung
  let { data, error } = await supabaseAdmin
    .from("video_purchases")
    .select(
      `
      id, created_at, buyer_id, video_id, tx_hash, price_cents, currency, tasks_done, status,
      video:videos!video_purchases_video_id_fkey ( id, title, description, category, duration_seconds, thumb_url, thumb_path, video_url, video_path, abstract_id )
    `
    )
    .eq("buyer_id", buyer)
    .order("created_at", { ascending: false });

  // 2) Jika join gagal (FK tidak bernama seperti di atas), ambil purchases dulu lalu fetch videos by id
  if (error || !data) {
    const { data: purchases, error: perr } = await supabaseAdmin
      .from("video_purchases")
      .select(
        "id, created_at, buyer_id, video_id, tx_hash, price_cents, currency, tasks_done, status"
      )
      .eq("buyer_id", buyer)
      .order("created_at", { ascending: false });

    if (perr) throw perr;
    if (!purchases?.length) return [] as PurchaseRow[];

    const ids = Array.from(new Set(purchases.map((p) => p.video_id)));
    const { data: videos, error: verr } = await supabaseAdmin
      .from("videos")
      .select(
        "id, title, description, category, duration_seconds, thumb_url, thumb_path, video_url, video_path, abstract_id"
      )
      .in("id", ids);

    if (verr) throw verr;

    const vmap = new Map<string, any>();
    (videos || []).forEach((v) => vmap.set(String(v.id), v));

    const merged: PurchaseRow[] = (purchases || []).map((p) => ({
      ...p,
      video: vmap.get(String(p.video_id)) || null,
    }));

    return merged;
  }

  return data as PurchaseRow[];
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const buyer = (url.searchParams.get("buyer") || "").toLowerCase();
    if (!isAddr(buyer)) {
      return NextResponse.json({ error: "Bad buyer address" }, { status: 400 });
    }

    const rows = await fetchWithFallback(buyer);

    // Kriteria:
    // - "completed": tasks_done = true ATAU status = 'completed'
    // - "available": sebaliknya (sudah dibeli, belum selesai)
    const available: any[] = [];
    const completed: any[] = [];

    for (const r of rows) {
      const v = r.video || {};
      const payload = toVideoPayload(r, v);
      const done = !!r.tasks_done || (r.status || "").toLowerCase() === "completed";
      if (done) completed.push(payload);
      else available.push(payload);
    }

    return NextResponse.json(
      { buyer, available, completed },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("[/api/subscription/list] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
