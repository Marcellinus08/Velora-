// src/lib/follow-utils.ts
/**
 * Utility functions untuk Follow feature
 */

import { supabase } from "@/lib/supabase";

/**
 * Check apakah user A follow user B
 */
export async function isUserFollowing(
  followerAddr: string,
  followeeAddr: string
): Promise<boolean> {
  try {
    const normalizedFollower = followerAddr.toLowerCase();
    const normalizedFollowee = followeeAddr.toLowerCase();

    const { data, error } = await supabase
      .from("profiles_follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_addr", normalizedFollower)
      .eq("followee_addr", normalizedFollowee)
      .maybeSingle();

    if (error) {
      console.error("[Follow Utils] Error checking follow status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("[Follow Utils] Error in isUserFollowing:", error);
    return false;
  }
}

/**
 * Get follower count untuk seorang user
 */
export async function getFollowerCount(userAddr: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("profiles_follows")
      .select("*", { count: "exact", head: true })
      .eq("followee_addr", userAddr.toLowerCase());

    if (error) {
      console.error("[Follow Utils] Error getting follower count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[Follow Utils] Error in getFollowerCount:", error);
    return 0;
  }
}

/**
 * Get following count untuk seorang user (berapa banyak yang di-follow)
 */
export async function getFollowingCount(userAddr: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("profiles_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_addr", userAddr.toLowerCase());

    if (error) {
      console.error("[Follow Utils] Error getting following count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[Follow Utils] Error in getFollowingCount:", error);
    return 0;
  }
}

/**
 * Get list of followers untuk seorang user
 */
export async function getFollowers(
  userAddr: string,
  limit: number = 50,
  offset: number = 0
): Promise<Array<{ follower_addr: string; created_at: string }>> {
  try {
    const { data, error } = await supabase
      .from("profiles_follows")
      .select("follower_addr, created_at")
      .eq("followee_addr", userAddr.toLowerCase())
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[Follow Utils] Error getting followers:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Follow Utils] Error in getFollowers:", error);
    return [];
  }
}

/**
 * Get list of users yang di-follow oleh seorang user
 */
export async function getFollowing(
  userAddr: string,
  limit: number = 50,
  offset: number = 0
): Promise<Array<{ followee_addr: string; created_at: string }>> {
  try {
    const { data, error } = await supabase
      .from("profiles_follows")
      .select("followee_addr, created_at")
      .eq("follower_addr", userAddr.toLowerCase())
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[Follow Utils] Error getting following list:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Follow Utils] Error in getFollowing:", error);
    return [];
  }
}

/**
 * Get unread follow notifications untuk seorang user
 */
export async function getUnreadFollowNotifications(
  userAddr: string
): Promise<
  Array<{
    id: string;
    follower_addr: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
  }>
> {
  try {
    const { data, error } = await supabase
      .from("notification_follows")
      .select("id, follower_addr, is_read, read_at, created_at")
      .eq("followee_addr", userAddr.toLowerCase())
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Follow Utils] Error getting notifications:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Follow Utils] Error in getUnreadFollowNotifications:", error);
    return [];
  }
}

/**
 * Mark follow notification sebagai read
 */
export async function markFollowNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    const updateData = { 
      is_read: true,
      read_at: new Date().toISOString() 
    };

    const { error } = await (supabase
      .from("notification_follows")
      .update(updateData as never)
      .eq("id", notificationId) as any);

    if (error) {
      console.error("[Follow Utils] Error marking as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Follow Utils] Error in markFollowNotificationAsRead:", error);
    return false;
  }
}

/**
 * Get follow stats untuk seorang user (followers, following, unread notifications)
 */
export async function getFollowStats(userAddr: string): Promise<{
  followerCount: number;
  followingCount: number;
  unreadNotificationCount: number;
}> {
  try {
    const normalizedAddr = userAddr.toLowerCase();

    // Get all counts in parallel
    const [followersRes, followingRes, notifRes] = await Promise.all([
      supabase
        .from("profiles_follows")
        .select("*", { count: "exact", head: true })
        .eq("followee_addr", normalizedAddr),

      supabase
        .from("profiles_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_addr", normalizedAddr),

      supabase
        .from("notification_follows")
        .select("*", { count: "exact", head: true })
        .eq("followee_addr", normalizedAddr)
        .eq("is_read", false),
    ]);

    return {
      followerCount: followersRes.count || 0,
      followingCount: followingRes.count || 0,
      unreadNotificationCount: notifRes.count || 0,
    };
  } catch (error) {
    console.error("[Follow Utils] Error in getFollowStats:", error);
    return {
      followerCount: 0,
      followingCount: 0,
      unreadNotificationCount: 0,
    };
  }
}

