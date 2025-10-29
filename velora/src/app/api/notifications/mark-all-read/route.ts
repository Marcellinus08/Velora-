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

    if (!abstract_id) {
      return NextResponse.json(
        { error: "abstract_id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("abstract_id", abstract_id.toLowerCase())
      .eq("is_read", false);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "All notifications marked as read",
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
