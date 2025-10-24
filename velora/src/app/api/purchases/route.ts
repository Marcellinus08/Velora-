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

    // Create or update progress record for purchase (award 40% points)
    try {
      // Get video's total points
      const { data: videoData } = await supabaseAdmin
        .from("videos")
        .select("points_total")
        .eq("id", videoId)
        .single();

      const totalPoints = videoData?.points_total || 0;
      const purchasePoints = Math.floor(totalPoints * 0.4); // 40%

      // Create/update progress record
      await supabaseAdmin
        .from("user_video_progress")
        .upsert(
          {
            user_addr: buyer,
            video_id: videoId,
            has_purchased: true,
            points_from_purchase: purchasePoints,
            purchased_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { 
            onConflict: "user_addr,video_id",
            ignoreDuplicates: false 
          }
        )
        .select()
        .single()
        .then(({ data }) => {
          if (data) {
            // Update total_points_earned
            const newTotal = (data.points_from_task || 0) + (data.points_from_share || 0) + purchasePoints;
            return supabaseAdmin
              .from("user_video_progress")
              .update({ total_points_earned: newTotal, updated_at: new Date().toISOString() })
              .eq("user_addr", buyer)
              .eq("video_id", videoId);
          }
        });
    } catch (progressError) {
      console.error("Error creating progress record:", progressError);
      // Don't fail the purchase if progress tracking fails
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[POST /api/purchases] error", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
