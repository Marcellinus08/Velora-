// src/app/api/call-rates/schedules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

type Item = {
  day: number;          // 1..7 (Mon..Sun)
  start: string;        // "HH:MM"
  duration: number;     // minutes
  slots: string[];      // ["HH:MM", ...] 10-min starts
};

type KindPayload = {
  price_cents: number;  // > 0
  items: Item[];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const abstractId: string = (body?.abstractId || "").toLowerCase();
    const currency: string = body?.currency || "USD";
    const voice: KindPayload | undefined = body?.voice;
    const video: KindPayload | undefined = body?.video;

    // validations
    if (!ETH_RE.test(abstractId)) {
      return NextResponse.json({ error: "Bad address" }, { status: 400 });
    }
    if (!voice && !video) {
      return NextResponse.json({ error: "No schedules" }, { status: 400 });
    }

    const rows: any[] = [];
    const pushRows = (kind: "voice" | "video", payload?: KindPayload) => {
      if (!payload) return;
      const { price_cents, items } = payload;
      if (!price_cents || price_cents <= 0) {
        throw new Error(`Invalid price for ${kind}`);
      }
      if (!Array.isArray(items) || items.length === 0) return;

      for (const it of items) {
        if (
          typeof it?.day !== "number" ||
          it.day < 1 ||
          it.day > 7 ||
          !it?.start ||
          typeof it?.duration !== "number" ||
          it.duration <= 0
        ) {
          throw new Error(`Invalid schedule item for ${kind}`);
        }
        rows.push({
          abstract_id: abstractId,
          kind,                              // enum: 'voice' | 'video'
          price_cents,
          currency,
          day_of_week: it.day,
          start_time: it.start,
          duration_minutes: it.duration,
          slot_minutes: 10,
          slots: it.slots ?? [],
        });
      }
    };

    pushRows("voice", voice);
    pushRows("video", video);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid items" }, { status: 400 });
    }

    // ensure profile exists (FK to profiles.abstract_id)
    await supabaseAdmin
      .from("profiles")
      .upsert({ abstract_id: abstractId }, { onConflict: "abstract_id" });

    // insert schedules
    const { error: insErr } = await supabaseAdmin.from("call_schedules").insert(rows);
    if (insErr) {
      console.error("[call-rates/save] insert error:", insErr);
      return NextResponse.json({ error: "Insert schedules failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: rows.length }, { status: 200 });
  } catch (e: any) {
    console.error("[call-rates/save] unhandled:", e);
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
