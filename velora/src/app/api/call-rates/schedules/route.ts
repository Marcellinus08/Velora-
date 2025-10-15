import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ---------- helpers ----------
const DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] as const;
type CallKind = "voice" | "video";

const okAddr = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s);

// add minutes to "HH:MM" -> "HH:MM"
function addMin(hhmm: string, minutes: number) {
  const [h,m] = hhmm.split(":").map(Number);
  const tot = (h*60 + m + minutes) % (24*60);
  const hh = String(Math.floor(tot/60)).padStart(2,"0");
  const mm = String(tot%60).padStart(2,"0");
  return `${hh}:${mm}`;
}

// ---------- GET: load existing schedules for editor ----------
/**
 * GET /api/call-rates/schedules?id=<abstractId>
 * Output:
 * {
 *   abstractId, slotMinutes,
 *   pricePerSession: { voice, video },
 *   items: [{ day, start, duration, kind, slots:[] }]
 * }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const aid = (url.searchParams.get("id") || "").toLowerCase();
  if (!okAddr(aid)) {
    return NextResponse.json({ error: "Bad address" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("call_schedules")
    .select(`
      abstract_id,
      kind,
      price_cents,
      currency,
      day_of_week,
      start_time,
      duration_minutes,
      slot_minutes,
      slots,
      created_at
    `)
    .eq("abstract_id", aid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /call-rates/schedules] DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json({
      abstractId: aid,
      slotMinutes: 10,
      pricePerSession: { voice: 0, video: 0 },
      items: [],
    }, { headers: { "Cache-Control": "no-store" } });
  }

  // price per session by latest row per kind
  let slotMinutes = 10;
  let priceVoice = 0;
  let priceVideo = 0;

  // build items
  const items: Array<{
    day: number;
    start: string;
    duration: number;
    kind: CallKind;
    slots: string[];
  }> = [];

  const seenKind = new Set<CallKind>();

  for (const r of data) {
    slotMinutes = Number(r.slot_minutes || 10) || slotMinutes;

    if (!seenKind.has(r.kind)) {
      const p = Number(r.price_cents || 0) / 100;
      if (r.kind === "voice") priceVoice ||= p;
      if (r.kind === "video") priceVideo ||= p;
      seenKind.add(r.kind);
    }

    // normalize slots list
    let slots: string[] = [];
    if (Array.isArray(r.slots) && r.slots.length) {
      slots = (r.slots as string[]).filter((s) => /^\d{2}:\d{2}$/.test(s));
    } else if (r.start_time && r.duration_minutes) {
      const start = String(r.start_time).slice(0,5);
      const dur = Number(r.duration_minutes || 0);
      for (let t = 0; t + slotMinutes <= dur; t += slotMinutes) {
        slots.push(addMin(start, t));
      }
    }

    items.push({
      day: Number(r.day_of_week),
      start: String(r.start_time).slice(0,5),
      duration: Number(r.duration_minutes || slots.length * slotMinutes || 60),
      kind: r.kind as CallKind,
      slots,
    });
  }

  return NextResponse.json({
    abstractId: aid,
    slotMinutes,
    pricePerSession: { voice: priceVoice, video: priceVideo },
    items,
  }, { headers: { "Cache-Control": "no-store" } });
}

// ---------- POST: replace schedules for kinds included ----------
/**
 * POST /api/call-rates/schedules
 * Body:
 * {
 *   abstractId, currency,
 *   slot_minutes?: number,             // default 10
 *   voice?: { price_cents: number, items:[{day,start,duration,slots:[]}] },
 *   video?: { price_cents: number, items:[{day,start,duration,slots:[]}] }
 * }
 * Effect: for each kind provided -> DELETE old rows (by abstractId+kind) then INSERT new rows.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const abstractId = String(body?.abstractId || "").toLowerCase();
  if (!okAddr(abstractId)) {
    return NextResponse.json({ error: "Bad address" }, { status: 400 });
  }

  const currency = (body?.currency || "USD") as string;
  const slotMinutes = Number(body?.slot_minutes || 10) || 10;

  type Item = { day: number; start: string; duration: number; slots: string[] };
  const kinds: Array<CallKind> = [];
  if (body?.voice) kinds.push("voice");
  if (body?.video) kinds.push("video");
  if (!kinds.length) {
    return NextResponse.json({ error: "No schedules" }, { status: 400 });
  }

  try {
    for (const k of kinds) {
      // replace strategy
      await supabaseAdmin.from("call_schedules").delete().match({ abstract_id: abstractId, kind: k });

      const pack = body[k];
      const price_cents = Number(pack?.price_cents || 0);
      const items: Item[] = Array.isArray(pack?.items) ? pack.items : [];

      if (price_cents <= 0 || !items.length) continue;

      const rows = items.map((it) => ({
        abstract_id: abstractId,
        kind: k,
        price_cents,
        currency,
        day_of_week: it.day,
        start_time: it.start,
        duration_minutes: it.duration,
        slot_minutes: slotMinutes,
        slots: it.slots ?? [],
      }));

      const { error: insErr } = await supabaseAdmin
        .from("call_schedules")
        .insert(rows);

      if (insErr) throw insErr;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[POST /call-rates/schedules] error", e);
    return NextResponse.json({ error: e?.message || "Save failed" }, { status: 500 });
  }
}
