// src/app/api/profiles/[address]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params; // await Promise-based params
  const addr = (address || "").trim().toLowerCase();
  if (!ETH_RE.test(addr)) {
    return NextResponse.json({ error: "Bad address" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("abstract_id, username, avatar_url")
    .eq("abstract_id", addr)
    .maybeSingle();

  if (error) {
    console.error("[profiles GET] DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json(
    data ?? { abstract_id: addr, username: null, avatar_url: null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
