import { NextRequest, NextResponse } from "next/server";
import { sbAnonServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ videos: [] });
    }

    // Get all videos and filter in JavaScript
    const { data: allVideos, error } = await sbAnonServer
      .from("videos")
      .select("id, title, abstract_id, thumb_url, category");
    
    if (error) throw error;
    
    // Filter by title or category
    const videos = (allVideos || []).filter(video => 
      video.title?.toLowerCase().includes(query.toLowerCase()) ||
      video.category?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);



    console.log(`[GET /api/search/videos] Found ${videos?.length || 0} videos for query: "${query}"`);
    return NextResponse.json({ videos: videos || [] });
  } catch (e) {
    console.error("[GET /api/search/videos] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
