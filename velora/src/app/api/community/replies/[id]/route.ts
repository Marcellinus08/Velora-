import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content, abstractId } = await req.json();
    
    if (!content?.trim() || !abstractId) {
      return NextResponse.json(
        { error: "Content and abstractId are required" },
        { status: 400 }
      );
    }

    // Verify the user owns this reply
    const { data: reply } = await supabaseAdmin
      .from("community_replies")
      .select("abstract_id")
      .eq("id", params.id)
      .single();

    if (!reply) {
      return NextResponse.json(
        { error: "Reply not found" },
        { status: 404 }
      );
    }

    if (reply.abstract_id.toLowerCase() !== abstractId.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update the reply
    const { error, data } = await supabaseAdmin
      .from("community_replies")
      .update({ 
        content: content.trim()
      })
      .eq("id", params.id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[API] Edit reply error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to edit reply" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { abstractId } = await req.json();
    
    if (!abstractId) {
      return NextResponse.json(
        { error: "AbstractId is required" },
        { status: 400 }
      );
    }

    const replyId = params.id;

    // Get reply data before deletion
    const { data: reply } = await supabaseAdmin
      .from("community_replies")
      .select("abstract_id, parent_id, post_id")
      .eq("id", replyId)
      .single();

    if (!reply) {
      return NextResponse.json(
        { error: "Reply not found" },
        { status: 404 }
      );
    }

    if (reply.abstract_id.toLowerCase() !== abstractId.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the reply
    const { error } = await supabaseAdmin
      .from("community_replies")
      .delete()
      .eq("id", replyId);

    if (error) throw error;

    // ✅ HAPUS SEMUA NOTIFIKASI yang terkait dengan reply ini
    try {
      console.log(`[Delete Reply] Starting notification cleanup for reply ${replyId}`);

      // 1. Hapus notifikasi "comment" atau "reply" yang dibuat saat user ini comment/reply
      // Ini adalah notifikasi yang diterima oleh pemilik post/parent comment
      const { data: deletedCommentNotifs, error: err1 } = await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("actor_addr", abstractId.toLowerCase())
        .eq("target_id", replyId)
        .in("target_type", ["comment", "post"])
        .select();

      if (!err1) {
        console.log(`[Delete Reply] Deleted ${deletedCommentNotifs?.length || 0} comment/reply notifications`);
      }

      // 2. Hapus SEMUA notifikasi "like" pada reply ini
      // Ini adalah notifikasi yang diterima oleh user yang comment (pemilik reply)
      // dari semua user yang like reply ini
      const { data: deletedLikeNotifs, error: err2 } = await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("target_id", replyId)
        .eq("target_type", "comment")
        .eq("type", "like")
        .select();

      if (!err2) {
        console.log(`[Delete Reply] Deleted ${deletedLikeNotifs?.length || 0} like notifications on this reply`);
      }

      // 3. BONUS: Hapus notifikasi "reply" dari child replies (jika ada nested replies)
      // Jika ada user yang reply ke reply ini, hapus juga notifikasi tersebut
      const { data: deletedChildNotifs, error: err3 } = await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("abstract_id", abstractId.toLowerCase())
        .eq("type", "reply")
        .eq("target_id", replyId)
        .eq("target_type", "comment")
        .select();

      if (!err3) {
        console.log(`[Delete Reply] Deleted ${deletedChildNotifs?.length || 0} nested reply notifications`);
      }

      const totalDeleted = 
        (deletedCommentNotifs?.length || 0) + 
        (deletedLikeNotifs?.length || 0) +
        (deletedChildNotifs?.length || 0);

      console.log(`[Delete Reply] ✅ Total ${totalDeleted} notifications deleted for reply ${replyId}`);
    } catch (notifError) {
      console.error("[Delete Reply] Notification cleanup error:", notifError);
      // Don't fail the whole request if notification deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[API] Delete reply error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to delete reply" },
      { status: 500 }
    );
  }
}