import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/meet/creators
 * Output pricing per minute (USD). DB menyimpan price_cents per session.
 */
export async function GET(_req: NextRequest) {
  const { data: rows, error } = await supabaseAdmin
    .from("call_schedules")
    .select(`
      abstract_id,
      kind,
      price_cents,
      slot_minutes,
      currency,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[/api/meet/creators] schedules error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!rows?.length) {
    return NextResponse.json({ creators: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  type SRow = {
    abstract_id: string;
    kind: "voice" | "video";
    price_cents: number | null;
    slot_minutes: number | null;
    currency: string | null;
    created_at: string;
  };

  const latestByKind = new Map<string, SRow>();      // key = `${aid}:${kind}`
  const ids = new Set<string>();

  for (const r of rows as SRow[]) {
    if (!r.abstract_id) continue;
    const aid = r.abstract_id.toLowerCase();
    const key = `${aid}:${r.kind}`;
    if (!latestByKind.has(key)) latestByKind.set(key, r);
    ids.add(aid);
  }

  const idList = Array.from(ids);

  const { data: profiles, error: perr } = await supabaseAdmin
    .from("profiles")
    .select("abstract_id, username, avatar_url")
    .in("abstract_id", idList);

  if (perr) {
    console.error("[/api/meet/creators] profiles error:", perr);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const pmap = new Map<string, { username: string | null; avatar_url: string | null }>();
  (profiles ?? []).forEach((p) => pmap.set(String(p.abstract_id).toLowerCase(), p as any));

  type Creator = {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
    pricing: { voice?: number; video?: number }; // USD per minute
  };

  const creators: Creator[] = [];

  for (const aid of idList) {
    const v  = latestByKind.get(`${aid}:voice`);
    const vi = latestByKind.get(`${aid}:video`);

    const voicePerSession = v  ? Number(v.price_cents || 0) / 100 : undefined;
    const videoPerSession = vi ? Number(vi.price_cents || 0) / 100 : undefined;

    const voiceSlot = v?.slot_minutes && v.slot_minutes > 0 ? v.slot_minutes : 10;
    const videoSlot = vi?.slot_minutes && vi.slot_minutes > 0 ? vi.slot_minutes : 10;

    const pricing = {
      voice: typeof voicePerSession === "number" ? +(voicePerSession / voiceSlot).toFixed(4) : undefined,
      video: typeof videoPerSession === "number" ? +(videoPerSession / videoSlot).toFixed(4) : undefined,
    };

    const prof = pmap.get(aid);
    const username = prof?.username || `${aid.slice(0,6)}…${aid.slice(-4)}`;

    creators.push({
      id: aid,
      name: username,
      handle: username.replace(/^@?/, ""),
      avatarUrl: prof?.avatar_url || undefined,
      pricing,
    });
  }

  creators.sort((a, b) => a.handle.localeCompare(b.handle));
  return NextResponse.json({ creators }, { headers: { "Cache-Control": "no-store" } });
}
