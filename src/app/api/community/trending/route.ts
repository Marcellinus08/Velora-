import { NextRequest, NextResponse } from "next/server";
import { sbAnonServer } from "@/lib/supabase-server";

export const revalidate = 300; // Cache for 5 minutes

function publicUrl(path: string) {
  const { data } = sbAnonServer.storage.from("community").getPublicUrl(path);
  return data.publicUrl;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const me = (searchParams.get("me") || "").toLowerCase();
    
    // Get all posts
    let query = sbAnonServer
      .from("community_posts")
      .select("id, title, content, category, abstract_id, created_at, likes_count, replies_count");
    
    // Filter by category if provided and not "All"
    if (category && category !== "All" && category !== "All Topics") {
      query = query.eq("category", category);
    }
    
    const { data: rows, error: postsError } = await query;

    if (postsError) {
      console.error("[GET /api/community/trending] posts error:", postsError);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    const postIds = rows?.map((r) => r.id) || [];

    // Get files for each post
    let filesMap: Record<string, any[]> = {};
    if (postIds.length) {
      const { data: files } = await sbAnonServer
        .from("community_post_files")
        .select("post_id, path, mime, width, height, duration_s")
        .in("post_id", postIds);

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

    // Get profiles
    const authorIds = Array.from(new Set(rows?.map((r) => (r.abstract_id || "").toLowerCase()) || []));
    let profs: Record<string, { username: string | null; avatar_url: string | null }> = {};
    if (authorIds.length) {
      const { data: p } = await sbAnonServer
        .from("profiles")
        .select("abstract_id, username, avatar_url")
        .in("abstract_id", authorIds);
      profs = Object.fromEntries((p || []).map((x) => [x.abstract_id!.toLowerCase(), { username: x.username, avatar_url: x.avatar_url }]));
    }

    // Get liked posts for current user
    let likedSet = new Set<string>();
    if (me && /^0x[a-f0-9]{40}$/.test(me) && postIds.length) {
      const { data: likes } = await sbAnonServer
        .from("community_likes")
        .select("post_id")
        .eq("abstract_id", me)
        .in("post_id", postIds);
      likedSet = new Set((likes || []).map((x) => x.post_id as string));
    }

    // Calculate trending score: (likes × 2) + (replies × 1)
    const postsWithScore = (rows || []).map((row) => {
      const postLikes = row.likes_count || 0;
      const postReplies = row.replies_count || 0;
      const trendingScore = (postLikes * 2) + (postReplies * 1);

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
        likes: postLikes,
        replies: postReplies,
        liked: likedSet.has(row.id),
        media: filesMap[row.id] || [],
        trendingScore,
        created_at: row.created_at
      };
    });

    // Sort by trending score (descending), then by created_at (newest first) for ties
    const trendingPosts = postsWithScore
      .sort((a, b) => {
        if (b.trendingScore !== a.trendingScore) {
          return b.trendingScore - a.trendingScore;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 10);

    // Log for debugging
    console.log("[Community Trending] Top 10 posts:");
    trendingPosts.forEach((post, idx) => {
      console.log(`${idx + 1}. ${post.title} - Score: ${post.trendingScore} (Likes: ${post.likes}, Replies: ${post.replies})`);
    });

    return NextResponse.json({ posts: trendingPosts });
  } catch (e) {
    console.error("[GET /api/community/trending] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
