import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] as const;

function hhmmToMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function minToHHMM(t: number) {
  const h = Math.floor((t % (24*60)) / 60);
  const m = t % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = (url.searchParams.get("id") || "").toLowerCase();
  const abstractId = /^0x[a-fA-F0-9]{40}$/.test(raw) ? raw : "";

  if (!abstractId) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("call_schedules")
    .select(`
      kind,
      day_of_week,
      start_time,
      duration_minutes,
      slot_minutes,
      slots,
      price_cents
    `)
    .eq("abstract_id", abstractId);

  if (error) {
    console.error("[/api/meet/sessions] error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // slot default
  let slotMinutes = 10;
  const out = new Map<number, { voice: Set<string>; video: Set<string> }>();
  let pricePerSessionVoice: number | undefined;
  let pricePerSessionVideo: number | undefined;

  for (const r of data ?? []) {
    const day = Number(r.day_of_week ?? 0);
    if (day < 1 || day > 7) continue;

    const kind = String(r.kind) as "voice" | "video";
    const sm = Number(r.slot_minutes || 10) || 10;
    slotMinutes = sm; // pakai yang terakhir (kita asumsikan konsisten)

    // simpan price per session (USD) dari row terbaru yang ada
    const usd = r.price_cents != null ? Number(r.price_cents) / 100 : undefined;
    if (kind === "voice" && usd) pricePerSessionVoice = pricePerSessionVoice ?? usd;
    if (kind === "video" && usd) pricePerSessionVideo = pricePerSessionVideo ?? usd;

    if (!out.has(day)) out.set(day, { voice: new Set(), video: new Set() });

    const bucket = out.get(day)!;

    // 1) kalau ada slots JSON → pakai
    if (Array.isArray(r.slots)) {
      for (const s of r.slots as string[]) {
        if (!/^\d{2}:\d{2}$/.test(s)) continue;
        bucket[kind].add(s);
      }
    } else {
      // 2) generate dari start_time + duration
      const startHHMM = String(r.start_time);
      const dur = Number(r.duration_minutes || 0);
      if (/^\d{2}:\d{2}:\d{2}$/.test(startHHMM) && dur > 0) {
        const s = hhmmToMin(startHHMM.slice(0,5));
        const e = s + dur;
        for (let t = s; t + sm <= e; t += sm) {
          bucket[kind].add(minToHHMM(t));
        }
      }
    }
  }

  const byDay = Array.from(out.entries())
    .sort((a,b) => a[0] - b[0])
    .map(([d, sets]) => ({
      day: d,
      name: DAYS[d-1],
      voice: Array.from(sets.voice).sort((a,b)=>hhmmToMin(a)-hhmmToMin(b)),
      video: Array.from(sets.video).sort((a,b)=>hhmmToMin(a)-hhmmToMin(b)),
    }));

  return NextResponse.json({
    slotMinutes,
    pricePerSession: { voice: pricePerSessionVoice ?? 0, video: pricePerSessionVideo ?? 0 },
    byDay,
  }, { headers: { "Cache-Control": "no-store" } });
}
