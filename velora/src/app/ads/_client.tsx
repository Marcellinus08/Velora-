"use client";
import { useEffect, useState } from "react";
import CreateAd from "@/components/ads/create";

export default function AdsClient() {
  const [campaignId, setCampaignId] = useState<string>("");
  const [paidTx, setPaidTx] = useState<`0x${string}` | "">("");

  useEffect(() => {
    if (!campaignId) setCampaignId(crypto.randomUUID());
  }, [campaignId]);

  return (
    <CreateAd
      campaignId={campaignId}
      paidTx={paidTx}
      onPaid={(tx) => setPaidTx(tx)}
    />
  );
}
