// src/app/api/abstract/user/[address]/route.ts
import { NextRequest, NextResponse } from "next/server";

const ABSTRACT_PORTAL_API_URL = "https://backend.portal.abs.xyz/api";
const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

// Helper: telusuri beberapa kemungkinan nama property avatar yang dikirim Abstract
function extractAvatarUrl(data: any): string | null {
  if (!data) return null;

  // kasus umum (silakan tambah sesuai format yang kamu lihat dari backend portal)
  return (
    data.avatar ||
    data.profilePicture ||
    data.profile_picture ||
    data.imageUrl ||
    data.image_url ||
    data.photoUrl ||
    data.photo_url ||
    null
  );
}

// Next.js 15 dynamic route params are provided as a Promise and must be awaited.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: rawAddress } = await params; // await the params Promise
    const raw = rawAddress?.trim() || "";
    const address = raw.toLowerCase();
    if (!ETH_RE.test(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const response = await fetch(
      `${ABSTRACT_PORTAL_API_URL}/user/address/${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "agw-reusables/1.0",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "User profile not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: response.status }
      );
    }

    const rawProfile = await response.json();

    // Normalisasi hasil — agar client cukup membaca .avatarUrl jika butuh avatar
    const avatarUrl = extractAvatarUrl(rawProfile);
    const payload = {
      address,
      avatarUrl,    // <— selalu ada jika Abstract mengirimkannya
      raw: rawProfile,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
