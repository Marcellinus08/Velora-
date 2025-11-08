import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET = "avatars";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    let file = form.get("avatar") as File | null;
    if (!file || typeof file === "string") file = form.get("file") as File | null;
    if (!file || typeof file === "string") file = form.get("image") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const address = String(form.get("address") || "").trim().toLowerCase();
    if (!ETH_RE.test(address)) {
      return NextResponse.json({ error: "Bad address" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }

    // path deterministik
    const extFromMime = (file.type.split("/")[1] || "jpg").toLowerCase();
    const ext = extFromMime === "jpeg" ? "jpg" : extFromMime;
    const objectPath = `${address}/avatar.${ext}`;

    // bersihkan file lama
    const list = await supabaseAdmin.storage.from(BUCKET).list(address, { limit: 100 });
    if (list?.data?.length) {
      const toDelete = list.data
        .map((f) => `${address}/${f.name}`)
        .filter((p) => p !== objectPath);
      if (toDelete.length > 0) await supabaseAdmin.storage.from(BUCKET).remove(toDelete);
    }

    // upload + upsert + set cacheControl rendah (1 detik)
    const arrayBuf = await file.arrayBuffer();
    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(objectPath, Buffer.from(arrayBuf), {
        contentType: file.type,
        upsert: true,
        cacheControl: "1",
      });

    if (upErr) {
      console.error("[avatar/upload] storage error:", upErr);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // URL publik dasar
    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
    const publicUrl = pub.publicUrl;

    // upsert ke table profiles (menyimpan URL dasar)
    const { error: dbErr } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          abstract_id: address,
          avatar_url: publicUrl,
          avatar_path: objectPath,
        },
        { onConflict: "abstract_id" }
      );

    if (dbErr) {
      console.error("[avatar/upload] db error:", dbErr);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    // kirim juga display_url untuk bust cache di sisi client
    const displayUrl = `${publicUrl}?v=${Date.now()}`;

    return NextResponse.json(
      { avatar_url: publicUrl, display_url: displayUrl, path: objectPath },
      { status: 200 }
    );
  } catch (e) {
    console.error("[avatar/upload] unexpected:", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
