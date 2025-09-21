import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

function shortAddrOk(a?: string) {
  return !!a && /^0x[a-f0-9]{40}$/.test(a);
}

function absUrl(req: Request, path: string) {
  const u = new URL(req.url);
  u.pathname = path;
  u.search = "";
  return u.toString();
}

/** GET: list replies for a post. Optional ?cursor=<created_at ISO>&limit=30 */
export async function GET(req: Request, { params }: Ctx) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 30), 1), 100);
    const cursor = searchParams.get("cursor"); // created_at cursor (ISO)

    let q = sbService
      .from("community_replies")
      .select("id, created_at, post_id, abstract_id, content, parent_id")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (cursor) q = q.gt("created_at", cursor);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // join profiles
    const ids = Array.from(new Set(rows.map((r) => (r.abstract_id || "").toLowerCase())));
    let profiles: Record<string, { username: string | null; avatar_url: string | null }> = {};
    if (ids.length) {
      const { data: prof, error: perr } = await sbService
        .from("profiles")
        .select("abstract_id, username, avatar_url")
        .in("abstract_id", ids);
      if (perr) throw new Error(perr.message);
      profiles = Object.fromEntries(
        (prof || []).map((p) => [p.abstract_id!.toLowerCase(), { username: p.username, avatar_url: p.avatar_url }])
      );
    }

    // fallback avatar
    const needFallback = ids.filter((a) => !profiles[a]?.avatar_url);
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
        absFallback[addr] =
          res.status === "fulfilled" && res.value
            ? res.value.profilePicture || res.value.avatar || res.value.imageUrl || null
            : null;
      });
    }

    const replies = rows.map((r) => {
      const addr = (r.abstract_id || "").toLowerCase();
      const prof = profiles[addr] || { username: null, avatar_url: null };
      const avatar =
        prof.avatar_url ||
        absFallback[addr] ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${addr}`;

      return {
        id: r.id,
        createdAt: r.created_at,
        postId: r.post_id,
        authorAddress: addr,
        authorName: prof.username,
        authorAvatar: avatar,
        content: r.content,
        parentId: r.parent_id,
      };
    });

    const nextCursor = replies.length ? replies[replies.length - 1].createdAt : null;

    return NextResponse.json({ replies, nextCursor });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/** POST: create reply  body: { abstractId, content, parentId? } */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const body = await req.json().catch(() => ({}));
    const abstractId = String(body.abstractId || "").trim().toLowerCase();
    const content = String(body.content || "").trim();
    const parentId = body.parentId ? String(body.parentId) : null;

    if (!shortAddrOk(abstractId) || !content) {
      return NextResponse.json({ error: "abstractId (wallet) & content required" }, { status: 400 });
    }

    await sbService
      .from("profiles")
      .upsert({ abstract_id: abstractId }, { onConflict: "abstract_id", ignoreDuplicates: true });

    const { data, error } = await sbService
      .from("community_replies")
      .insert({ post_id: params.id, abstract_id: abstractId, content, parent_id: parentId })
      .select("id, created_at, post_id, abstract_id, content, parent_id")
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ reply: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
