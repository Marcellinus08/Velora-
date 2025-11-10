"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import CreateAd from "@/components/ads/create";

export default function AdsClient() {
  const { address, status } = useAccount();
  const [campaignId, setCampaignId] = useState<string>("");
  const [paidTx, setPaidTx] = useState<`0x${string}` | "">("");
  const [myVideos, setMyVideos] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    if (!campaignId) setCampaignId(crypto.randomUUID());
  }, [campaignId]);

  // Fetch user's videos for dropdown selection
  useEffect(() => {
    async function fetchMyVideos() {
      if (status !== "connected" || !address) {
        console.log("Not connected or no address:", { status, address });
        setMyVideos([]); // Clear videos if not connected
        return;
      }

      console.log("Fetching videos for address:", address);
      const { data, error } = await supabase
        .from("videos")
        .select("id, title")
        .eq("abstract_id", address.toLowerCase())
        .order("created_at", { ascending: false });

      console.log("Videos fetched:", { data, error, count: data?.length });
      
      if (error) {
        console.error("Error fetching videos:", error);
        setMyVideos([]); // Set empty array on error
        return;
      }
      
      // Set user's actual videos (could be empty array if no videos)
      setMyVideos(data || []);
      
      if (!data || data.length === 0) {
        console.log("No videos found for this user. Please upload videos first in Studio.");
      }
    }

    fetchMyVideos();
  }, [status, address]);

  return (
    <CreateAd
      campaignId={campaignId}
      paidTx={paidTx}
      onPaid={(tx) => setPaidTx(tx)}
      myVideos={myVideos}
      creatorAddr={address || ""}
    />
  );
}
