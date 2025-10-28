import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE env variables");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    
    // Get active campaigns that are currently running
    const { data: activeCampaigns, error } = await supabase
      .from("campaigns")
      .select("id, title, end_date, start_date")
      .eq("status", "active")
      .gte("end_date", now)
      .lte("start_date", now)
      .order("end_date", { ascending: true });

    if (error) {
      console.error("Error fetching active campaigns:", error);
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      );
    }

    const activeCount = activeCampaigns?.length || 0;
    const isFull = activeCount >= 5;
    
    // Get the campaign that will end soonest
    const nextAvailableSlot = activeCampaigns?.[0];
    
    return NextResponse.json({
      success: true,
      activeCount,
      maxSlots: 5,
      isFull,
      availableSlots: Math.max(0, 5 - activeCount),
      activeCampaigns: activeCampaigns || [],
      nextAvailableDate: nextAvailableSlot ? nextAvailableSlot.end_date : null,
      message: isFull 
        ? `All 5 campaign slots are full. Next available slot: ${nextAvailableSlot?.end_date || 'Unknown'}`
        : `${5 - activeCount} campaign slot(s) available`
    });

  } catch (error) {
    console.error("Check slots error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}