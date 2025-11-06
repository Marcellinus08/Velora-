import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/profiles/follow/status
 * 
 * Check if a user is following another user
 * 
 * Body:
 * {
 *   follower_addr: string
 *   followee_addr: string
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { follower_addr, followee_addr } = body;

    if (!follower_addr || !followee_addr) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["follower_addr", "followee_addr"],
        },
        { status: 400 }
      );
    }

    const normalizedFollower = follower_addr.toLowerCase();
    const normalizedFollowee = followee_addr.toLowerCase();

    const { data, error } = await supabaseAdmin
      .from("profiles_follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_addr", normalizedFollower)
      .eq("followee_addr", normalizedFollowee)
      .maybeSingle();

    if (error) {
      console.error("[Follow Status API] Error:", error);
      throw error;
    }

    return NextResponse.json(
      {
        isFollowing: !!data,
        follower_addr: normalizedFollower,
        followee_addr: normalizedFollowee,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Follow Status API] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to check follow status",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}
