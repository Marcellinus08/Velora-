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

    // Search videos by title only - simplified
    const { data: videos, error } = await sbAnonServer
      .from("videos")
      .select("id, title, abstract_id")
      .ilike("title", `%${query}%`)
      .limit(limit);

    if (error) {
      console.error("[GET /api/search/videos] error:", error);
      console.error("Query:", query);
      return NextResponse.json(
        { error: "Failed to search videos", details: error.message },
        { status: 500 }
      );
    }

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