/**
 * Get list of mutually followed users (follower-following relationship)
 */
export async function getMutualFollows(userAddr: string): Promise<string[]> {
  try {
    const normalizedAddr = userAddr.toLowerCase();

    // Get users that this user follows
    const { data: following } = (await supabase
      .from("profiles_follows")
      .select("followee_addr")
      .eq("follower_addr", normalizedAddr)) as any;

    if (!following || following.length === 0) {
      return [];
    }

    const followeeAddrs = following.map((f: any) => f.followee_addr);

    // Check which of those users follow back
    const { data: mutuals } = (await supabase
      .from("profiles_follows")
      .select("follower_addr")
      .eq("followee_addr", normalizedAddr)
      .in("follower_addr", followeeAddrs)) as any;

    return mutuals?.map((m: any) => m.follower_addr) || [];
  } catch (error) {
    console.error("[Follow Utils] Error in getMutualFollows:", error);
    return [];
  }
}

/**
 * Batch check following status untuk multiple users
 */
export async function batchCheckFollowing(
  followerAddr: string,
  followeeAddrs: string[]
): Promise<Map<string, boolean>> {
  try {
    const normalizedFollower = followerAddr.toLowerCase();
    const normalizedFollowees = followeeAddrs.map((a) => a.toLowerCase());

    const { data, error } = (await supabase
      .from("profiles_follows")
      .select("followee_addr")
      .eq("follower_addr", normalizedFollower)
      .in("followee_addr", normalizedFollowees)) as any;

    if (error) {
      console.error("[Follow Utils] Error in batch check:", error);
      // Return all as false if error
      return new Map(normalizedFollowees.map((a) => [a, false]));
    }

    const followingSet = new Set(data?.map((d: any) => d.followee_addr) || []);
    const result = new Map(
      normalizedFollowees.map((a) => [a, followingSet.has(a)])
    );

    return result;
  } catch (error) {
    console.error("[Follow Utils] Error in batchCheckFollowing:", error);
    return new Map(followeeAddrs.map((a) => [a, false]));
  }
}

/**
 * Get top followed creators (untuk leaderboard atau recommendation)
 */
export async function getTopFollowedCreators(
  limit: number = 10
): Promise<
  Array<{
    followee_addr: string;
    follower_count: number;
  }>
> {
  try {
    const { data, error } = await supabase
      .from("profiles_follows")
      .select("followee_addr")
      .then((res) => {
        if (res.error) throw res.error;

        const counts = new Map<string, number>();
        res.data?.forEach((row: any) => {
          const addr = row.followee_addr;
          counts.set(addr, (counts.get(addr) || 0) + 1);
        });

        // Convert to array and sort
        const sorted = Array.from(counts.entries())
          .map(([addr, count]) => ({
            followee_addr: addr,
            follower_count: count,
          }))
          .sort((a, b) => b.follower_count - a.follower_count)
          .slice(0, limit);

        return { data: sorted, error: null };
      });

    return data || [];
  } catch (error) {
    console.error("[Follow Utils] Error in getTopFollowedCreators:", error);
    return [];
  }
}

/**
 * Check if two users have mutual follow (follow each other)
 */
export async function hasMutualFollow(
  userAAddr: string,
  userBAddr: string
): Promise<boolean> {
  try {
    const normalizedA = userAAddr.toLowerCase();
    const normalizedB = userBAddr.toLowerCase();

    const [followsRes, followedByRes] = await Promise.all([
      supabase
        .from("profiles_follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_addr", normalizedA)
        .eq("followee_addr", normalizedB),

      supabase
        .from("profiles_follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_addr", normalizedB)
        .eq("followee_addr", normalizedA),
    ]);

    return (followsRes.count || 0) > 0 && (followedByRes.count || 0) > 0;
  } catch (error) {
    console.error("[Follow Utils] Error in hasMutualFollow:", error);
    return false;
  }
}
