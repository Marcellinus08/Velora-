import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * API endpoint to sync/recalculate ads points from existing campaigns
 * This is needed to populate user_ads_progress for campaigns created before the points system
 */
export async function POST() {
  try {
    // Get all campaigns grouped by creator
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from("campaigns")
      .select("creator_addr, creation_fee_cents, created_at");

    if (campaignsError) {
      console.error("[sync-points] Error fetching campaigns:", campaignsError);
      return NextResponse.json({ error: campaignsError.message }, { status: 500 });
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No campaigns found",
        updated: 0 
      });
    }

    // Group campaigns by creator and calculate points
    const creatorMap = new Map<string, { 
      totalPoints: number; 
      campaignsCount: number;
      lastCampaignAt: string;
    }>();

    campaigns.forEach((campaign) => {
      const addr = campaign.creator_addr.toLowerCase();
      const points = campaign.creation_fee_cents ? Math.floor(campaign.creation_fee_cents / 10) : 0;
      
      const existing = creatorMap.get(addr) || { 
        totalPoints: 0, 
        campaignsCount: 0,
        lastCampaignAt: campaign.created_at
      };

      creatorMap.set(addr, {
        totalPoints: existing.totalPoints + points,
        campaignsCount: existing.campaignsCount + 1,
        lastCampaignAt: campaign.created_at > existing.lastCampaignAt 
          ? campaign.created_at 
          : existing.lastCampaignAt
      });
    });

    // Update or insert records in user_ads_progress
    let updated = 0;
    const errors: any[] = [];

    for (const [userAddr, stats] of creatorMap.entries()) {
      // Check if record exists
      const { data: existing } = await supabaseAdmin
        .from("user_ads_progress")
        .select("id")
        .eq("user_addr", userAddr)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabaseAdmin
          .from("user_ads_progress")
          .update({
            total_ads_points: stats.totalPoints,
            campaigns_created: stats.campaignsCount,
            last_campaign_at: stats.lastCampaignAt,
            updated_at: new Date().toISOString()
          })
          .eq("user_addr", userAddr);

        if (updateError) {
          errors.push({ userAddr, error: updateError.message });
        } else {
          updated++;
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabaseAdmin
          .from("user_ads_progress")
          .insert({
            user_addr: userAddr,
            total_ads_points: stats.totalPoints,
            campaigns_created: stats.campaignsCount,
            last_campaign_at: stats.lastCampaignAt
          });

        if (insertError) {
          errors.push({ userAddr, error: insertError.message });
        } else {
          updated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ads points for ${updated} users`,
      updated,
      totalCampaigns: campaigns.length,
      totalCreators: creatorMap.size,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error("[sync-points] Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow GET to check sync status
export async function GET() {
  try {
    // Count campaigns
    const { count: campaignsCount } = await supabaseAdmin
      .from("campaigns")
      .select("*", { count: "exact", head: true });

    // Count user_ads_progress records
    const { count: progressCount } = await supabaseAdmin
      .from("user_ads_progress")
      .select("*", { count: "exact", head: true });

    // Get sample data
    const { data: sampleProgress } = await supabaseAdmin
      .from("user_ads_progress")
      .select("user_addr, total_ads_points, campaigns_created")
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalCampaigns: campaignsCount || 0,
        totalUsersWithProgress: progressCount || 0,
        needsSync: (campaignsCount || 0) > 0 && (progressCount || 0) === 0
      },
      sample: sampleProgress
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
