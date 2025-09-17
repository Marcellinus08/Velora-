// src/app/api/profiles/username/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function normalizeUsername(u: string) {
  return u.trim().toLowerCase();
}

/**
 * GET /api/profiles/username/check?u=<username>&exclude=<abstractId>
 * - `u`: username yang ingin dicek
 * - `exclude`: opsional, address si user sendiri agar tidak dianggap duplikat sendiri
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("u") || "";
    const exclude = (searchParams.get("exclude") || "").trim().toLowerCase();

    const u = normalizeUsername(raw);
    if (!u) {
      return NextResponse.json(
        { available: false, reason: "empty" },
        { status: 400 }
      );
    }

    // Aturan dasar username: huruf, angka, underscore, min 3 char (opsional)
    if (!/^[a-z0-9_]{3,30}$/.test(u)) {
      return NextResponse.json({
        available: false,
        reason: "invalid_format",
      });
    }

    // Cek apakah ada user lain yg pakai username ini
    const { data: clash, error } = await supabaseAdmin
      .from("profiles")
      .select("abstract_id")
      .ilike("username", u)
      .neq("abstract_id", exclude) // jangan hitung user sendiri
      .maybeSingle();

    if (error) {
      console.error("[username/check] DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const available = !clash;
    return NextResponse.json({ available, username: u });
  } catch (e) {
    console.error("[username/check] unexpected:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
