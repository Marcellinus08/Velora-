import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddr = searchParams.get("userAddr")?.toLowerCase();
    const type = searchParams.get("type"); // 'all', 'videos', 'subscriptions', 'meets', 'ads'
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userAddr) {
      return NextResponse.json({ error: "userAddr is required" }, { status: 400 });
    }

    const history: any[] = [];

    // 1. Video Purchases
    if (!type || type === "all" || type === "videos") {
      const { data: videoPurchases, error: vpError } = await supabaseAdmin
        .from("video_purchases")
        .select(`
          *,
          video:videos (
            id,
            title,
            thumb_url,
            abstract_id,
            creator:profiles!videos_abstract_id_fkey (
              username,
              avatar_url
            )
          )
        `)
        .eq("buyer_id", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!vpError && videoPurchases) {
        videoPurchases.forEach((purchase) => {
          const creatorAddr = purchase.video?.abstract_id;
          const creatorName = 
            purchase.video?.creator?.username || 
            (creatorAddr ? `${creatorAddr.slice(0, 6)}…${creatorAddr.slice(-4)}` : "Unknown");
          
          history.push({
            type: "video_purchase",
            id: purchase.id,
            date: purchase.created_at,
            video: {
              id: purchase.video?.id,
              title: purchase.video?.title || "Unknown Video",
              thumbnail: purchase.video?.thumb_url,
              creator: creatorName,
              creatorAvatar: purchase.video?.creator?.avatar_url,
            },
            price: (purchase.price_cents || 0) / 100,
            currency: purchase.currency || "USDC",
            status: purchase.status || "completed",
            txHash: purchase.tx_hash,
          });
        });
      }
    }

    // 2. Subscription Payments (jika ada tabel subscriptions)
    // TODO: Implement when subscriptions table is ready
    // if (!type || type === "all" || type === "subscriptions") {
    //   const { data: subscriptions } = await supabaseAdmin
    //     .from("user_subscriptions")
    //     .select("*")
    //     .eq("user_addr", userAddr)
    //     .order("created_at", { ascending: false });
    //   
    //   if (subscriptions) {
    //     subscriptions.forEach((sub) => {
    //       history.push({
    //         type: "subscription",
    //         id: sub.id,
    //         date: sub.created_at,
    //         tier: sub.tier,
    //         price: sub.price_cents / 100,
    //         currency: "USDC",
    //         status: sub.status,
    //         startDate: sub.start_date,
    //         endDate: sub.end_date,
    //       });
    //     });
    //   }
    // }

    // 3. Meet/Call Purchases
    if (!type || type === "all" || type === "meets") {
      const { data: meetPurchases, error: mpError } = await supabaseAdmin
        .from("meets")
        .select(`
          *,
          creator:profiles!meets_creator_addr_fkey (
            username,
            avatar_url,
            abstract_id
          ),
          participant:profiles!meets_participant_addr_fkey (
            username,
            avatar_url,
            abstract_id
          )
        `)
        .eq("participant_addr", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!mpError && meetPurchases) {
        meetPurchases.forEach((meet) => {
          const creatorName = 
            meet.creator?.username || 
            (meet.creator_addr ? `${meet.creator_addr.slice(0, 6)}…${meet.creator_addr.slice(-4)}` : "Unknown");
          
          history.push({
            type: "meet_purchase",
            id: meet.id,
            date: meet.created_at,
            meet: {
              id: meet.id,
              creator: creatorName,
              creatorAvatar: meet.creator?.avatar_url,
              creatorAddr: meet.creator_addr,
              duration: meet.duration_minutes || 0,
              scheduledAt: meet.scheduled_at,
            },
            price: (meet.total_price_cents || 0) / 100,
            currency: "USDC",
            status: meet.status || "scheduled",
          });
        });
      }
    }

    // 4. Ad Purchases (jika ada tabel ad_purchases)
    // TODO: Implement when ad_purchases table is ready
    // if (!type || type === "all" || type === "ads") {
    //   const { data: adPurchases } = await supabaseAdmin
    //     .from("ad_purchases")
    //     .select("*")
    //     .eq("buyer_addr", userAddr)
    //     .order("created_at", { ascending: false });
    //   
    //   if (adPurchases) {
    //     adPurchases.forEach((ad) => {
    //       history.push({
    //         type: "ad_purchase",
    //         id: ad.id,
    //         date: ad.created_at,
    //         adType: ad.ad_type,
    //         duration: ad.duration_days,
    //         price: ad.price_cents / 100,
    //         currency: "USDC",
    //         status: ad.status,
    //         impressions: ad.impressions,
    //       });
    //     });
    //   }
    // }

    // Sort all history by date (newest first)
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get user's created ads count and add them to history
    const { data: userCampaigns } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("creator_addr", userAddr);

    const adsCreated = userCampaigns?.length || 0;

    // Add campaigns to history if type is 'all' or 'ads'
    if ((!type || type === "all" || type === "ads") && userCampaigns) {
      // Get real-time click counts for each campaign
      const now = new Date();
      
      for (const campaign of userCampaigns) {
        const { count: clickCount } = await supabaseAdmin
          .from("campaign_clicks")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", campaign.id);
        
        // Determine real-time status based on dates
        let realStatus = campaign.status;
        
        if (campaign.end_date && campaign.start_date) {
          const endDate = new Date(campaign.end_date);
          const startDate = new Date(campaign.start_date);
          
          // If campaign has ended (past end_date), mark as ended
          if (now > endDate) {
            realStatus = "ended";
          }
          // If campaign hasn't started yet
          else if (now < startDate) {
            realStatus = campaign.status === "paused" ? "paused" : "pending";
          }
          // If currently within date range
          else if (now >= startDate && now <= endDate) {
            if (campaign.status === "paused") {
              realStatus = "paused";
            } else {
              realStatus = "active";
            }
          }
        }
        
        history.push({
          type: "ad_campaign",
          id: campaign.id,
          date: campaign.created_at,
          campaign: {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            banner_url: campaign.banner_url,
            cta_text: campaign.cta_text,
            cta_link: campaign.cta_link,
            video_id: campaign.video_id,
          },
          price: (campaign.creation_fee_cents || 0) / 100,
          currency: "USDC",
          status: realStatus,
          txHash: campaign.payment_tx_hash,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          totalClicks: clickCount || 0,
        });
      }

      // Re-sort after adding campaigns
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Calculate total spent - SEMUA pengeluaran (videos + meets + ads creation fee)
    const totalSpent = history.reduce((sum, item) => sum + (item.price || 0), 0);

    return NextResponse.json({
      success: true,
      userAddr,
      history: history.slice(0, limit),
      stats: {
        totalTransactions: history.length,
        totalSpent,
        videoPurchases: history.filter((h) => h.type === "video_purchase").length,
        meetPurchases: history.filter((h) => h.type === "meet_purchase").length,
        subscriptions: history.filter((h) => h.type === "subscription").length,
        adPurchases: history.filter((h) => h.type === "ad_purchase").length,
        adsCreated,
      },
    });
  } catch (e: any) {
    console.error("[GET /api/leaderboard/history] error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
