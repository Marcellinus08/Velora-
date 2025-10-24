import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content, abstractId } = await req.json();
    
    if (!content?.trim() || !abstractId) {
      return NextResponse.json(
        { error: "Content and abstractId are required" },
        { status: 400 }
      );
    }

    // Verify the user owns this reply
    const { data: reply } = await supabaseAdmin
      .from("community_replies")
      .select("abstract_id")
      .eq("id", params.id)
      .single();

    if (!reply) {
      return NextResponse.json(
        { error: "Reply not found" },
        { status: 404 }
      );
    }

    if (reply.abstract_id.toLowerCase() !== abstractId.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update the reply
    const { error, data } = await supabaseAdmin
      .from("community_replies")
      .update({ 
        content: content.trim()
      })
      .eq("id", params.id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[API] Edit reply error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to edit reply" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { abstractId } = await req.json();
    
    if (!abstractId) {
      return NextResponse.json(
        { error: "AbstractId is required" },
        { status: 400 }
      );
    }

    // Verify the user owns this reply
    const { data: reply } = await supabaseAdmin
      .from("community_replies")
      .select("abstract_id")
      .eq("id", params.id)
      .single();

    if (!reply) {
      return NextResponse.json(
        { error: "Reply not found" },
        { status: 404 }
      );
    }

    if (reply.abstract_id.toLowerCase() !== abstractId.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the reply
    const { error } = await supabaseAdmin
      .from("community_replies")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[API] Delete reply error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to delete reply" },
      { status: 500 }
    );
  }
}