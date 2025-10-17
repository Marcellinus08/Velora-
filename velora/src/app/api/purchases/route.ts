import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const okAddr = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s || "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const buyer = String(body?.buyer || "").toLowerCase();
    const videoId = String(body?.videoId || "");
    const txHash = body?.tx || body?.txHash || "";
    const priceUsd = Number(body?.priceUsd || 0);
    const currency = (body?.currency || "USD") as string;

    if (!okAddr(buyer)) {
      return NextResponse.json({ error: "Invalid buyer address" }, { status: 400 });
    }
    if (!videoId || videoId.length < 10) {
      return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
    }

    const price_cents = Math.max(0, Math.round(priceUsd * 100));

    // upsert by (buyer_id, video_id)
    const { error } = await supabaseAdmin
      .from("video_purchases")
      .upsert(
        {
          buyer_id: buyer,
          video_id: videoId,
          tx_hash: txHash || null,
          price_cents,
          currency,
          status: "active",
        },
        { onConflict: "buyer_id,video_id" }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[POST /api/purchases] error", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
