// src/app/api/videos/[id]/like/route.ts
import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };
const ETH_RE = /^0x[a-f0-9]{40}$/;

export async function POST(req: Request, { params }: RouteCtx) {
  try {
    const { id: videoId } = await params; // await Promise-based params
    const body = await req.json().catch(() => ({}));
    const userAddr = String(body.userAddr || "").toLowerCase();

    if (!videoId || !ETH_RE.test(userAddr)) {
      return NextResponse.json(
        { error: "videoId & userAddr (0x...) required" },
        { status: 400 }
      );
    }

    // Check if user already liked this video
    const { data: likedRow, error: selErr } = await sbService
      .from("video_likes")
      .select("id")
      .eq("video_id", videoId)
      .eq("user_addr", userAddr)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    let liked: boolean;

    if (likedRow) {
      // Already liked → unlike (delete)
      const { error: delErr } = await sbService
        .from("video_likes")
        .delete()
        .eq("video_id", videoId)
        .eq("user_addr", userAddr);
      if (delErr) throw new Error(delErr.message);
      liked = false;

      // ✅ DELETE NOTIFICATION when unlike
      try {
        const { data: videoData } = await sbService
          .from("videos")
          .select("abstract_id")
          .eq("id", videoId)
          .single();

        if (videoData && videoData.abstract_id) {
          const creatorAddr = videoData.abstract_id.toLowerCase();
          
          if (creatorAddr !== userAddr) {
            await supabaseAdmin
              .from("notification_video_likes")
              .delete()
              .eq("video_id", videoId)
              .eq("liker_addr", userAddr)
              .eq("creator_addr", creatorAddr);
            
            console.log(`[Video Unlike] Deleted notification for video ${videoId}`);
          }
        }
      } catch (notifError) {
        console.error("[Video Unlike notification] Error:", notifError);
      }
    } else {
      // Not yet liked → insert
      const { error: insErr } = await sbService
        .from("video_likes")
        .insert({ video_id: videoId, user_addr: userAddr });
      if (insErr) throw new Error(insErr.message);
      liked = true;

      // ✅ CREATE NOTIFICATION when like
      try {
        const { data: videoData } = await sbService
          .from("videos")
          .select("abstract_id, title")
          .eq("id", videoId)
          .single();

        if (videoData && videoData.abstract_id) {
          const creatorAddr = videoData.abstract_id.toLowerCase();
          
          // Don't send notification if liking own video
          if (creatorAddr !== userAddr) {
            const { data: insertedNotif, error: notifErr } = await supabaseAdmin
              .from("notification_video_likes")
              .insert({
                video_id: videoId,
                liker_addr: userAddr,
                creator_addr: creatorAddr,
                type: "video_like",
                message: videoData.title 
                  ? `{actor} liked your video "${videoData.title.slice(0, 50)}${videoData.title.length > 50 ? '...' : ''}".`
                  : "{actor} liked your video.",
                video_title: videoData.title || "Video", // Store title for display
              })
              .select()
              .single();

            if (notifErr) {
              console.error("[Video Like notification] Error:", notifErr);
            } else {
              console.log("[Video Like] Created notification:", insertedNotif.id);
            }
          }
        }
      } catch (notifError) {
        console.error("[Video Like notification] Error:", notifError);
      }
    }

    // Recount total likes for this video
    const { count, error: cntErr } = await sbService
      .from("video_likes")
      .select("*", { count: "exact", head: true })
      .eq("video_id", videoId);
    if (cntErr) throw new Error(cntErr.message);

    const likeCount = count ?? 0;

    // (optional) sync to aggregate column in videos table
    await sbService
      .from("videos")
      .update({ likes_count: likeCount })
      .eq("id", videoId);

    return NextResponse.json({ liked, likeCount });
  } catch (e: any) {
    console.error("[POST /api/videos/[id]/like] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
