// src/app/api/meet/book/route.ts
import { NextResponse } from "next/server";

// Optional: mencegah cache
export const revalidate = 0;

type BookReq = {
  creatorId: string;
  kind?: "voice" | "video";
  minutes: number;
  startAt?: string;       // ISO string
  slots?: string[];       // ["11:56","12:06",...]
  slotMinutes?: number;   // 10, 15, ...
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<BookReq>;
    const { creatorId, minutes } = body;

    if (!creatorId || !minutes || minutes <= 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Buat bookingId dummy (ganti dengan id dari DB kalau sudah siap)
    const bookingId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `bk_${Date.now()}`;

    // TODO (nanti): simpan ke DB, lock slots, dsb.
    // contoh: await db.insert({ ...body, bookingId });

    return NextResponse.json(
      { ok: true, bookingId },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to create booking" },
      { status: 500 },
    );
  }
}

// Optional: GET untuk test cepat di browser
export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "Use POST /api/meet/book with {creatorId, minutes, ...}",
  });
}
