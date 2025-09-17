// src/app/api/profiles/set-username/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Body = {
  abstractId: string;        // alamat EVM
  username: string;          // username baru (wajib isi)
};

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    const addr = (body.abstractId || "").trim().toLowerCase();
    const uname = (body.username || "").trim();

    if (!ETH_RE.test(addr)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }
    if (!uname) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Cek unik (case-insensitive)
    const { data: exists } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", uname)
      .maybeSingle();

    if (exists) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Upsert: jika belum ada row utk address tsb → insert
    // kalau sudah ada → update username
    const { error: upsertErr } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { abstract_id: addr, username: uname }, 
        { onConflict: "abstract_id" }
      );

    if (upsertErr) {
      console.error(upsertErr);
      return NextResponse.json({ error: "Upsert failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
