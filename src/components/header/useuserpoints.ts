"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook to fetch total points earned by user with breakdown
 */
export function useUserPoints(userAddress?: `0x${string}` | null) {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [purchasePoints, setPurchasePoints] = useState<number>(0);
  const [taskPoints, setTaskPoints] = useState<number>(0);
  const [sharePoints, setSharePoints] = useState<number>(0);
  const [adsPoints, setAdsPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userAddress) {
      setTotalPoints(0);
      setPurchasePoints(0);
      setTaskPoints(0);
      setSharePoints(0);
      setAdsPoints(0);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const fetchTotalPoints = async () => {
      try {
        // Fetch all points breakdown from user_video_progress
        const { data, error } = await supabase
          .from("user_video_progress")
          .select("total_points_earned, points_from_purchase, points_from_task, points_from_share")
          .eq("user_addr", userAddress.toLowerCase());

        if (error) {
          console.error("[useUserPoints] Error fetching points:", error);
          if (mounted) {
            setTotalPoints(0);
            setPurchasePoints(0);
            setTaskPoints(0);
            setSharePoints(0);
            setAdsPoints(0);
          }
          return;
        }

        // Fetch ads points from user_ads_progress (silently handle missing records)
        const { data: adsData } = await supabase
          .from("user_ads_progress")
          .select("total_ads_points")
          .eq("user_addr", userAddress.toLowerCase())
          .maybeSingle() as { data: { total_ads_points: number } | null };

        const adsPointsTotal = adsData?.total_ads_points || 0;

        // Sum all points by category
        const total = (data as Array<{ 
          total_points_earned: number | null;
          points_from_purchase: number | null;
          points_from_task: number | null;
          points_from_share: number | null;
        }> | null)?.reduce(
          (acc, record) => {
            acc.total += (record.total_points_earned || 0);
            acc.purchase += (record.points_from_purchase || 0);
            acc.task += (record.points_from_task || 0);
            acc.share += (record.points_from_share || 0);
            return acc;
          },
          { total: 0, purchase: 0, task: 0, share: 0 }
        ) || { total: 0, purchase: 0, task: 0, share: 0 };

        if (mounted) {
          setTotalPoints(total.total + adsPointsTotal);
          setPurchasePoints(total.purchase);
          setTaskPoints(total.task);
          setSharePoints(total.share);
          setAdsPoints(adsPointsTotal);
        }
      } catch (err) {
        console.error("[useUserPoints] Unexpected error:", err);
        if (mounted) {
          setTotalPoints(0);
          setPurchasePoints(0);
          setTaskPoints(0);
          setSharePoints(0);
          setAdsPoints(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTotalPoints();

    // Set up real-time subscription for points updates
    const videoChannel = supabase
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

    const adsChannel = supabase
      .channel(`user_ads_points_${userAddress}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_ads_progress",
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
      videoChannel.unsubscribe();
      adsChannel.unsubscribe();
    };
  }, [userAddress]);

  return { totalPoints, purchasePoints, taskPoints, sharePoints, adsPoints, loading };
}

