import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const okAddr = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s || "");

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const buyer = (url.searchParams.get("id") || "").toLowerCase();
    if (!okAddr(buyer)) {
      return NextResponse.json({ error: "Bad address" }, { status: 400 });
    }

    // 1) purchases by buyer
    const { data: purchases, error } = await supabaseAdmin
      .from("video_purchases")
      .select("id, created_at, finished_at, video_id, price_cents, status, progress_pct, tasks_done")
      .eq("buyer_id", buyer)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!purchases?.length) {
      return NextResponse.json({ available: [], completed: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    // 2) fetch videos
    const ids = Array.from(new Set(purchases.map(p => p.video_id)));
    const { data: videos, error: vErr } = await supabaseAdmin
      .from("videos")
      .select("id, title, thumb_url")
      .in("id", ids);

    if (vErr) throw vErr;

    const vmap = new Map<string, any>();
    (videos || []).forEach(v => vmap.set(String(v.id), v));

    // 3) split available vs completed
    const now = new Date();
    const toRow = (p: any) => {
      const v = vmap.get(String(p.video_id));
      return v
        ? {
            id: v.id,
            title: v.title || "Untitled",
            thumb: v.thumb_url || "/placeholder-thumb.png",
            purchasedAt: p.created_at,
            finishedAt: p.finished_at,
            priceUsd: Math.max(0, (Number(p.price_cents || 0) / 100).toFixed ? Number((p.price_cents / 100).toFixed(2)) : Number(p.price_cents || 0) / 100),
            progress_pct: p.progress_pct ?? 0,
            tasks_done: !!p.tasks_done,
            status: p.status as "active" | "completed" | "refunded",
          }
        : null;
    };

    const rows = purchases.map(toRow).filter(Boolean) as any[];

    const isCompleted = (r: any) =>
      r.status === "completed" || (Number(r.progress_pct) >= 100 && r.tasks_done === true);

    const available = rows
      .filter(r => !isCompleted(r))
      .map(r => ({
        id: r.id,
        title: r.title,
        thumb: r.thumb,
        subtext: `Purchased on ${new Date(r.purchasedAt).toLocaleDateString()}`,
      }));

    const completed = rows
      .filter(r => isCompleted(r))
      .map(r => ({
        id: r.id,
        title: r.title,
        thumb: r.thumb,
        subtext: `Completed on ${new Date(r.finishedAt || r.purchasedAt || now).toLocaleDateString()}`,
      }));

    return NextResponse.json({ available, completed }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("[GET /api/subscription] error", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
