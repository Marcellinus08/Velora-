// /src/app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "feedback";
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
];

type UiType = "Bug" | "Idea" | "Other";
type DbType = "bug" | "idea" | "other";

function mapType(t: UiType): DbType {
  return t.toLowerCase() as DbType;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Fields dari form
    const uiType = formData.get("type") as UiType | null;
    const message = (formData.get("message") as string | null)?.trim() || "";
    const email = (formData.get("email") as string | null)?.trim() || null;
    const ts = formData.get("ts") as string | null;
    // opsional: kaitkan ke profil
    const profileAbstractId =
      (formData.get("profile_abstract_id") as string | null)?.trim() || null;

    const mediaFile = formData.get("media") as File | null;

    // Validasi
    if (!uiType || !["Bug", "Idea", "Other"].includes(uiType)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }
    if (!ts) {
      return NextResponse.json({ error: "Missing ts" }, { status: 400 });
    }

    // Pastikan bucket ada (aman jika sudah ada)
    try {
      await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
    } catch {
      /* ignore if exists */
    }

    // Upload file jika ada
    let mediaPath: string | null = null;
    let mediaType: string | null = null;
    let mediaSize: number | null = null;

    if (mediaFile && mediaFile.size > 0) {
      if (mediaFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size must be less than 5MB" },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(mediaFile.type)) {
        return NextResponse.json(
          {
            error:
              "Invalid file type. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM)",
          },
          { status: 400 }
        );
      }

      const ext = mediaFile.name.split(".").pop() || "bin";
      const objectPath = `${uuidv4()}.${ext}`;

      const arrayBuffer = await mediaFile.arrayBuffer();
      // @ts-ignore - Buffer tersedia di runtime node
      const buffer: Buffer = Buffer.from(arrayBuffer);

      const { data: up, error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(objectPath, buffer, {
          contentType: mediaFile.type,
          upsert: false,
        });

      if (upErr) {
        console.error("Upload error:", upErr);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
      }

      mediaPath = up!.path; // simpan path objek
      mediaType = mediaFile.type;
      mediaSize = mediaFile.size;
    }

    // Insert ke DB
    const { data: row, error: insertErr } = await supabaseAdmin
      .from("feedback")
      .insert({
        type: mapType(uiType),
        message,
        email,
        media_path: mediaPath,
        media_type: mediaType,
        media_size: mediaSize,
        profile_abstract_id: profileAbstractId, // boleh null
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      console.error("DB insert error:", insertErr);
      // rollback file kalau perlu
      if (mediaPath) {
        try {
          await supabaseAdmin.storage.from(BUCKET).remove([mediaPath]);
        } catch (e) {
          console.warn("Cleanup failed:", e);
        }
      }
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        feedback: {
          id: row.id,
          type: row.type,
          message: row.message,
          status: row.status,
          created_at: row.created_at,
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Feedback API error:", e?.message || e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let q = supabaseAdmin
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) q = q.eq("status", status);
    if (type) q = q.eq("type", type);

    const { data, error } = await q;
    if (error) {
      console.error("DB select error:", error);
      return NextResponse.json({ error: "Failed to retrieve feedback" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      feedbacks: data,
      pagination: { limit, offset, count: data?.length || 0 },
    });
  } catch (e: any) {
    console.error("Feedback GET error:", e?.message || e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
