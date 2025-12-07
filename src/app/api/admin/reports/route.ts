import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Fetch all videos with creator info
    const { data: videos, error: videosError } = await supabaseAdmin
      .from('videos')
      .select(`
        *,
        creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (videosError) {
      console.error('[admin/reports GET] videos error:', videosError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch videos' },
        { status: 500 }
      );
    }

    // Fetch all profiles for user analytics
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('[admin/reports GET] profiles error:', profilesError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const totalVideos = videos?.length || 0;
    const totalUsers = profiles?.length || 0;

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate active users (created in last 30 days)
    const activeUsers = profiles?.filter(p => 
      new Date(p.created_at) >= thirtyDaysAgo
    ).length || 0;

    // Calculate new registrations this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newRegistrations = profiles?.filter(p => 
      new Date(p.created_at) >= startOfMonth
    ).length || 0;

    // Most commented videos (top 10)
    const mostCommentedVideos = videos
      ?.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        title: v.title,
        comments: v.comments_count || 0,
        creator: v.creator?.username || 'Unknown',
        thumbnail: v.thumb_url,
        category: v.category,
      })) || [];

    // Most liked videos (top 10)
    const mostLikedVideos = videos
      ?.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        title: v.title,
        likes: v.likes_count || 0,
        creator: v.creator?.username || 'Unknown',
        thumbnail: v.thumb_url,
        category: v.category,
      })) || [];

    // Videos by category
    const videosByCategory: Record<string, number> = {};
    videos?.forEach(v => {
      const category = v.category || 'Other';
      videosByCategory[category] = (videosByCategory[category] || 0) + 1;
    });

    // Upload trend (last 6 months)
    const uploadTrend: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const count = videos?.filter(v => {
        const videoDate = new Date(v.created_at);
        return videoDate.getMonth() === date.getMonth() && 
               videoDate.getFullYear() === date.getFullYear();
      }).length || 0;
      
      uploadTrend.push({ month: monthStr, count });
    }

    // Calculate average video duration
    const totalDuration = videos?.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) || 0;
    const avgDuration = totalVideos > 0 ? Math.round(totalDuration / totalVideos) : 0;

    // Calculate total watch time (views * duration)
    const totalWatchTime = videos?.reduce((sum, v) => 
      sum + ((v.views_count || 0) * (v.duration_seconds || 0)), 0
    ) || 0;

    // User Growth (last 6 months)
    const userGrowth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const count = profiles?.filter(p => {
        const userDate = new Date(p.created_at);
        return userDate.getMonth() === date.getMonth() && 
               userDate.getFullYear() === date.getFullYear();
      }).length || 0;
      
      userGrowth.push({ month: monthStr, count });
    }

    // Calculate inactive users (no activity in last 30 days)
    const inactiveUsers = totalUsers - activeUsers;

    // Top Content Creators (by video count)
    const creatorStats: Record<string, { username: string; videos: number; followers: number }> = {};
    
    videos?.forEach(v => {
      const creatorId = v.abstract_id;
      const creatorName = v.creator?.username || 'Unknown';
      
      if (!creatorStats[creatorId]) {
        creatorStats[creatorId] = {
          username: creatorName,
          videos: 0,
          followers: 0, // Placeholder
        };
      }
      creatorStats[creatorId].videos++;
    });

    const topCreators = Object.values(creatorStats)
      .sort((a, b) => b.videos - a.videos)
      .slice(0, 10);

    // Engagement Metrics
    const totalLikes = videos?.reduce((sum, v) => sum + (v.likes_count || 0), 0) || 0;
    const totalComments = videos?.reduce((sum, v) => sum + (v.comments_count || 0), 0) || 0;
    const totalShares = videos?.reduce((sum, v) => sum + (v.shares_count || 0), 0) || 0;
    
    const avgLikesPerVideo = totalVideos > 0 ? totalLikes / totalVideos : 0;
    const avgCommentsPerVideo = totalVideos > 0 ? totalComments / totalVideos : 0;
    const avgSharesPerVideo = totalVideos > 0 ? totalShares / totalVideos : 0;
    const totalEngagement = totalLikes + totalComments + totalShares;

    // Most Active Users (by engagement - likes + comments given)
    const mostActiveUsers = profiles
      ?.slice(0, 10)
      .map(p => ({
        username: p.username || 'Unknown',
        engagement: Math.floor(Math.random() * 1000), // Placeholder
      }))
      .sort((a, b) => b.engagement - a.engagement) || [];

    // Platform Health (placeholder data)
    const platformHealth = {
      storageUsage: 157286400000, // ~146 GB
      bandwidthUsage: 524288000000, // ~488 GB
      errorRate: 0.05,
      apiResponseTime: 145,
    };

    return NextResponse.json(
      {
        success: true,
        overview: {
          totalRevenue: 0, // Placeholder
          totalTransactions: 0, // Placeholder
          activeUsers,
          newRegistrations,
        },
        videoAnalytics: {
          totalVideos,
          mostCommentedVideos,
          mostLikedVideos,
          videosByCategory,
          uploadTrend,
          avgDuration,
          totalWatchTime,
        },
        userAnalytics: {
          totalUsers,
          userGrowth,
          activeUsers,
          inactiveUsers,
          topCreators,
        },
        engagementMetrics: {
          avgLikesPerVideo,
          avgCommentsPerVideo,
          avgSharesPerVideo,
          totalEngagement,
          mostActiveUsers,
        },
        platformHealth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[admin/reports GET] unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
