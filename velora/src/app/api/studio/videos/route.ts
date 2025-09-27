// src/app/api/studio/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

// helper untuk aman ambil query param
function getParam(req: NextRequest, key: string) {
  const url = new URL(req.url);
  const v = url.searchParams.get(key);
  return v ? v.trim() : "";
}

export async function GET(req: NextRequest) {
  const me = (getParam(req, "me") || "").toLowerCase();
  if (!ETH_RE.test(me)) {
    return NextResponse.json({ error: "Bad address" }, { status: 400 });
  }

  // Ambil data video milik user
  const { data, error } = await supabaseAdmin
    .from("videos")
    .select(
      `
      id,
      created_at,
      title,
      description,
      duration_seconds,
      video_url,
      thumb_url,
      price_cents,
      currency,
      points_total
    `
    )
    .eq("abstract_id", me)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[studio/videos GET] DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // TAMBAHAN: inject buyers & revenueUsd (default 0) TANPA menghapus field lama
  const items = (data ?? []).map((v) => ({
    ...v,
    buyers: 0,      // sementara default 0
    revenueUsd: 0,  // sementara default $0
  }));

  // API dikembalikan mentah + aman untuk cache
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "no-store" } }
  );
}
