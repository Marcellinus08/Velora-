// src/app/api/profiles/follow/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/profiles/follow
 * 
 * Follow a creator and create a follow notification
 * 
 * Body:
 * {
 *   follower_addr: string (address of follower)
 *   followee_addr: string (address of person being followed)
 *   followee_username: string (optional, for notification context)
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { follower_addr, followee_addr, followee_username } = body;

    console.log("[Follow API] POST request:", { follower_addr, followee_addr, followee_username });

    // Validation
    if (!follower_addr || !followee_addr) {
      console.error("[Follow API] Missing required fields:", { follower_addr, followee_addr });
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["follower_addr", "followee_addr"],
        },
        { status: 400 }
      );
    }

    // Normalize addresses to lowercase
    const normalizedFollower = follower_addr.toLowerCase();
    const normalizedFollowee = followee_addr.toLowerCase();

    // Cannot follow yourself
    if (normalizedFollower === normalizedFollowee) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabaseAdmin
      .from("profiles_follows")
      .select("id")
      .eq("follower_addr", normalizedFollower)
      .eq("followee_addr", normalizedFollowee)
      .maybeSingle();

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 409 }
      );
    }

    // Step 1: Get follower's profile info for notification context
    const { data: followerProfile } = await supabaseAdmin
      .from("profiles")
      .select("username, avatar_url")
      .eq("abstract_id", normalizedFollower)
      .maybeSingle();

    const followerUsername = followerProfile?.username || "Someone";
    const notificationMessage = `${followerUsername} started following you`;

    // Step 2: Create follow record
    const { data: followData, error: followError } = await supabaseAdmin
      .from("profiles_follows")
      .insert({
        follower_addr: normalizedFollower,
        followee_addr: normalizedFollowee,
      })
      .select()
      .single();

    if (followError) {
      console.error("[Follow API] Follow insert error:", followError);
      
      // Check if error is due to missing columns
      if (followError.message?.includes("column") && followError.message?.includes("does not exist")) {
        return NextResponse.json(
          {
            error: "Database schema error",
            message: "Follow feature is not properly configured.",
            dbError: followError.message,
          },
          { status: 503 } // Service Unavailable
        );
      }
      
      throw followError;
    }

    // Step 3: Create notification in notification_follows table
    try {
      const { error: notifError } = await supabaseAdmin
        .from("notification_follows")
        .insert({
          follower_addr: normalizedFollower,
          followee_addr: normalizedFollowee,
          is_read: false,
          read_at: null,
        });

      if (notifError) {
        console.warn("[Follow API] notification_follows insert warning:", notifError.message);
        // Non-critical - follow already succeeded
      }
    } catch (notifError) {
      console.warn("[Follow API] Error creating notification_follows:", notifError);
      // Non-critical - follow already succeeded
    }

    // Step 4: Create notification in main notifications table (untuk display di UI)
    try {
      // Get followee's profile to get user_id
      const { data: followeeProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, abstract_id, username")
        .eq("abstract_id", normalizedFollowee)
        .maybeSingle();

      if (followeeProfile) {
        const notificationMessage = `{actor} started following you`;
        
        const { error: mainNotifError } = await supabaseAdmin
          .from("notifications")
          .insert({
            abstract_id: normalizedFollowee,
            user_id: followeeProfile.id,
            actor_addr: normalizedFollower,
            type: "follow",
            message: notificationMessage,
            target_id: null,
            target_type: "profile",
            metadata: {
              follower_username: followerUsername,
              follower_avatar: followerProfile?.avatar_url || null,
            },
          });

        if (mainNotifError) {
          console.warn("[Follow API] Main notification creation warning:", mainNotifError.message);
          // Non-critical - follow and notification_follows already succeeded
        } else {
          console.log("[Follow API] Notification created for:", normalizedFollowee);
        }
      }
    } catch (notifError) {
      console.warn("[Follow API] Error creating main notification:", notifError);
      // Non-critical - follow already succeeded
    }

    return NextResponse.json(
      {
        success: true,
        follow: followData,
        message: "Successfully followed user",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Follow API] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to follow user",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profiles/follow
 * 
 * Unfollow a creator
 * 
 * Body:
 * {
 *   follower_addr: string
 *   followee_addr: string
 * }
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { follower_addr, followee_addr } = body;

    // Validation
    if (!follower_addr || !followee_addr) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["follower_addr", "followee_addr"],
        },
        { status: 400 }
      );
    }

    // Normalize addresses to lowercase
    const normalizedFollower = follower_addr.toLowerCase();
    const normalizedFollowee = followee_addr.toLowerCase();

    // Check if follow exists
    const { data: followRecord } = await supabaseAdmin
      .from("profiles_follows")
      .select("id")
      .eq("follower_addr", normalizedFollower)
      .eq("followee_addr", normalizedFollowee)
      .maybeSingle();

    if (!followRecord) {
      return NextResponse.json(
        { error: "Not currently following this user" },
        { status: 404 }
      );
    }

    // Delete follow record
    const { error: deleteError } = await supabaseAdmin
      .from("profiles_follows")
      .delete()
      .eq("follower_addr", normalizedFollower)
      .eq("followee_addr", normalizedFollowee);

    if (deleteError) {
      throw deleteError;
    }

    // Delete related notification from notification_follows
    try {
      await supabaseAdmin
        .from("notification_follows")
        .delete()
        .eq("follower_addr", normalizedFollower)
        .eq("followee_addr", normalizedFollowee);
      console.log("[Unfollow API] Deleted notification_follows for:", normalizedFollower, normalizedFollowee);
    } catch (error) {
      console.warn("[Unfollow API] Failed to delete notification_follows:", error);
      // Non-critical - continue
    }

    // Delete related notifications from main notifications table
    try {
      await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("abstract_id", normalizedFollowee)
        .eq("actor_addr", normalizedFollower)
        .eq("type", "follow");
      console.log("[Unfollow API] Deleted notifications for:", normalizedFollower, normalizedFollowee);
    } catch (error) {
      console.warn("[Unfollow API] Failed to delete notifications:", error);
      // Non-critical - continue
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully unfollowed user",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Unfollow API] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to unfollow user",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}
