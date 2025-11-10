import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/user-progress?userAddr=0x...&videoId=...
 * Mendapatkan progress user untuk video tertentu
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddr = searchParams.get("userAddr")?.toLowerCase();
    const videoId = searchParams.get("videoId");

    if (!userAddr || !videoId) {
      return NextResponse.json(
        { error: "userAddr and videoId are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("user_video_progress")
      .select("*")
      .eq("user_addr", userAddr)
      .eq("video_id", videoId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ progress: data || null });
  } catch (error: any) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-progress
 * Update progress user (purchase, task completion, atau share)
 * Body: { userAddr, videoId, action: 'purchase' | 'task' | 'share', totalPoints }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userAddr, videoId, action, totalPoints, isCorrect } = body;

    if (!userAddr || !videoId || !action) {
      return NextResponse.json(
        { error: "userAddr, videoId, and action are required" },
        { status: 400 }
      );
    }

    const userAddrLower = userAddr.toLowerCase();

    // Get video data including creator info
    const { data: videoData } = await supabaseAdmin
      .from("videos")
      .select("points_total, price_cents, abstract_id")
      .eq("id", videoId)
      .single();

    if (!videoData) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Check if user is the creator/owner of the video
    const isCreator = videoData.abstract_id?.toLowerCase() === userAddrLower;
    
    if (isCreator) {
      return NextResponse.json(
        { error: "Video creators cannot earn points from their own videos" },
        { status: 403 }
      );
    }

    // Get video's points_total from database if not provided
    let videoTotalPoints = totalPoints || videoData.points_total || 0;

    // Untuk action task dan share, cek apakah video berbayar dan apakah user sudah beli
    if (action === "task" || action === "share") {
      // Video berbayar, cek apakah user sudah purchase
      if (videoData.price_cents > 0) {
        const { data: purchaseData } = await supabaseAdmin
          .from("video_purchases")
          .select("id")
          .eq("video_id", videoId)
          .eq("buyer_id", userAddrLower)
          .maybeSingle();

        if (!purchaseData) {
          return NextResponse.json(
            { error: "You must purchase this video before completing this action" },
            { status: 403 }
          );
        }
      }
    }

    // Hitung poin berdasarkan action
    let pointsToAdd = 0;
    let updateFields: any = { updated_at: new Date().toISOString() };

    switch (action) {
      case "purchase":
        pointsToAdd = Math.floor(videoTotalPoints * 0.4); // 40%
        updateFields.has_purchased = true;
        updateFields.points_from_purchase = pointsToAdd;
        updateFields.purchased_at = new Date().toISOString();
        break;
      case "task":
        // Hanya berikan poin jika jawaban benar (isCorrect === true)
        if (isCorrect === true) {
          pointsToAdd = Math.floor(videoTotalPoints * 0.2); // 20%
        } else {
          pointsToAdd = 0; // Tidak dapat poin jika jawaban salah
        }
        updateFields.has_completed_task = true;
        updateFields.points_from_task = pointsToAdd;
        updateFields.task_completed_at = new Date().toISOString();
        break;
      case "share":
        pointsToAdd = Math.floor(videoTotalPoints * 0.4); // 40%
        updateFields.has_shared = true;
        updateFields.points_from_share = pointsToAdd;
        updateFields.shared_at = new Date().toISOString();
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action. Must be 'purchase', 'task', or 'share'" },
          { status: 400 }
        );
    }

    // Cek apakah user sudah pernah melakukan action ini
    const { data: existing } = await supabaseAdmin
      .from("user_video_progress")
      .select("*")
      .eq("user_addr", userAddrLower)
      .eq("video_id", videoId)
      .maybeSingle();

    // Jika sudah pernah melakukan action ini, jangan berikan poin lagi
    if (existing) {
      const alreadyDone =
        (action === "purchase" && existing.has_purchased) ||
        (action === "task" && existing.has_completed_task) ||
        (action === "share" && existing.has_shared);

      if (alreadyDone) {
        return NextResponse.json({
          message: `User already completed ${action}`,
          progress: existing,
          pointsAwarded: 0,
        });
      }

      // Update existing record
      const newTotalPoints = (existing.total_points_earned || 0) + pointsToAdd;
      updateFields.total_points_earned = newTotalPoints;

      const { data: updated, error } = await supabaseAdmin
        .from("user_video_progress")
        .update(updateFields)
        .eq("user_addr", userAddrLower)
        .eq("video_id", videoId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        message: `${action} completed successfully`,
        progress: updated,
        pointsAwarded: pointsToAdd,
      });
    } else {
      // Create new record
      updateFields.user_addr = userAddrLower;
      updateFields.video_id = videoId;
      updateFields.total_points_earned = pointsToAdd;

      const { data: created, error } = await supabaseAdmin
        .from("user_video_progress")
        .insert(updateFields)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        message: `${action} completed successfully`,
        progress: created,
        pointsAwarded: pointsToAdd,
      });
    }
  } catch (error: any) {
    console.error("Error updating user progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 }
    );
  }
}
