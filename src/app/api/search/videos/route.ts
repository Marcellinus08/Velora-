import { NextRequest, NextResponse } from "next/server";
import { sbAnonServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ videos: [] });
    }

    // Search videos by title, description, or tags
    const { data: videos, error } = await sbAnonServer
      .from("videos")
      .select("id, title, thumbnail, abstract_id, views, created_at, price_cents")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.ilike.%${query}%`)
      .order("views", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[GET /api/search/videos] error:", error);
      return NextResponse.json(
        { error: "Failed to search videos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ videos: videos || [] });
  } catch (e) {
    console.error("[GET /api/search/videos] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
