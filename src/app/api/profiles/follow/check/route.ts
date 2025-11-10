// src/app/api/profiles/follow/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const follower = searchParams.get("follower");
    const followee = searchParams.get("followee");

    console.log("[Follow Check API] Request:", { follower, followee });

    if (!follower || !followee) {
      return NextResponse.json(
        { error: "Missing follower or followee address" },
        { status: 400 }
      );
    }

    const normalizedFollower = follower.toLowerCase();
    const normalizedFollowee = followee.toLowerCase();

    console.log("[Follow Check API] Normalized:", { normalizedFollower, normalizedFollowee });

    // Use supabaseAdmin for full access
    const { data, error } = await supabaseAdmin
      .from("profiles_follows")
      .select("id")
      .eq("follower_addr", normalizedFollower)
      .eq("followee_addr", normalizedFollowee)
      .maybeSingle();

    if (error) {
      console.error("[Follow Check API] Database error:", error);
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      );
    }

    const isFollowing = !!data;
    
    console.log("[Follow Check API] Result:", { 
      follower: normalizedFollower, 
      followee: normalizedFollowee, 
      isFollowing,
      recordId: data?.id 
    });

    return NextResponse.json(
      { isFollowing },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error("[Follow Check API] Error:", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}
