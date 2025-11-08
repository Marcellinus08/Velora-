// src/app/api/notifications/get-target-title/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/notifications/get-target-title?targetId={id}&targetType={type}
 * Fetch target title (post, reply, or video title)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");
    const targetType = searchParams.get("targetType");

    console.log("[Get Target Title] Request received:", { targetId, targetType });

    if (!targetId || !targetType) {
      return NextResponse.json(
        { error: "Missing targetId or targetType" },
        { status: 400 }
      );
    }

    let title = "";

    if (targetType === "post") {
      // Fetch from community_posts
      const { data: post } = await supabaseAdmin
        .from("community_posts")
        .select("content")
        .eq("id", targetId)
        .maybeSingle();

      console.log("[Get Target Title] Post result:", { targetId, post });

      if (post?.content) {
        // Take first 50 chars, remove markdown, etc
        title = post.content.substring(0, 50).trim();
      }
    } else if (targetType === "reply") {
      // Fetch from community_replies
      const { data: reply } = await supabaseAdmin
        .from("community_replies")
        .select("content")
        .eq("id", targetId)
        .maybeSingle();

      console.log("[Get Target Title] Reply result:", { targetId, reply });

      if (reply?.content) {
        title = reply.content.substring(0, 50).trim();
      }
    } else if (targetType === "video") {
      // Fetch from videos
      const { data: video } = await supabaseAdmin
        .from("videos")
        .select("title")
        .eq("id", targetId)
        .maybeSingle();

      console.log("[Get Target Title] Video result:", { targetId, video });

      if (video?.title) {
        title = video.title.substring(0, 50).trim();
      }
    }

    console.log("[Get Target Title] Final result:", { targetId, targetType, title });

    return NextResponse.json({
      title: title || "Unknown",
      targetType,
      targetId,
    });
  } catch (error: any) {
    console.error("[Get Target Title] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch target title", title: "Unknown" },
      { status: 500 }
    );
  }
}
