import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function absUrl(req: Request, path: string) {
  const u = new URL(req.url);
  u.pathname = path;
  u.search = "";
  return u.toString();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const me = (searchParams.get("me") || "").toLowerCase();

    let query = sbService
      .from("community_posts")
      .select("id, created_at, abstract_id, title, category, content, likes_count, replies_count")
      .order("created_at", { ascending: false })
      .limit(100);

    if (category && category !== "All Topics") query = query.eq("category", category);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    // profiles (username, avatar)
    const authorIds = Array.from(new Set(rows.map((d) => (d.abstract_id || "").toLowerCase())));
    let profiles: Record<string, { username: string | null; avatar_url: string | null }> = {};
    if (authorIds.length) {
      const { data: prof, error: perr } = await sbService
        .from("profiles")
        .select("abstract_id, username, avatar_url")
        .in("abstract_id", authorIds);
      if (perr) throw new Error(perr.message);
      if (prof) {
        profiles = Object.fromEntries(
          prof.map((p) => [p.abstract_id!.toLowerCase(), { username: p.username, avatar_url: p.avatar_url }])
        );
      }
    }

    // fallback avatar dari route abstract atau identicon
    const needFallback = authorIds.filter((a) => !profiles[a]?.avatar_url);
    const absFallback: Record<string, string | null> = {};
    if (needFallback.length) {
      const results = await Promise.allSettled(
        needFallback.map((addr) =>
          fetch(absUrl(req, `/api/abstract/user/${addr}`), { cache: "force-cache" }).then((r) =>
            r.ok ? r.json() : null
          )
        )
      );
      results.forEach((res, i) => {
        const addr = needFallback[i];
        if (res.status === "fulfilled" && res.value) {
          const j = res.value as any;
          absFallback[addr] = j?.profilePicture || j?.avatar || j?.imageUrl || null;
        } else {
          absFallback[addr] = null;
        }
      });
    }

    // liked oleh 'me'
    let likedSet = new Set<string>();
    if (me && /^0x[a-f0-9]{40}$/.test(me) && rows.length) {
      const ids = rows.map((r) => r.id);
      const { data: myLikes, error: lerr } = await sbService
        .from("community_likes")
        .select("post_id")
        .eq("abstract_id", me)
        .in("post_id", ids);
      if (lerr) throw new Error(lerr.message);
      likedSet = new Set((myLikes || []).map((x) => x.post_id as string));
    }

    const posts = rows.map((row) => {
      const addr = (row.abstract_id || "").toLowerCase();
      const prof = profiles[addr] || { username: null, avatar_url: null };
      const avatar =
        prof.avatar_url ||
        absFallback[addr] ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${addr}`;

      return {
        id: row.id,
        authorAddress: addr,
        authorName: prof.username,
        authorAvatar: avatar,
        category: row.category,
        timeAgo: new Date(row.created_at).toLocaleString(),
        title: row.title,
        content: row.content,
        excerpt: row.content.length > 220 ? row.content.slice(0, 220) + "…" : row.content,
        likes: row.likes_count ?? 0,
        replies: row.replies_count ?? 0,
        liked: likedSet.has(row.id),
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

    if (!/^0x[a-f0-9]{40}$/.test(abstractId) || !title || !content) {
      return NextResponse.json({ error: "abstractId (wallet), title, content required" }, { status: 400 });
    }

    await sbService
      .from("profiles")
      .upsert({ abstract_id: abstractId }, { onConflict: "abstract_id", ignoreDuplicates: true });

    const { data, error } = await sbService
      .from("community_posts")
      .insert({ abstract_id: abstractId, title, category, content })
      .select("id, created_at, abstract_id, title, category, content, likes_count, replies_count")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
