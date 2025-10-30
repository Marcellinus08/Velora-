// src/app/api/community/posts/[id]/like/route.ts
import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: { id: string } };
const ETH_RE = /^0x[a-f0-9]{40}$/;

export async function POST(req: Request, { params }: RouteCtx) {
  try {
    const postId = params.id;
    const body = await req.json().catch(() => ({}));
    const abstractId = String(body.abstractId || "").toLowerCase();

    if (!postId || !ETH_RE.test(abstractId)) {
      return NextResponse.json(
        { error: "postId & abstractId (0x...) required" },
        { status: 400 }
      );
    }

    // Pastikan profil ada (idempotent)
    const { error: perr } = await sbService
      .from("profiles")
      .upsert({ abstract_id: abstractId }, { onConflict: "abstract_id", ignoreDuplicates: true });
    if (perr) throw new Error(perr.message);

    // Cek apakah user sudah like
    const { data: likedRow, error: selErr } = await sbService
      .from("community_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("abstract_id", abstractId)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    let liked: boolean;

    if (likedRow) {
      // Sudah like → hapus (unlike)
      const { error: delErr } = await sbService
        .from("community_likes")
        .delete()
        .eq("post_id", postId)
        .eq("abstract_id", abstractId);
      if (delErr) throw new Error(delErr.message);
      liked = false;

      // ✅ HAPUS NOTIFIKASI saat unlike
      try {
        const { data: postData } = await sbService
          .from("community_posts")
          .select("abstract_id")
          .eq("id", postId)
          .single();

        if (postData && postData.abstract_id) {
          const postOwnerAddr = postData.abstract_id.toLowerCase();
          
          if (postOwnerAddr !== abstractId) {
            await supabaseAdmin
              .from("notification_community_likes")
              .delete()
              .eq("post_id", postId)
              .eq("actor_addr", abstractId)
              .eq("recipient_addr", postOwnerAddr);
            
            console.log(`[Unlike] Deleted notification from notification_community_likes for post ${postId}`);
          }
        }
      } catch (notifError) {
        console.error("[Unlike notification] Error:", notifError);
      }
    } else {
      // Belum like → insert
      const { error: insErr } = await sbService
        .from("community_likes")
        .insert({ post_id: postId, abstract_id: abstractId });
      if (insErr) throw new Error(insErr.message);
      liked = true;

      // ✅ KIRIM NOTIFIKASI saat like
      try {
        const { data: postData } = await sbService
          .from("community_posts")
          .select("abstract_id, title")
          .eq("id", postId)
          .single();

        if (postData && postData.abstract_id) {
          const postOwnerAddr = postData.abstract_id.toLowerCase();
          
          // Jangan kirim notifikasi jika like post sendiri
          if (postOwnerAddr !== abstractId) {
            const { data: insertedNotif, error: notifErr } = await supabaseAdmin
              .from("notification_community_likes")
              .insert({
                post_id: postId,
                actor_addr: abstractId,
                recipient_addr: postOwnerAddr,
                type: "like",
                message: postData.title 
                  ? `liked your post "${postData.title.slice(0, 50)}${postData.title.length > 50 ? '...' : ''}"`
                  : "liked your post",
              })
              .select()
              .single();

            if (notifErr) {
              console.error("[Like notification] Error:", notifErr);
            } else {
              console.log("[Like] Created notification in notification_community_likes:", insertedNotif.id);
            }
          }
        }
      } catch (notifError) {
        console.error("[Like notification] Error:", notifError);
      }
    }

    // Hitung ulang total like untuk post ini
    const { count, error: cntErr } = await sbService
      .from("community_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    if (cntErr) throw new Error(cntErr.message);

    const likes = count ?? 0;

    // (opsional) sinkronkan ke kolom aggregate di posts
    await sbService
      .from("community_posts")
      .update({ likes_count: likes })
      .eq("id", postId);

    return NextResponse.json({ liked, likes });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
