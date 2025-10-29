// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Fetch notifications for a user
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const abstractId = searchParams.get("abstract_id")?.toLowerCase();
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unread_only") === "true";

    if (!abstractId) {
      return NextResponse.json(
        { error: "abstract_id is required" },
        { status: 400 }
      );
    }

    // Check if notifications table exists
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .limit(1)
      .maybeSingle();

    // If table doesn't exist or error accessing it
    if (tableError && tableError.code === "42P01") {
      return NextResponse.json(
        {
          error: "Notifications table not ready",
          hint: "Please run the SQL setup files first",
          notifications: [],
        },
        { status: 503 }
      );
    }

    // Build query - Try with join first, fallback to simple query
    let notifications = [];
    
    try {
      // Try with foreign key join
      let query = supabaseAdmin
        .from("notifications")
        .select(`
          *,
          actor_profile:profiles!notifications_actor_addr_fkey(
            username,
            avatar_url
          )
        `)
        .eq("abstract_id", abstractId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        query = query.eq("is_read", false);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      notifications = data || [];
    } catch (joinError: any) {
      // If foreign key doesn't exist, fetch notifications and profiles separately
      console.warn("[Notifications API] Join failed, using separate queries:", joinError.message);
      
      let simpleQuery = supabaseAdmin
        .from("notifications")
        .select("*")
        .eq("abstract_id", abstractId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        simpleQuery = simpleQuery.eq("is_read", false);
      }

      const { data: notifData, error: notifError } = await simpleQuery;
      
      if (notifError) throw notifError;

      // Fetch profiles separately
      if (notifData && notifData.length > 0) {
        const actorAddresses = [...new Set(notifData.map((n: any) => n.actor_addr).filter(Boolean))];
        
        if (actorAddresses.length > 0) {
          const { data: profiles } = await supabaseAdmin
            .from("profiles")
            .select("abstract_id, username, avatar_url")
            .in("abstract_id", actorAddresses);

          const profileMap = new Map(
            (profiles || []).map((p: any) => [p.abstract_id, p])
          );

          notifications = notifData.map((n: any) => ({
            ...n,
            actor_profile: profileMap.get(n.actor_addr) || null,
          }));
        } else {
          notifications = notifData.map((n: any) => ({
            ...n,
            actor_profile: null,
          }));
        }
      }
    }

    return NextResponse.json({
      notifications: notifications || [],
    });
  } catch (error: any) {
    console.error("[Notifications API] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch notifications",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      abstract_id,
      user_id,
      actor_addr,
      type,
      message,
      target_id,
      target_type,
      metadata,
    } = body;

    // Validation
    if (!abstract_id || !user_id || !type || !message) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["abstract_id", "user_id", "type", "message"],
        },
        { status: 400 }
      );
    }

    // Create notification
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        abstract_id: abstract_id.toLowerCase(),
        user_id,
        actor_addr: actor_addr?.toLowerCase() || null,
        type,
        message,
        target_id: target_id || null,
        target_type: target_type || null,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        notification: data,
        message: "Notification created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Notifications API] Create error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create notification",
        details: error.details || null,
      },
      { status: 500 }
    );
  }
}
