// src/app/api/notifications/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/notifications/[id]
 * Mark a notification as read
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params; // await Promise-based params
    const body = await req.json();
    const { is_read } = body;

    if (typeof is_read !== "boolean") {
      return NextResponse.json(
        { error: "is_read must be a boolean" },
        { status: 400 }
      );
    }

    const updateData: any = { is_read };
    
    // Try to include read_at if column exists
    if (is_read) {
      try {
        updateData.read_at = new Date().toISOString();
      } catch (e) {
        console.warn("[Notifications API] read_at column might not exist");
      }
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // If error is about read_at column, try without it
      if (error.message?.includes("read_at") || error.code === "42703") {
        console.warn("[Notifications API] Retrying without read_at column");
        
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from("notifications")
          .update({ is_read })
          .eq("id", id)
          .select()
          .single();

        if (retryError) {
          throw retryError;
        }

        return NextResponse.json({
          notification: retryData,
          message: "Notification updated successfully",
          note: "read_at column not available - consider running migration 004",
        });
      }

      throw error;
    }

    return NextResponse.json({
      notification: data,
      message: "Notification updated successfully",
    });
  } catch (error: any) {
    console.error("[Notifications API] Update error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to update notification",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params; // await Promise-based params

    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("[Notifications API] Delete error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to delete notification",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}
