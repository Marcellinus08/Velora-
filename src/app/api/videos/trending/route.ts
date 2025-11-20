import { NextRequest, NextResponse } from "next/server";
import { sbAnonServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    // Get all videos with their stats
    const { data: videos, error: videosError } = await sbAnonServer
      .from("videos")
      .select(`
        id, title, description, category, thumb_url,
        price_cents, currency, points_total, abstract_id,
        creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
      `);

    if (videosError) {
      console.error("[GET /api/videos/trending] videos error:", videosError);
      return NextResponse.json(
        { error: "Failed to fetch videos" },
        { status: 500 }
      );
    }

    // Get buyers count for each video
    const { data: purchases } = await sbAnonServer
      .from("video_purchases")
      .select("video_id")
      .neq("status", "refunded");

    // Get likes count for each video
    const { data: likes } = await sbAnonServer
      .from("video_likes")
      .select("video_id");

    // Get comments count for each video
    const { data: comments } = await sbAnonServer
      .from("video_comments")
      .select("video_id");

    // Count stats per video
    const buyersCount: Record<string, number> = {};
    const likesCount: Record<string, number> = {};
    const commentsCount: Record<string, number> = {};

    purchases?.forEach((p) => {
      buyersCount[p.video_id] = (buyersCount[p.video_id] || 0) + 1;
    });

    likes?.forEach((l) => {
      likesCount[l.video_id] = (likesCount[l.video_id] || 0) + 1;
    });

    comments?.forEach((c) => {
      commentsCount[c.video_id] = (commentsCount[c.video_id] || 0) + 1;
    });

    // Calculate trending score: (buyers × 2) + (likes × 2) + (comments × 1)
    const videosWithScore = (videos || []).map((video) => {
      const buyers = buyersCount[video.id] || 0;
      const videoLikes = likesCount[video.id] || 0;
      const videoComments = commentsCount[video.id] || 0;
      
      const trendingScore = (buyers * 2) + (videoLikes * 2) + (videoComments * 1);

      return {
        ...video,
        trendingScore,
        stats: {
          buyers,
          likes: videoLikes,
          comments: videoComments
        }
      };
    });

    // Sort by trending score and take top 10
    const trendingVideos = videosWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 10);

    return NextResponse.json({ videos: trendingVideos });
  } catch (e) {
    console.error("[GET /api/videos/trending] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
