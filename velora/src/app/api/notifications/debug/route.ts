import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * DEBUG ENDPOINT: Get notifications with admin access (bypasses RLS)
 * Only for debugging - remove in production
 * Usage: GET /api/notifications/debug?addr=0x...
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const addr = searchParams.get("addr")?.toLowerCase();

    if (!addr) {
      return NextResponse.json({ error: "addr parameter required" }, { status: 400 });
    }

    console.log("[DEBUG] Checking notifications for address:", addr);

    // Query with admin access (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("notification_video_purchases")
      .select("*")
      .eq("creator_addr", addr)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      address: addr,
      count: data?.length || 0,
      notifications: data || [],
      debug: {
        timestamp: new Date().toISOString(),
        note: "Using admin access - bypasses RLS",
      },
    });
  } catch (e: any) {
    console.error("[DEBUG] Error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
