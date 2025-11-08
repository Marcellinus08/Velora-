import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  post_id: string;
  parent_id: string | null;
  abstract_id: string;
  content: string;
  created_at: string;
};

const ETH_RE = /^0x[a-f0-9]{40}$/;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id;
    const { searchParams } = new URL(req.url);
    const me = (searchParams.get("me") || "").toLowerCase();

    // 1) ambil reply dasar
    const { data: rows, error } = await sbService
      .from("community_replies")
      .select("id, post_id, parent_id, abstract_id, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const base = (rows || []) as Row[];
    const replyIds = base.map((r) => r.id);

    // 2) likes count
    const likesCount: Record<string, number> = {};
    if (replyIds.length) {
      const { data: likeRows, error: lerr } = await sbService
        .from("community_reply_likes")
        .select("reply_id")
        .in("reply_id", replyIds);
      if (lerr) throw new Error(lerr.message);
      for (const r of likeRows || [])
        likesCount[r.reply_id as string] = (likesCount[r.reply_id as string] ?? 0) + 1;
    }

    // 3) child replies count
    const repliesCount: Record<string, number> = {};
    if (replyIds.length) {
      const { data: children, error: cerr } = await sbService
        .from("community_replies")
        .select("parent_id")
        .in("parent_id", replyIds);
      if (cerr) throw new Error(cerr.message);
      for (const r of children || []) {
        const pid = r.parent_id as string | null;
        if (!pid) continue;
        repliesCount[pid] = (repliesCount[pid] ?? 0) + 1;
      }
    }

    // 4) sudah di-like oleh 'me'?
    const likedSet = new Set<string>();
    if (me && ETH_RE.test(me) && replyIds.length) {
      const { data: mine, error: merr } = await sbService
        .from("community_reply_likes")
        .select("reply_id")
        .eq("abstract_id", me)
        .in("reply_id", replyIds);
      if (merr) throw new Error(merr.message);
      for (const r of mine || []) likedSet.add(r.reply_id as string);
    }

    // 5) ambil profile
    const addrs = Array.from(new Set(base.map((r) => (r.abstract_id || "").toLowerCase()))).filter(Boolean);
    let profMap: Record<string, { username: string | null; avatar_url: string | null }> = {};
    if (addrs.length) {
      const { data: profs, error: perr } = await sbService
        .from("profiles")
        .select("abstract_id, username, avatar_url")
        .in("abstract_id", addrs);
      if (perr) throw new Error(perr.message);
      profMap = Object.fromEntries(
        (profs || []).map((p) => [p.abstract_id!.toLowerCase(), { username: p.username, avatar_url: p.avatar_url }]),
      );
    }

    // 6) bentuk item
    const items = base.map((r) => {
      const addr = (r.abstract_id || "").toLowerCase();
      const prof = profMap[addr] || { username: null, avatar_url: null };
      return {
        id: r.id,
        postId: r.post_id,
        parentId: r.parent_id,
        authorAddress: addr,
        authorName: prof.username,
        authorAvatar: prof.avatar_url || null, // FE fallback ke AbstractProfile
        content: r.content,
        createdAt: r.created_at,
        likes: likesCount[r.id] ?? 0,
        replies: repliesCount[r.id] ?? 0,
        liked: likedSet.has(r.id),
      };
    });

    // 7) jadikan tree
    const map = new Map<string, any>();
    const roots: any[] = [];
    for (const it of items) map.set(it.id, { ...it, children: [] });
    for (const it of map.values()) {
      if (it.parentId && map.has(it.parentId)) map.get(it.parentId).children.push(it);
      else roots.push(it);
    }

    return NextResponse.json({ items: roots });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const postId = params.id;
    const abstractId = String(body.abstractId || "").trim().toLowerCase();
    const content = String(body.content || "").trim();
    const parentId = body.parentId ? String(body.parentId) : null;

    if (!postId || !ETH_RE.test(abstractId) || !content) {
      return NextResponse.json({ error: "postId, abstractId, content required" }, { status: 400 });
    }

    await sbService
      .from("profiles")
      .upsert({ abstract_id: abstractId }, { onConflict: "abstract_id", ignoreDuplicates: true });

    const { data, error } = await sbService
      .from("community_replies")
      .insert({ post_id: postId, abstract_id: abstractId, content, parent_id: parentId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // ✅ KIRIM NOTIFIKASI saat comment/reply
    try {
      let recipientAddr: string | null = null;
      let message = "";
      let notifData: any = null;

      if (parentId) {
        // Ini adalah reply ke comment lain
        const { data: parentReply } = await sbService
          .from("community_replies")
          .select("abstract_id")
          .eq("id", parentId)
          .single();

        if (parentReply && parentReply.abstract_id) {
          recipientAddr = parentReply.abstract_id.toLowerCase();
          message = `replied to your comment: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`;
          
          notifData = {
            reply_id: data?.id,
            post_id: postId,
            parent_reply_id: parentId,
            actor_addr: abstractId,
            recipient_addr: recipientAddr,
            type: "nested_reply",
            message,
          };
        }
      } else {
        // Ini adalah comment ke post
        const { data: postData } = await sbService
          .from("community_posts")
          .select("abstract_id, title")
          .eq("id", postId)
          .single();

        if (postData && postData.abstract_id) {
          recipientAddr = postData.abstract_id.toLowerCase();
          const postTitle = postData.title 
            ? `"${postData.title.slice(0, 50)}${postData.title.length > 50 ? '...' : ''}"`
            : "your post";
          const contentSnippet = content.slice(0, 50) + (content.length > 50 ? "..." : "");
          message = `{actor} replied to ${postTitle}: "${contentSnippet}"`;
          
          notifData = {
            reply_id: data?.id,
            post_id: postId,
            actor_addr: abstractId,
            recipient_addr: recipientAddr,
            type: "reply",
            message,
            post_title: postData.title || "Post", // Store title for display
          };
        }
      }

      // Jangan kirim notifikasi jika comment/reply ke diri sendiri
      if (recipientAddr && recipientAddr !== abstractId && notifData) {
        const { data: insertedNotif, error: notifErr } = await supabaseAdmin
          .from("notification_community_replies")
          .insert(notifData)
          .select()
          .single();

        if (notifErr) {
          console.error("[Comment/Reply notification] Error:", notifErr);
        } else {
          console.log("[Comment/Reply] Created notification in notification_community_replies:", insertedNotif.id);
        }
      }
    } catch (notifError) {
      console.error("[Comment/Reply notification] Error:", notifError);
    }

    return NextResponse.json({ ok: true, id: data?.id || null }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
