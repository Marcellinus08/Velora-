// src/app/api/videos/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: { id: string } };
const ETH_RE = /^0x[a-f0-9]{40}$/;

/**
 * GET - Fetch all comments for a video
 * Optional query: ?limit=20&offset=0
 */
export async function GET(req: Request, { params }: RouteCtx) {
  try {
    const videoId = params.id;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!videoId) {
      return NextResponse.json({ error: "videoId required" }, { status: 400 });
    }

    const { data: comments, error, count } = await sbService
      .from("video_comments")
      .select("*", { count: "exact" })
      .eq("video_id", videoId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      comments: comments || [],
      count: count || 0,
      limit,
      offset,
    });
  } catch (e: any) {
    console.error("[GET /api/videos/[id]/comments] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * POST - Create a new comment on a video
 * Body: { userAddr, content, parentId? }
 */
export async function POST(req: Request, { params }: RouteCtx) {
  try {
    const videoId = params.id;
    const body = await req.json().catch(() => ({}));
    const userAddr = String(body.userAddr || "").toLowerCase();
    const content = String(body.content || "").trim();
    const parentId = body.parentId || null;

    if (!videoId) {
      return NextResponse.json({ error: "videoId required" }, { status: 400 });
    }

    if (!ETH_RE.test(userAddr)) {
      return NextResponse.json({ error: "userAddr (0x...) required" }, { status: 400 });
    }

    if (!content || content.length === 0 || content.length > 500) {
      return NextResponse.json(
        { error: "Comment must be 1-500 characters" },
        { status: 400 }
      );
    }

    // Get video data and creator info
    const { data: videoData, error: videoErr } = await sbService
      .from("videos")
      .select("abstract_id, title")
      .eq("id", videoId)
      .single();

    if (videoErr) {
      console.error("[POST /api/videos/[id]/comments] Error fetching video:", videoErr);
      return NextResponse.json({ error: "Video fetch error: " + videoErr.message }, { status: 404 });
    }

    if (!videoData) {
      console.warn("[POST /api/videos/[id]/comments] Video not found for ID:", videoId);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const creatorAddr = videoData.abstract_id?.toLowerCase();
    const commentId = uuidv4();

    console.log("[POST /api/videos/[id]/comments] Video data retrieved:", {
      videoId,
      videoTitle: videoData.title,
      videoAbstractId: videoData.abstract_id,
      creatorAddr,
      commenterAddr: userAddr,
      willCreateNotif: !!(creatorAddr && creatorAddr !== userAddr),
    });

    // Insert comment
    const { data: commentData, error: commentErr } = await sbService
      .from("video_comments")
      .insert({
        id: commentId,
        video_id: videoId,
        user_addr: userAddr,
        content: content,
        parent_id: parentId,
      })
      .select()
      .single();

    if (commentErr) throw commentErr;

    console.log("[POST /api/videos/[id]/comments] Comment inserted successfully:", {
      commentId,
      videoId,
      userAddr,
    });

    // ✅ CREATE NOTIFICATION for video creator (only if commenter is not the creator)
    console.log("[POST /api/videos/[id]/comments] Now attempting to create notification...", {
      videoId,
      commentId,
      commenterAddr: userAddr,
      creatorAddr,
      shouldCreate: !!(creatorAddr && creatorAddr !== userAddr),
    });

    if (creatorAddr && creatorAddr !== userAddr) {
      try {
        // Validate comment_id exists (Foreign Key constraint)
        if (!commentId) {
          console.error("[Video Comment Notification] ❌ VALIDATION FAILED - comment_id is required");
          throw new Error("comment_id is required for notification");
        }

        console.log("[Video Comment Notification] Attempting to create notification with:", {
          video_id: videoId,
          video_id_type: typeof videoId,
          comment_id: commentId,
          commenter_addr: userAddr.toLowerCase(),
          creator_addr: creatorAddr.toLowerCase(),
          message: `commented on your video "${videoData.title?.slice(0, 50)}${videoData.title?.length ?? 0 > 50 ? '...' : ''}"`,
        });

        const notifPayload = {
          video_id: videoId,
          comment_id: commentId, // ← Foreign Key to video_comments
          commenter_addr: userAddr.toLowerCase(),
          creator_addr: creatorAddr.toLowerCase(),
          type: "video_comment",
          message: `commented on your video "${videoData.title?.slice(0, 50)}${videoData.title?.length ?? 0 > 50 ? '...' : ''}"`,
        };

        console.log("[Video Comment Notification] Payload to insert:", notifPayload);

        const { data: insertedNotif, error: notifErr } = await supabaseAdmin
          .from("notification_video_comments")
          .insert([notifPayload])
          .select()
          .single();

        console.log("[Video Comment Notification] Insert response:", {
          data: insertedNotif,
          error: notifErr,
        });

        if (notifErr) {
          console.error("[Video Comment Notification] ❌ INSERT FAILED - Error Details:", {
            code: notifErr.code,
            message: notifErr.message,
            details: notifErr.details,
            hint: notifErr.hint,
          });
          console.error("[Video Comment Notification] Full error object:", JSON.stringify(notifErr, null, 2));
          console.error("[Video Comment Notification] RLS Policy might be blocking INSERT");
        } else {
          console.log("[Video Comment] ✅ Created notification successfully:", {
            notificationId: insertedNotif.id,
            creatorAddr: insertedNotif.creator_addr,
            commenterAddr: insertedNotif.commenter_addr,
            videoId: insertedNotif.video_id,
            createdAt: insertedNotif.created_at,
          });
        }
      } catch (notifError) {
        console.error("[Video Comment notification] ❌ CATCH ERROR:", {
          errorType: notifError instanceof Error ? notifError.constructor.name : typeof notifError,
          errorMessage: notifError instanceof Error ? notifError.message : String(notifError),
          errorStack: notifError instanceof Error ? notifError.stack : undefined,
        });
        // Don't fail the comment if notification fails
      }
    }

    // Recount comments for this video
    const { count } = await sbService
      .from("video_comments")
      .select("*", { count: "exact", head: true })
      .eq("video_id", videoId);

    // (optional) sync to aggregate column in videos table
    await sbService
      .from("videos")
      .update({ comments_count: count ?? 0 })
      .eq("id", videoId);

    return NextResponse.json({ 
      comment: commentData,
      commentsCount: count ?? 0,
    });
  } catch (e: any) {
    console.error("[POST /api/videos/[id]/comments] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/**
 * DELETE - Remove a comment from a video
 * Body: { commentId, userAddr }
 */
export async function DELETE(req: Request, { params }: RouteCtx) {
  try {
    const videoId = params.id;
    const body = await req.json().catch(() => ({}));
    const commentId = String(body.commentId || "");
    const userAddr = String(body.userAddr || "").toLowerCase();

    if (!videoId || !commentId) {
      return NextResponse.json({ error: "videoId and commentId required" }, { status: 400 });
    }

    if (!ETH_RE.test(userAddr)) {
      return NextResponse.json({ error: "userAddr (0x...) required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const { data: comment } = await sbService
      .from("video_comments")
      .select("user_addr")
      .eq("id", commentId)
      .eq("video_id", videoId)
      .single();

    if (!comment || comment.user_addr.toLowerCase() !== userAddr) {
      return NextResponse.json(
        { error: "Not authorized to delete this comment" },
        { status: 403 }
      );
    }

    // Delete comment (soft delete)
    const { error: delErr } = await sbService
      .from("video_comments")
      .update({ is_deleted: true })
      .eq("id", commentId)
      .eq("video_id", videoId);

    if (delErr) throw delErr;

    // Delete associated notification
    // Note: With Foreign Key ON DELETE CASCADE, notification will auto-delete
    // But we explicitly delete for consistency and logging
    try {
      const { error: notifDelErr } = await supabaseAdmin
        .from("notification_video_comments")
        .delete()
        .eq("comment_id", commentId);
      
      if (notifDelErr) {
        console.warn("[Video Comment Delete] Warning deleting notification:", notifDelErr);
      } else {
        console.log(`[Video Comment Delete] ✅ Deleted notification for comment ${commentId} via FK cascade`);
      }
    } catch (notifError) {
      console.error("[Video Comment Delete notification] ❌ Error:", notifError);
      // Don't fail the comment delete if notification delete fails
    }

    // Recount comments (only active ones)
    const { count } = await sbService
      .from("video_comments")
      .select("*", { count: "exact", head: true })
      .eq("video_id", videoId)
      .eq("is_deleted", false);

    await sbService
      .from("videos")
      .update({ comments_count: count ?? 0 })
      .eq("id", videoId);

    return NextResponse.json({ 
      deleted: true,
      commentsCount: count ?? 0,
    });
  } catch (e: any) {
    console.error("[DELETE /api/videos/[id]/comments] error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
