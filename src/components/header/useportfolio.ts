"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook to calculate user's purchase statistics
 * Total Spent = Total amount spent on video purchases
 * Videos Owned = Total number of videos purchased
 */
export function usePortfolio(userAddress?: `0x${string}` | null) {
  const [totalSpentUsd, setTotalSpentUsd] = useState<number>(0);
  const [videosOwned, setVideosOwned] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userAddress) {
      setTotalSpentUsd(0);
      setVideosOwned(0);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const fetchPurchaseStats = async () => {
      try {
        // Fetch all video purchases by this user
        const { data: purchases, error } = await supabase
          .from("video_purchases")
          .select("video_id, price_cents")
          .eq("buyer_id", userAddress.toLowerCase());

        if (error) {
          console.error("[usePortfolio] Error fetching purchases:", error);
          if (mounted) {
            setTotalSpentUsd(0);
            setVideosOwned(0);
          }
          return;
        }

        if (!purchases || purchases.length === 0) {
          if (mounted) {
            setTotalSpentUsd(0);
            setVideosOwned(0);
          }
          return;
        }

        // Calculate total spent
        const totalCents = purchases.reduce((sum, p) => sum + (p.price_cents || 0), 0);
        const totalUsd = totalCents / 100;

        // Count unique videos owned
        const uniqueVideos = new Set(purchases.map(p => p.video_id)).size;

        if (mounted) {
          setTotalSpentUsd(totalUsd);
          setVideosOwned(uniqueVideos);
        }
      } catch (err) {
        console.error("[usePortfolio] Unexpected error:", err);
        if (mounted) {
          setTotalSpentUsd(0);
          setVideosOwned(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPurchaseStats();

    // Set up real-time subscription for purchase updates
    const channel = supabase
      .channel(`user_purchases_${userAddress}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_purchases",
          filter: `buyer_id=eq.${userAddress.toLowerCase()}`,
        },
        () => {
          // Re-fetch when purchases change
          fetchPurchaseStats();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [userAddress]);

  return { totalSpentUsd, videosOwned, loading };
}
