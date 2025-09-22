import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";

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
    } else {
      // PK (reply_id, abstract_id) mencegah duplikasi
      const { error: insErr } = await sbService
        .from("community_reply_likes")
        .insert({ reply_id: replyId, abstract_id: abstractId });
      if (insErr) throw new Error(insErr.message);
      liked = true;
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
