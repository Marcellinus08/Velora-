// src/app/api/studio/videos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // await Promise-based params
    const vid = (id || "").trim();
    if (!vid) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? "").trim();
    const description =
      typeof body?.description === "string" && body.description.trim() !== ""
        ? String(body.description).trim()
        : null;

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 422 });
    }

    // TODO (opsional, disarankan):
    // validasi kepemilikan video: cocokan abstract_id dari sesi user
    // dengan kolom abstract_id pada tabel videos.

    const { data, error } = await supabaseAdmin
      .from("videos")
      .update({ title, description })
      .eq("id", vid)
      .select("id,title,description")
      .maybeSingle();

    if (error) {
      console.error("[videos PATCH] DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[videos PATCH] Fatal:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Menambahkan fungsi DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // await Promise-based params
    const vid = (id || "").trim();
    if (!vid) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Menghapus video dari database
    const { error } = await supabaseAdmin
      .from("videos")
      .delete()
      .eq("id", vid);

    if (error) {
      console.error("[videos DELETE] DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 });
  } catch (e) {
    console.error("[videos DELETE] Fatal:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
