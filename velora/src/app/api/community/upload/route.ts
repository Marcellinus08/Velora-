// src/app/api/community/upload/route.ts
import { NextResponse } from "next/server";
import { sbService } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ambil metadata sederhana (opsional, hanya untuk image)
async function getImageMeta(buf: Buffer) {
  try {
    const sharp = (await import("sharp")).default;
    const info = await sharp(buf).metadata();
    return { width: info.width ?? null, height: info.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

// Buat nama file aman: huruf/angka/dash saja
function safeBaseName(name: string) {
  const base = name.replace(/\.[^.]+$/, ""); // buang ekstensi
  return base.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "file";
}
function getExt(name: string, mime: string) {
  const ext = name.split(".").pop() || "";
  if (ext) return ext.toLowerCase();
  const guess = mime.split("/")[1] || "bin";
  return guess.toLowerCase();
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "files required" }, { status: 400 });
    }

    const items: {
      path: string;
      mime: string;
      width: number | null;
      height: number | null;
      duration_s: number | null;
    }[] = [];

    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      const base = safeBaseName(f.name || "file");
      const ext = getExt(f.name || "", f.type || "application/octet-stream");

      // ==== SIMPEL TANPA FOLDER: simpan langsung di root bucket ====
      const key = `${crypto.randomUUID()}-${base}.${ext}`;

      const { data, error } = await sbService.storage
        .from("community")
        .upload(key, buf, { contentType: f.type || "application/octet-stream", upsert: false });

      if (error) throw new Error(error.message);

      let width: number | null = null;
      let height: number | null = null;
      let duration_s: number | null = null;

      if ((f.type || "").startsWith("image/")) {
        const meta = await getImageMeta(buf);
        width = meta.width;
        height = meta.height;
      }

      items.push({
        path: data.path,       // contoh: "c9d0...-image-name.jpg"
        mime: f.type || "application/octet-stream",
        width,
        height,
        duration_s,
      });
    }

    return NextResponse.json({ items }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload error" }, { status: 500 });
  }
}
