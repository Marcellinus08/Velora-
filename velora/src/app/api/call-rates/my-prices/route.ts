import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// 0x…40 hexa
const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const aid = (url.searchParams.get("aid") || "").toLowerCase();

  if (!ETH_RE.test(aid)) {
    return NextResponse.json({ error: "Bad address" }, { status: 400 });
  }

  // Ambil semua schedule milik address ini, lalu pilih yg terbaru per kind
  const { data, error } = await supabaseAdmin
    .from("call_schedules")
    .select("abstract_id, kind, price_cents, slot_minutes, currency, created_at")
    .eq("abstract_id", aid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[/api/call-rates/my-prices] DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  type Row = {
    abstract_id: string;
    kind: "voice" | "video";
    price_cents: number | null;
    slot_minutes: number | null;
    currency: string | null;
    created_at: string;
  };

  const latest: Record<"voice" | "video", Row | undefined> = { voice: undefined, video: undefined };
  (data as Row[]).forEach((r) => {
    if (!latest[r.kind]) latest[r.kind] = r;
  });

  const voice = latest.voice
    ? {
        per_session_usd: (latest.voice.price_cents || 0) / 100,
        slot_minutes: latest.voice.slot_minutes || 10,
        currency: latest.voice.currency || "USD",
      }
    : null;

  const video = latest.video
    ? {
        per_session_usd: (latest.video.price_cents || 0) / 100,
        slot_minutes: latest.video.slot_minutes || 10,
        currency: latest.video.currency || "USD",
      }
    : null;

  return NextResponse.json(
    { voice, video },
    { headers: { "Cache-Control": "no-store" } }
  );
}
