import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const body = await req.json().catch(() => ({}));
    const abstractId = String(body.abstractId || "").trim();
    const postId = params.id;

    if (!abstractId) {
      return NextResponse.json({ error: "abstractId required" }, { status: 400 });
    }

    // HYBRID: pastikan profile ada (idempotent)
    // v2: UPSERT + onConflict + ignoreDuplicates
    const { error: perr } = await sbService
      .from("profiles")
      .upsert({ abstract_id: abstractId }, { onConflict: "abstract_id", ignoreDuplicates: true });
    if (perr) throw new Error(perr.message);

    // Cek sudah like?
    const { data: liked, error: selErr } = await sbService
      .from("community_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("abstract_id", abstractId)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    if (liked) {
      const { error: delErr } = await sbService
        .from("community_likes")
        .delete()
        .eq("post_id", postId)
        .eq("abstract_id", abstractId);
      if (delErr) throw new Error(delErr.message);
      return NextResponse.json({ liked: false });
    } else {
      const { error: insErr } = await sbService
        .from("community_likes")
        .insert({ post_id: postId, abstract_id: abstractId });
      if (insErr) throw new Error(insErr.message);
      return NextResponse.json({ liked: true });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
