import { sbService } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await sbService
      .from('videos')
      .select(`
        *,
        creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[admin/videos GET] error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch videos' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, videos: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[admin/videos GET] unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE video
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await sbService
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[admin/videos PUT] error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update video' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, video: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[admin/videos PUT] unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE video
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      );
    }

    const { error } = await sbService
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[admin/videos DELETE] error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete video' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Video deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[admin/videos DELETE] unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
