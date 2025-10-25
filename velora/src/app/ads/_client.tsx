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
        return;
      }

      console.log("Fetching videos for address:", address);
      const { data, error } = await supabase
        .from("videos")
        .select("id, title")
        .eq("abstract_id", address.toLowerCase())
        .order("created_at", { ascending: false });

      console.log("Videos fetched:", { data, error, count: data?.length });
      if (data) {
        setMyVideos(data);
        if (data.length === 0) {
          console.log("No videos found for this user. Please upload videos first in Studio.");
          // Untuk testing, tambahkan dummy video jika tidak ada
          setMyVideos([
            { id: "test-1", title: "Test Video 1" },
            { id: "test-2", title: "Test Video 2" }
          ]);
        }
      } else if (error) {
        console.error("Error fetching videos:", error);
        // Untuk testing, tambahkan dummy video jika ada error
        setMyVideos([
          { id: "test-1", title: "Test Video 1" },
          { id: "test-2", title: "Test Video 2" }
        ]);
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
