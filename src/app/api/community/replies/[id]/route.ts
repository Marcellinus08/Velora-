import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { content, abstractId } = await req.json();
    const { id } = await params; // await Promise-based params
    
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
      .eq("id", id)
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
      .eq("id", id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { abstractId } = await req.json();
    const { id: replyId } = await params; // await Promise-based params
    
    if (!abstractId) {
      return NextResponse.json(
        { error: "AbstractId is required" },
        { status: 400 }
      );
    }

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

      // 1. Hapus notifikasi reply dari tabel notification_community_replies
      const { data: deletedReplyNotifs, error: err1 } = await supabaseAdmin
        .from("notification_community_replies")
        .delete()
        .eq("reply_id", replyId)
        .select();

      if (!err1) {
        console.log(`[Delete Reply] Deleted ${deletedReplyNotifs?.length || 0} reply notifications from notification_community_replies`);
      }

      // 2. Hapus SEMUA notifikasi like pada reply ini dari notification_reply_likes
      const { data: deletedLikeNotifs, error: err2 } = await supabaseAdmin
        .from("notification_reply_likes")
        .delete()
        .eq("reply_id", replyId)
        .select();

      if (!err2) {
        console.log(`[Delete Reply] Deleted ${deletedLikeNotifs?.length || 0} like notifications from notification_reply_likes`);
      }

      const totalDeleted = 
        (deletedReplyNotifs?.length || 0) + 
        (deletedLikeNotifs?.length || 0);

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