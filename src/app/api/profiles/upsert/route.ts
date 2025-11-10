// src/app/api/profiles/upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Body = {
  abstractId: string;        // alamat EVM 0x...
  username?: string | null;  // opsional
};

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

function normalizeAddress(a: string) {
  return a.trim().toLowerCase();
}

function normalizeUsername(u: string) {
  // Bebas pilih aturan; di sini kita pakai lower-case dan trim
  return u.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const addr = normalizeAddress(body.abstractId || "");
    if (!ETH_RE.test(addr)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const usernameInput =
      typeof body.username === "string" ? normalizeUsername(body.username) : null;

    // Ambil record existing
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("profiles")
      .select("abstract_id, username, avatar_url, avatar_path, created_at")
      .eq("abstract_id", addr)
      .maybeSingle();

    if (selErr) {
      console.error("[profiles/upsert] select error:", selErr);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // Kalau belum ada → insert (username boleh null atau string)
    if (!existing) {
      // Cek duplikat username kalau ada yg dikirim
      if (usernameInput) {
        const { data: clash } = await supabaseAdmin
          .from("profiles")
          .select("abstract_id")
          .ilike("username", usernameInput)
          .maybeSingle();
        if (clash) {
          return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
          );
        }
      }

      const insertPayload = {
        abstract_id: addr,
        username: usernameInput ?? null,
      };

      const { error: insErr, data: inserted } = await supabaseAdmin
        .from("profiles")
        .insert(insertPayload)
        .select()
        .maybeSingle();

      if (insErr) {
        console.error("[profiles/upsert] insert error:", insErr);
        console.error("[profiles/upsert] error details:", JSON.stringify(insErr, null, 2));
        
        // Check if error is about missing updated_at column
        if (insErr.message && insErr.message.includes('updated_at')) {
          return NextResponse.json({ 
            error: "Database schema error: missing updated_at column. Please run migration.", 
            details: insErr.message 
          }, { status: 500 });
        }
        
        return NextResponse.json({ error: "Insert failed", details: insErr.message }, { status: 500 });
      }

      return NextResponse.json(inserted ?? { abstract_id: addr, username: usernameInput ?? null });
    }

    // Sudah ada → jika ada username baru, update walaupun sebelumnya tidak null
    if (usernameInput && usernameInput !== (existing.username ?? "").toLowerCase()) {
      // Pastikan username tidak dipakai oleh user lain
      const { data: clash } = await supabaseAdmin
        .from("profiles")
        .select("abstract_id")
        .ilike("username", usernameInput)
        .neq("abstract_id", addr)
        .maybeSingle();

      if (clash) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }

      const { error: updErr, data: updated } = await supabaseAdmin
        .from("profiles")
        .update({ username: usernameInput })
        .eq("abstract_id", addr)
        .select()
        .maybeSingle();

      if (updErr) {
        console.error("[profiles/upsert] update error:", updErr);
        console.error("[profiles/upsert] error details:", JSON.stringify(updErr, null, 2));
        
        // Check if error is about missing updated_at column
        if (updErr.message && updErr.message.includes('updated_at')) {
          return NextResponse.json({ 
            error: "Database schema error: missing updated_at column. Please run migration.", 
            details: updErr.message 
          }, { status: 500 });
        }
        
        return NextResponse.json({ error: "Update failed", details: updErr.message }, { status: 500 });
      }

      return NextResponse.json(updated ?? { abstract_id: addr, username: usernameInput });
    }

    // Tidak ada perubahan username → kembalikan data existing
    return NextResponse.json(existing);
  } catch (e) {
    console.error("[profiles/upsert] unexpected:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
