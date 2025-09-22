// src/app/api/community/posts/route.ts
import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicUrl(path: string) {
  const { data } = sbService.storage.from("community").getPublicUrl(path);
  return data.publicUrl;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const me = (searchParams.get("me") || "").toLowerCase();

    let q = sbService
      .from("community_posts")
      .select("id, created_at, abstract_id, title, category, content, likes_count, replies_count")
      .order("created_at", { ascending: false })
      .limit(100);

    if (category && category !== "All Topics") q = q.eq("category", category);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const postIds = rows.map((r) => r.id);

    // Files untuk setiap post
    let filesMap: Record<
      string,
      { path: string; url: string; mime: string | null; width: number | null; height: number | null; duration_s: number | null }[]
    > = {};
    if (postIds.length) {
      const { data: files, error: ferr } = await sbService
        .from("community_post_files")
        .select("post_id, path, mime, width, height, duration_s")
        .in("post_id", postIds);
      if (ferr) throw new Error(ferr.message);

      filesMap = (files || []).reduce((acc, f) => {
        const list = acc[f.post_id] || [];
        list.push({
          path: f.path,
          url: publicUrl(f.path),
          mime: f.mime,
          width: f.width,
          height: f.height,
          duration_s: f.duration_s,
        });
        acc[f.post_id] = list;
        return acc;
      }, {} as Record<string, any[]>);
    }

    // Profile author (username & avatar dari DB)
    const authorIds = Array.from(new Set(rows.map((r) => (r.abstract_id || "").toLowerCase())));
    let profs: Record<string, { username: string | null; avatar_url: string | null }> = {};
    if (authorIds.length) {
      const { data: p, error: perr } = await sbService
        .from("profiles")
        .select("abstract_id, username, avatar_url")
        .in("abstract_id", authorIds);
      if (perr) throw new Error(perr.message);
      profs = Object.fromEntries((p || []).map((x) => [x.abstract_id!.toLowerCase(), { username: x.username, avatar_url: x.avatar_url }]));
    }

    // Liked set milik 'me'
    let likedSet = new Set<string>();
    if (me && /^0x[a-f0-9]{40}$/.test(me) && postIds.length) {
      const { data: likes, error: lerr } = await sbService
        .from("community_likes")
        .select("post_id")
        .eq("abstract_id", me)
        .in("post_id", postIds);
      if (lerr) throw new Error(lerr.message);
      likedSet = new Set((likes || []).map((x) => x.post_id as string));
    }

    const posts = rows.map((row) => {
      const addr = (row.abstract_id || "").toLowerCase();
      const prof = profs[addr] || { username: null, avatar_url: null };
      return {
        id: row.id,
        authorAddress: addr,
        authorName: prof.username,
        authorAvatar: prof.avatar_url,
        category: row.category,
        timeAgo: new Date(row.created_at).toLocaleString(),
        title: row.title,
        content: row.content,
        excerpt: row.content.length > 220 ? row.content.slice(0, 220) + "…" : row.content,
        likes: row.likes_count ?? 0,
        replies: row.replies_count ?? 0,
        liked: likedSet.has(row.id),
        media: filesMap[row.id] || [],
      };
    });

    return NextResponse.json({ posts });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const abstractId = String(body.abstractId || "").trim().toLowerCase();
    const title = String(body.title || "").trim();
    const category = String(body.category || "All Topics").trim();
    const content = String(body.content || "").trim();
    const mediaPaths: string[] = Array.isArray(body.mediaPaths) ? body.mediaPaths : [];

    if (!/^0x[a-f0-9]{40}$/.test(abstractId) || !title || !content) {
      return NextResponse.json({ error: "abstractId (wallet), title, content required" }, { status: 400 });
    }

    await sbService
      .from("profiles")
      .upsert({ abstract_id: abstractId }, { onConflict: "abstract_id", ignoreDuplicates: true });

    const { data: post, error } = await sbService
      .from("community_posts")
      .insert({ abstract_id: abstractId, title, category, content })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (mediaPaths.length) {
      const rows = mediaPaths.map((p) => ({ post_id: post.id, path: p }));
      const { error: ferr } = await sbService.from("community_post_files").insert(rows);
      if (ferr) throw new Error(ferr.message);
    }

    return NextResponse.json({ postId: post.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
