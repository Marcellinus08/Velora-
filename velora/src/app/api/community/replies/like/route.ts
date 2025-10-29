import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ETH_RE = /^0x[a-f0-9]{40}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const replyId = String(body.replyId || "").trim();
    const abstractId = String(body.abstractId || "").trim().toLowerCase();

    if (!replyId || !ETH_RE.test(abstractId)) {
      return NextResponse.json({ error: "replyId & abstractId required" }, { status: 400 });
    }

    // === Toggle: jika sudah ada -> delete (unlike), jika belum -> insert (like) ===
    const { data: existing, error: selErr } = await sbService
      .from("community_reply_likes")
      .select("reply_id")
      .eq("reply_id", replyId)
      .eq("abstract_id", abstractId)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    let liked: boolean;
    if (existing) {
      const { error: delErr } = await sbService
        .from("community_reply_likes")
        .delete()
        .eq("reply_id", replyId)
        .eq("abstract_id", abstractId);
      if (delErr) throw new Error(delErr.message);
      liked = false;

      // ✅ HAPUS NOTIFIKASI saat unlike reply/comment
      try {
        const { data: replyData } = await sbService
          .from("community_replies")
          .select("abstract_id")
          .eq("id", replyId)
          .single();

        if (replyData && replyData.abstract_id) {
          const replyOwnerAddr = replyData.abstract_id.toLowerCase();
          
          if (replyOwnerAddr !== abstractId) {
            await supabaseAdmin
              .from("notifications")
              .delete()
              .eq("abstract_id", replyOwnerAddr)
              .eq("actor_addr", abstractId)
              .eq("type", "like")
              .eq("target_id", replyId)
              .eq("target_type", "comment");
            
            console.log(`[Unlike Reply] Deleted notification for reply ${replyId}`);
          }
        }
      } catch (notifError) {
        console.error("[Unlike reply notification] Error:", notifError);
      }
    } else {
      // PK (reply_id, abstract_id) mencegah duplikasi
      const { error: insErr } = await sbService
        .from("community_reply_likes")
        .insert({ reply_id: replyId, abstract_id: abstractId });
      if (insErr) throw new Error(insErr.message);
      liked = true;

      // ✅ KIRIM NOTIFIKASI saat like reply/comment
      try {
        const { data: replyData } = await sbService
          .from("community_replies")
          .select("abstract_id, content")
          .eq("id", replyId)
          .single();

        if (replyData && replyData.abstract_id) {
          const replyOwnerAddr = replyData.abstract_id.toLowerCase();
          
          // Jangan kirim notifikasi jika like comment sendiri
          if (replyOwnerAddr !== abstractId) {
            const { data: insertedNotif, error: notifErr } = await supabaseAdmin
              .from("notifications")
              .insert({
                abstract_id: replyOwnerAddr,
                user_id: replyOwnerAddr,
                actor_addr: abstractId,
                type: "like",
                target_id: replyId,
                target_type: "comment",
                message: replyData.content 
                  ? `liked your comment: "${replyData.content.slice(0, 50)}${replyData.content.length > 50 ? '...' : ''}"`
                  : "liked your comment",
              })
              .select()
              .single();

            if (notifErr) {
              console.error("[Like reply notification] Error:", notifErr);
            } else {
              console.log("[Like Reply] Created notification:", insertedNotif.id);
            }
          }
        }
      } catch (notifError) {
        console.error("[Like reply notification] Error:", notifError);
      }
    }

    // Ambil jumlah likes terbaru (HEAD + count) untuk sinkron UI
    const { count, error: cntErr } = await sbService
      .from("community_reply_likes")
      .select("*", { head: true, count: "exact" })
      .eq("reply_id", replyId);
    if (cntErr) throw new Error(cntErr.message);

    return NextResponse.json({ liked, likes: count ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
