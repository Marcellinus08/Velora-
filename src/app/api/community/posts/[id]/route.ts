// src/app/api/community/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

// Handle PUT request untuk edit post
export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const postId = params.id;
    const body = await req.json().catch(() => ({}));
    const { abstractId, title, content } = body;

    // Validasi input
    if (!postId || !abstractId || !title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "postId, abstractId, title, and content are required" },
        { status: 400 }
      );
    }

    const normalizedAbstractId = String(abstractId).toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(normalizedAbstractId)) {
      return NextResponse.json(
        { error: "Invalid abstractId format" },
        { status: 400 }
      );
    }

    // 1) Verifikasi kepemilikan post
    const { data: post, error: selErr } = await sbService
      .from("community_posts")
      .select("id, abstract_id")
      .eq("id", postId)
      .maybeSingle();

    if (selErr) throw new Error(selErr.message);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const owner = String(post.abstract_id || "").toLowerCase();
    if (owner !== normalizedAbstractId) {
      return NextResponse.json({ error: "Forbidden: not the owner" }, { status: 403 });
    }

    // 2) Update post
    const { error: updateErr } = await sbService
      .from("community_posts")
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", postId)
      .eq("abstract_id", normalizedAbstractId);

    if (updateErr) throw new Error(updateErr.message);

    return NextResponse.json({
      ok: true,
      updatedId: postId,
      message: "Post updated successfully"
    });
  } catch (e: any) {
    console.error("Error updating post:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const postId = params.id;
    const body = await req.json().catch(() => ({}));
    const abstractId = String(body.abstractId || "").toLowerCase();

    if (!postId || !/^0x[a-f0-9]{40}$/.test(abstractId)) {
      return NextResponse.json({ error: "postId & abstractId required" }, { status: 400 });
    }

    // 1) pastikan post ada dan memang milik abstractId
    const { data: post, error: selErr } = await sbService
      .from("community_posts")
      .select("id, abstract_id")
      .eq("id", postId)
      .maybeSingle();

    if (selErr) throw new Error(selErr.message);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const owner = String(post.abstract_id || "").toLowerCase();
    if (owner !== abstractId) {
      return NextResponse.json({ error: "Forbidden: not the owner" }, { status: 403 });
    }

    // 2) hapus post (FK ON DELETE CASCADE akan ikut hapus replies/likes bila sudah diset)
    const { error: delErr } = await sbService
      .from("community_posts")
      .delete()
      .eq("id", postId)
      .eq("abstract_id", abstractId)
      .limit(1);

    if (delErr) throw new Error(delErr.message);

    // ✅ HAPUS SEMUA NOTIFIKASI yang terkait dengan post ini
    try {
      console.log(`[Delete Post] Starting notification cleanup for post ${postId}`);

      // 1. Hapus notifikasi like pada post ini dari notification_community_likes
      const { data: deletedLikeNotifs, error: err1 } = await sbService
        .from("notification_community_likes")
        .delete()
        .eq("post_id", postId)
        .select();

      if (!err1) {
        console.log(`[Delete Post] Deleted ${deletedLikeNotifs?.length || 0} like notifications from notification_community_likes`);
      }

      // 2. Hapus notifikasi reply pada post ini dari notification_community_replies
      const { data: deletedReplyNotifs, error: err2 } = await sbService
        .from("notification_community_replies")
        .delete()
        .eq("post_id", postId)
        .select();

      if (!err2) {
        console.log(`[Delete Post] Deleted ${deletedReplyNotifs?.length || 0} reply notifications from notification_community_replies`);
      }

      const totalDeleted = 
        (deletedLikeNotifs?.length || 0) + 
        (deletedReplyNotifs?.length || 0);

      console.log(`[Delete Post] ✅ Total ${totalDeleted} notifications deleted for post ${postId}`);
    } catch (notifError) {
      console.error("[Delete Post] Notification cleanup error:", notifError);
      // Don't fail the whole request if notification deletion fails
    }

    return NextResponse.json({ ok: true, deletedId: postId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
