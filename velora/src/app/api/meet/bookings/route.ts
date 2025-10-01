import { NextRequest, NextResponse } from "next/server";

// We’ll reuse the same creators as discover, attach pseudo bookings.
const creators = [
  {
    id: "u_maria",
    name: "Maria",
    handle: "maria",
    avatarUrl: "https://i.pravatar.cc/80?u=maria",
    pricing: { voice: 1, video: 5 },
  },
  {
    id: "u_arif",
    name: "Arif",
    handle: "arif",
    avatarUrl: "https://i.pravatar.cc/80?u=arif",
    pricing: { voice: 3, video: 7 },
  },
];

export async function GET(req: NextRequest) {
  const status = (req.nextUrl.searchParams.get("status") || "upcoming") as
    | "upcoming"
    | "pending"
    | "history";

  const now = Date.now();

  const pool = [
    {
      id: "bk_1",
      creator: creators[0],
      kind: "voice",
      startAt: new Date(now + 60 * 60 * 1000).toISOString(),
      minutes: 15,
      pricePerMinute: creators[0].pricing.voice!,
      status: "upcoming",
    },
    {
      id: "bk_2",
      creator: creators[1],
      kind: "video",
      startAt: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      minutes: 30,
      pricePerMinute: creators[1].pricing.video!,
      status: "upcoming",
    },
    {
      id: "bk_3",
      creator: creators[0],
      kind: "voice",
      startAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      minutes: 20,
      pricePerMinute: creators[0].pricing.voice!,
      status: "history",
    },
    {
      id: "bk_4",
      creator: creators[1],
      kind: "video",
      startAt: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      minutes: 15,
      pricePerMinute: creators[1].pricing.video!,
      status: "pending",
    },
  ];

  return NextResponse.json(pool.filter((b) => b.status === status));
}
