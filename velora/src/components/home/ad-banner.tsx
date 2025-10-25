"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  start_date: string | null;
  end_date: string | null;
  status?: string | null;
};

export default function AdBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const now = new Date().toISOString();

      // Ambil 1 campaign aktif terbaru
      const { data, error } = await supabase
        .from("campaigns")
        .select(
          "id,title,description,banner_url,cta_text,cta_link,start_date,end_date,status,created_at"
        )
        .eq("status", "active")
        .lte("start_date", now)
        .gte("end_date", now)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!mounted) return;

      if (!error && data && data.length > 0) {
        setCampaign(data[0] as Campaign);
      } else {
        // Tidak fatal: kalau RLS/permission, cukup tidak tampilkan banner
        console.log("AdBanner info:", error?.message || "no active campaign");
      }
      setLoaded(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loaded || !campaign) return null;

  const title = campaign.title || "Sponsored";
  const desc = campaign.description || "";
  const img = campaign.banner_url || "";
  const ctaText = campaign.cta_text || "Learn more";
  const href = campaign.cta_link || "/";

  async function trackClick() {
    try {
      // Best-effort logging; kalau RLS block, abaikan
      await supabase.from("campaign_clicks").insert({
        campaign_id: campaign.id,
        platform: "web",
      } as any);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mb-6">
      <Link
        href={href}
        onClick={trackClick}
        className="group block overflow-hidden rounded-2xl ring-1 ring-white/10 hover:ring-white/20"
      >
        {img ? (
          <img
            src={img}
            alt={title}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-between bg-gradient-to-r from-neutral-800 to-neutral-700 px-6">
            <div className="max-w-[70%]">
              <div className="text-xs uppercase tracking-wider text-neutral-300/80">
                Sponsored
              </div>
              <div className="mt-1 text-lg font-semibold text-white line-clamp-1">
                {title}
              </div>
              <div className="mt-1 text-sm text-neutral-300 line-clamp-2">
                {desc}
              </div>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white group-hover:bg-white/20">
              {ctaText}
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
