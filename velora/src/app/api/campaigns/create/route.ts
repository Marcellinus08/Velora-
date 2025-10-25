// /src/app/api/campaigns/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // pastikan Node runtime, bukan Edge

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

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const campaignId = String(form.get("campaignId") || "");
    const creatorAddr = String(form.get("creatorAddr") || "").toLowerCase();
    const selectedVideoId = String(form.get("selectedVideoId") || "");
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const ctaText = String(form.get("ctaText") || "").trim();
    const ctaLink = String(form.get("ctaLink") || "").trim();
    const durationDays = Number(form.get("durationDays") || 3);
    const creationFeeCents = Number(form.get("creationFeeCents") || 100);
    const txHash = String(form.get("txHash") || "");
    const startIso = String(form.get("startIso") || "");
    const endIso = String(form.get("endIso") || "");
    const file = form.get("file") as File | null;

    // Validasi minimum
    if (!campaignId || !creatorAddr || !selectedVideoId || !title || !ctaText) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Wajib ada file agar banner_url tidak kosong
    if (!file || file.size === 0) {
      return NextResponse.json(
        { ok: false, error: "Banner file not received by server" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Pastikan bucket ada (id harus sama dengan name)
    try {
      await supabase.storage.createBucket("campaign-banners", { public: true });
    } catch {
      /* ignore if exists */
    }

    // === Upload sebagai Buffer (stabil di Node) ===
    const ext =
      (file.name && file.name.includes(".") && file.name.split(".").pop()) ||
      "bin";
    const objectPath = `${campaignId}-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore - Buffer tersedia di runtime node
    const buffer: Buffer = Buffer.from(arrayBuffer);

    const { data: up, error: upErr } = await supabase.storage
      .from("campaign-banners")
      .upload(objectPath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (upErr) {
      // Kembalikan error agar tidak insert row dengan banner_url kosong
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${upErr.message}` },
        { status: 400 }
      );
    }

    const { data: pub } = supabase.storage
      .from("campaign-banners")
      .getPublicUrl(up!.path);
    const bannerUrl = pub.publicUrl;

    // Insert ke DB (service role bypass RLS)
    const payload = {
      id: campaignId,
      creator_addr: creatorAddr,
      video_id: selectedVideoId,
      title,
      description,
      banner_url: bannerUrl,
      cta_text: ctaText,
      cta_link: ctaLink,
      creation_fee_cents: creationFeeCents,
      duration_days: durationDays,
      payment_tx_hash: txHash,
      status: "active",
      start_date: startIso,
      end_date: endIso,
    };

    const { data: row, error: dbErr } = await supabase
      .from("campaigns")
      .insert(payload)
      .select()
      .single();

    if (dbErr) {
      return NextResponse.json(
        { ok: false, error: dbErr.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, campaign: row }, { status: 201 });
  } catch (e: any) {
    console.error("API /campaigns/create error:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
