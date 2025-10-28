// /src/app/api/campaigns/check-user-active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorAddr = searchParams.get("creatorAddr")?.toLowerCase();

    if (!creatorAddr) {
      return NextResponse.json(
        { ok: false, error: "creatorAddr is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    // Get user's active campaigns
    const { data: activeCampaigns, error } = await supabase
      .from("campaigns")
      .select("id, title, start_date, end_date, status")
      .eq("creator_addr", creatorAddr)
      .eq("status", "active")
      .gte("end_date", now)
      .lte("start_date", now);

    if (error) {
      console.error("Error checking user active campaigns:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const hasActiveCampaign = (activeCampaigns?.length || 0) > 0;
    const activeCampaign = hasActiveCampaign ? activeCampaigns![0] : null;

    return NextResponse.json({
      ok: true,
      hasActiveCampaign,
      activeCampaign,
      message: hasActiveCampaign
        ? `You already have an active campaign: "${activeCampaign?.title}". Please wait for it to end before creating a new one.`
        : "You can create a new campaign.",
    });
  } catch (e: any) {
    console.error("API /campaigns/check-user-active error:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
