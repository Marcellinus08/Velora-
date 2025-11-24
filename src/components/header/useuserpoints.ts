"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook to fetch total points earned by user
 */
export function useUserPoints(userAddress?: `0x${string}` | null) {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userAddress) {
      setTotalPoints(0);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const fetchTotalPoints = async () => {
      try {
        // Fetch sum of all points from user_video_progress
        const { data, error } = await supabase
          .from("user_video_progress")
          .select("total_points_earned")
          .eq("user_addr", userAddress.toLowerCase());

        if (error) {
          console.error("[useUserPoints] Error fetching points:", error);
          if (mounted) setTotalPoints(0);
          return;
        }

        // Sum all points
        const total = (data as Array<{ total_points_earned: number | null }> | null)?.reduce(
          (sum, record) => sum + (record.total_points_earned || 0),
          0
        ) || 0;

        if (mounted) {
          setTotalPoints(total);
        }
      } catch (err) {
        console.error("[useUserPoints] Unexpected error:", err);
        if (mounted) setTotalPoints(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTotalPoints();

    // Set up real-time subscription for points updates
    const channel = supabase
      .channel(`user_points_${userAddress}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_video_progress",
          filter: `user_addr=eq.${userAddress.toLowerCase()}`,
        },
        () => {
          // Re-fetch when data changes
          fetchTotalPoints();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [userAddress]);

  return { totalPoints, loading };
}

