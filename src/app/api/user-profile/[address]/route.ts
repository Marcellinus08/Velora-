// src/app/api/abstract/user/[address]/route.ts
import { NextRequest, NextResponse } from "next/server";

const ABSTRACT_PORTAL_API_URL = "https://backend.portal.abs.xyz/api";
const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: raw } = await params; // await dynamic params Promise
    const address = (raw || "").trim();

    // Jika address tidak valid, kembalikan objek kosong (hindari 4xx di FE)
    if (!ETH_RE.test(address)) {
      return NextResponse.json({}, { status: 200 });
    }

    const response = await fetch(
      `${ABSTRACT_PORTAL_API_URL}/user/address/${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "velora-app/1.0",
        },
        // Cache di edge 5 menit
        next: { revalidate: 300 },
      }
    );

    // Jika Abstract tidak menemukan profil / error lain → jangan lempar 404 ke FE
    if (!response.ok) {
      // Opsional: log status untuk debugging
      console.warn(
        `[abstract-user] upstream status ${response.status} for ${address}`
      );
      return NextResponse.json({}, { status: 200 });
    }

    const profileData = await response.json();

    // Kembalikan data apa adanya; FE bebas pilih field yang dipakai
    return NextResponse.json(profileData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[abstract-user] error:", error);
    // Diamkan error ke FE (hindari merah di console)
    return NextResponse.json({}, { status: 200 });
  }
}
