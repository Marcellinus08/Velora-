// src/app/api/profiles/upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Body = { abstractId: string };
const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const addr = (body.abstractId || "").trim().toLowerCase();

    if (!ETH_RE.test(addr)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    // UPSERT idempotent
    // - jika belum ada => INSERT
    // - jika sudah ada => abaikan (tidak update apa pun)
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { abstract_id: addr }, // hanya menyimpan ID (username default null)
        {
          onConflict: "abstract_id",
          ignoreDuplicates: true, // penting: jangan melakukan update jika sudah ada
        }
      );

    if (error) {
      // karena ada UNIQUE constraint, Supabase akan melempar error kalau tidak pakai ignoreDuplicates
      console.error("[profiles/upsert] error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }); // insert baru atau sudah eksis -> dianggap sukses
  } catch (e: any) {
    console.error("[profiles/upsert] unexpected:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
