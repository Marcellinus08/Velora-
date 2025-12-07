import { sbService } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await sbService
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[admin/users GET] error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Remove duplicates based on abstract_id (keep the first occurrence)
    const uniqueUsers = data?.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => item.abstract_id === current.abstract_id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []) || [];

    // Get followers and following counts from profiles_follows table
    const usersWithCounts = await Promise.all(
      uniqueUsers.map(async (user) => {
        // Count followers (where follower_addr = user's address)
        const { count: followersCount } = await sbService
          .from('profiles_follows')
          .select('*', { count: 'exact', head: true })
          .eq('followee_addr', user.abstract_id);

        // Count following (where followee_addr = user's address)
        const { count: followingCount } = await sbService
          .from('profiles_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_addr', user.abstract_id);

        return {
          ...user,
          followers_count: followersCount || 0,
          following_count: followingCount || 0,
        };
      })
    );

    return NextResponse.json(
      { success: true, users: usersWithCounts },
      { status: 200 }
    );
  } catch (error) {
    console.error('[admin/users GET] unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
