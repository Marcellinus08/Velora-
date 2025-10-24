import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/migrate-purchases
 * Migrate existing video purchases to user_video_progress table
 * This will create progress records for all existing purchases
 */
export async function POST(req: NextRequest) {
  try {
    // Fetch all video purchases
    const { data: purchases, error: purchasesError } = await supabaseAdmin
      .from("video_purchases")
      .select(`
        id,
        buyer_id,
        video_id,
        created_at,
        videos!inner(
          points_total
        )
      `);

    if (purchasesError) throw purchasesError;

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({
        message: "No purchases found to migrate",
        migrated: 0,
      });
    }

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    // Process each purchase
    for (const purchase of purchases) {
      try {
        const buyerId = purchase.buyer_id.toLowerCase();
        const videoId = purchase.video_id;
        const totalPoints = (purchase.videos as any)?.points_total || 0;
        const pointsFromPurchase = Math.floor(totalPoints * 0.4); // 40%

        // Check if progress record already exists
        const { data: existing } = await supabaseAdmin
          .from("user_video_progress")
          .select("id")
          .eq("user_addr", buyerId)
          .eq("video_id", videoId)
          .maybeSingle();

        if (existing) {
          // Already migrated, skip
          skipped++;
          continue;
        }

        // Create progress record
        const { error: insertError } = await supabaseAdmin
          .from("user_video_progress")
          .insert({
            user_addr: buyerId,
            video_id: videoId,
            has_purchased: true,
            has_completed_task: false,
            has_shared: false,
            points_from_purchase: pointsFromPurchase,
            points_from_task: 0,
            points_from_share: 0,
            total_points_earned: pointsFromPurchase,
            purchased_at: purchase.created_at,
            task_completed_at: null,
            shared_at: null,
            created_at: purchase.created_at,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`Error migrating purchase ${purchase.id}:`, insertError);
          errors++;
        } else {
          migrated++;
        }
      } catch (err) {
        console.error(`Error processing purchase ${purchase.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      message: "Migration completed",
      total: purchases.length,
      migrated,
      skipped,
      errors,
    });
  } catch (error: any) {
    console.error("Error during migration:", error);
    return NextResponse.json(
      { error: error.message || "Migration failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/migrate-purchases
 * Check migration status - how many purchases need to be migrated
 */
export async function GET(req: NextRequest) {
  try {
    // Count total purchases
    const { count: totalPurchases, error: purchasesError } = await supabaseAdmin
      .from("video_purchases")
      .select("*", { count: "exact", head: true });

    if (purchasesError) throw purchasesError;

    // Count existing progress records with purchases
    const { count: migratedCount, error: progressError } = await supabaseAdmin
      .from("user_video_progress")
      .select("*", { count: "exact", head: true })
      .eq("has_purchased", true);

    if (progressError) throw progressError;

    return NextResponse.json({
      totalPurchases: totalPurchases || 0,
      alreadyMigrated: migratedCount || 0,
      needsMigration: (totalPurchases || 0) - (migratedCount || 0),
    });
  } catch (error: any) {
    console.error("Error checking migration status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check migration status" },
      { status: 500 }
    );
  }
}
