// src/app/api/notifications/mark-all-read/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for a user
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { abstract_id } = body;

    console.log("[Mark All Read API] Received request:", { abstract_id });

    if (!abstract_id) {
      console.error("[Mark All Read API] Missing abstract_id");
      return NextResponse.json(
        { error: "abstract_id is required" },
        { status: 400 }
      );
    }

    const normalizedId = abstract_id.toLowerCase();
    console.log("[Mark All Read API] Updating notifications for:", normalizedId);

    // Try with read_at column first, fallback without it if column doesn't exist
    let updateData: any = {
      is_read: true,
    };

    // Try to include read_at if column exists
    try {
      updateData.read_at = new Date().toISOString();
    } catch (e) {
      console.warn("[Mark All Read API] read_at column might not exist, updating without it");
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update(updateData)
      .eq("abstract_id", normalizedId)
      .eq("is_read", false)
      .select();

    if (error) {
      // If error is about read_at column, try without it
      if (error.message?.includes("read_at") || error.code === "42703") {
        console.warn("[Mark All Read API] Retrying without read_at column");
        
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from("notifications")
          .update({ is_read: true })
          .eq("abstract_id", normalizedId)
          .eq("is_read", false)
          .select();

        if (retryError) {
          console.error("[Mark All Read API] Retry failed:", retryError);
          throw retryError;
        }

        console.log("[Mark All Read API] Updated notifications (retry):", retryData?.length || 0);
        
        return NextResponse.json({
          message: "All notifications marked as read",
          updated: retryData?.length || 0,
          note: "read_at column not available - consider running migration 004",
        });
      }

      console.error("[Mark All Read API] Supabase error:", error);
      throw error;
    }

    console.log("[Mark All Read API] Updated notifications:", data?.length || 0);

    return NextResponse.json({
      message: "All notifications marked as read",
      updated: data?.length || 0,
    });
  } catch (error: any) {
    console.error("[Notifications API] Mark all read error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to mark all as read",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}
