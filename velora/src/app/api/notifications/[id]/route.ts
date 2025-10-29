// src/app/api/notifications/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { id: string };
};

/**
 * PATCH /api/notifications/[id]
 * Mark a notification as read
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await req.json();
    const { is_read } = body;

    if (typeof is_read !== "boolean") {
      return NextResponse.json(
        { error: "is_read must be a boolean" },
        { status: 400 }
      );
    }

    const updateData: any = { is_read };
    if (is_read) {
      updateData.read_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
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
    const { id } = params;

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
