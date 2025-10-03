import { NextResponse } from "next/server";

/**
 * Trivial mock “create booking”.
 * Body: { creatorId: string, kind: "voice"|"video", minutes: number }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = `bk_${Math.random().toString(36).slice(2, 9)}`;

  // pretend success
  return NextResponse.json({ ok: true, id, status: "pending", ...body });
}
