import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const okAddr = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s || "");

// GET endpoint for debugging purchases
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    const buyerId = searchParams.get("buyerId")?.toLowerCase();

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    let query = supabaseAdmin
      .from("video_purchases")
      .select("*")
      .eq("video_id", videoId);

    if (buyerId) {
      query = query.ilike("buyer_id", buyerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ 
      purchases: data,
      count: data?.length || 0,
      videoId,
      buyerId: buyerId || "all"
    });
  } catch (e: any) {
    console.error("[GET /api/purchases] error", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

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

    // ✅ CREATE NOTIFICATION untuk video creator
    try {
      // Get video creator info
      const { data: videoData } = await supabaseAdmin
        .from("videos")
        .select("abstract_id, title, points_total")
        .eq("id", videoId)
        .single();

      if (videoData && videoData.abstract_id) {
        const creatorAddr = videoData.abstract_id.toLowerCase();
        
        // Hanya buat notifikasi jika pembeli berbeda dari pencipta
        if (creatorAddr !== buyer) {
          const price_usd = price_cents / 100;
          const { data: notifData, error: notifErr } = await supabaseAdmin
            .from("notification_video_purchases")
            .insert({
              buyer_addr: buyer,
              creator_addr: creatorAddr,
              video_id: videoId,
              price_cents: price_cents,
              currency: currency,
              tx_hash: txHash || null,
              type: "video_purchase",
              message: `${buyer.slice(0, 6)}...${buyer.slice(-4)} bought your video "${videoData.title || 'Untitled'}" for $${price_usd.toFixed(2)}`,
            })
            .select()
            .single();

          if (notifErr) {
            console.error("[Video Purchase Notification] Error:", notifErr);
          } else {
            console.log("[Video Purchase] Created notification:", notifData?.id);
          }
        }
      }
    } catch (notifError) {
      console.error("[Video Purchase Notification] Error:", notifError);
      // Don't fail the purchase if notification fails
    }

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
