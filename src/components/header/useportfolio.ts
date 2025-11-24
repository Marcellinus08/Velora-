"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook to calculate user's purchase statistics
 * Total Spent = Total amount spent on ALL purchases (videos + meets + ads)
 * Total Purchases = Total number of all transactions (videos + meets + ads)
 */
export function usePortfolio(userAddress?: `0x${string}` | null) {
  const [totalSpentUsd, setTotalSpentUsd] = useState<number>(0);
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userAddress) {
      setTotalSpentUsd(0);
      setTotalPurchases(0);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const fetchPurchaseStats = async () => {
      try {
        let totalCents = 0;
        let videoCount = 0;
        let meetCount = 0;
        let adCount = 0;

        // 1. Fetch video purchases
        try {
          const { data: videoPurchases, error: videoError } = await supabase
            .from("video_purchases")
            .select("video_id, price_cents")
            .eq("buyer_id", userAddress.toLowerCase());

          if (videoError) {
            console.error("[usePortfolio] Error fetching video purchases:", videoError);
          } else if (videoPurchases && Array.isArray(videoPurchases)) {
            videoPurchases.forEach((p: any) => {
              totalCents += (p.price_cents || 0);
            });
            videoCount = videoPurchases.length;
          }
        } catch (e) {
          console.error("[usePortfolio] Video purchases error:", e);
        }

        // 2. Fetch meet purchases
        // TODO: Uncomment when meet page is ready
        /*
        try {
          const { data: meetPurchases, error: meetError } = await supabase
            .from("meets")
            .select("total_price_cents")
            .eq("participant_addr", userAddress.toLowerCase());

          if (meetError) {
            console.error("[usePortfolio] Error fetching meet purchases:", meetError);
          } else if (meetPurchases && Array.isArray(meetPurchases)) {
            meetPurchases.forEach((m: any) => {
              totalCents += (m.total_price_cents || 0);
            });
            meetCount = meetPurchases.length;
          }
        } catch (e) {
          console.error("[usePortfolio] Meet purchases error:", e);
        }
        */

        // 3. Fetch ad campaign creation fees
        try {
          const { data: campaigns, error: campaignError } = await supabase
            .from("campaigns")
            .select("creation_fee_cents")
            .eq("creator_addr", userAddress.toLowerCase());

          if (campaignError) {
            console.error("[usePortfolio] Error fetching campaigns:", campaignError);
          } else if (campaigns && Array.isArray(campaigns)) {
            campaigns.forEach((c: any) => {
              totalCents += (c.creation_fee_cents || 0);
            });
            adCount = campaigns.length;
          }
        } catch (e) {
          console.error("[usePortfolio] Campaigns error:", e);
        }

        // Convert cents to dollars
        const totalUsd = totalCents / 100;
        
        // Calculate total purchases (all transactions)
        const totalTransactions = videoCount + meetCount + adCount;

        if (mounted) {
          setTotalSpentUsd(totalUsd);
          setTotalPurchases(totalTransactions);
        }
      } catch (err) {
        console.error("[usePortfolio] Unexpected error:", err);
        if (mounted) {
          setTotalSpentUsd(0);
          setTotalPurchases(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPurchaseStats();

    // Set up real-time subscriptions for all purchase types
    const videoChannel = supabase
      .channel(`user_video_purchases_${userAddress}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_purchases",
          filter: `buyer_id=eq.${userAddress.toLowerCase()}`,
        },
        () => fetchPurchaseStats()
      )
      .subscribe();

    // TODO: Uncomment when meet page is ready
    /*
    const meetChannel = supabase
      .channel(`user_meet_purchases_${userAddress}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "meets",
          filter: `participant_addr=eq.${userAddress.toLowerCase()}`,
        },
        () => fetchPurchaseStats()
      )
      .subscribe();
    */

    const campaignChannel = supabase
      .channel(`user_campaigns_${userAddress}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaigns",
          filter: `creator_addr=eq.${userAddress.toLowerCase()}`,
        },
        () => fetchPurchaseStats()
      )
      .subscribe();

    return () => {
      mounted = false;
      videoChannel.unsubscribe();
      // meetChannel.unsubscribe(); // TODO: Uncomment when meet page is ready
      campaignChannel.unsubscribe();
    };
  }, [userAddress]);

  return { totalSpentUsd, totalPurchases, loading };
}
