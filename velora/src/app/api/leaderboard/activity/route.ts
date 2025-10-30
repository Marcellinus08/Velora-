import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddr = searchParams.get("userAddr")?.toLowerCase();
    const type = searchParams.get("type"); // 'all', 'content', 'tasks', 'social', 'earnings'
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userAddr) {
      return NextResponse.json({ error: "userAddr is required" }, { status: 400 });
    }

    const activities: any[] = [];

    // 1. Video Upload Activity (with earnings from sales)
    if (!type || type === "all" || type === "content" || type === "earnings") {
      const { data: videos, error: vError } = await supabaseAdmin
        .from("videos")
        .select(`
          id, 
          title, 
          thumb_url, 
          created_at, 
          view_count, 
          likes_count,
          price_cents,
          abstract_id
        `)
        .eq("abstract_id", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!vError && videos) {
        for (const video of videos) {
          // Get video sales count and total earnings
          const { data: sales } = await supabaseAdmin
            .from("video_purchases")
            .select("price_cents")
            .eq("video_id", video.id);

          const videoEarnings = sales?.reduce((sum, sale) => sum + ((sale.price_cents || 0) / 100), 0) || 0;

          activities.push({
            type: "video_upload",
            id: `video_${video.id}`,
            date: video.created_at,
            description: `Uploaded video "${video.title}"`,
            video: {
              id: video.id,
              title: video.title,
              thumbnail: video.thumb_url,
              views: video.view_count || 0,
              likes: video.likes_count || 0,
            },
            earnings: videoEarnings,
            points: 20, // Base points for upload
            icon: "upload",
          });
        }
      }
    }

    // 2. Task Completion Activity
    if (!type || type === "all" || type === "tasks") {
      const { data: progress, error: pError } = await supabaseAdmin
        .from("user_video_progress")
        .select(`
          *,
          video:videos (
            id,
            title,
            thumb_url
          )
        `)
        .eq("user_addr", userAddr)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (!pError && progress) {
        progress.forEach((p) => {
          // Task completion
          if (p.has_completed_task && p.points_from_task > 0) {
            activities.push({
              type: "task_completed",
              id: `task_${p.video_id}`,
              date: p.updated_at,
              description: `Completed task for "${p.video?.title || 'video'}"`,
              video: {
                id: p.video_id,
                title: p.video?.title || "Unknown Video",
                thumbnail: p.video?.thumb_url,
              },
              points: p.points_from_task,
              icon: "check_circle",
            });
          }

          // Video share
          if (p.has_shared && p.points_from_share > 0) {
            activities.push({
              type: "video_shared",
              id: `share_${p.video_id}`,
              date: p.updated_at,
              description: `Shared video "${p.video?.title || 'video'}"`,
              video: {
                id: p.video_id,
                title: p.video?.title || "Unknown Video",
                thumbnail: p.video?.thumb_url,
              },
              points: p.points_from_share,
              icon: "share",
            });
          }

          // Video purchase
          if (p.has_purchased && p.points_from_purchase > 0) {
            activities.push({
              type: "video_purchased",
              id: `purchase_${p.video_id}`,
              date: p.purchased_at || p.updated_at,
              description: `Purchased video "${p.video?.title || 'video'}"`,
              video: {
                id: p.video_id,
                title: p.video?.title || "Unknown Video",
                thumbnail: p.video?.thumb_url,
              },
              points: p.points_from_purchase,
              icon: "shopping_cart",
            });
          }
        });
      }
    }

    // 3. Social Interactions (Community Posts)
    if (!type || type === "all" || type === "social") {
      const { data: posts, error: postsError } = await supabaseAdmin
        .from("community_posts")
        .select("id, content, created_at, likes_count, comments_count")
        .eq("user_addr", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!postsError && posts) {
        posts.forEach((post) => {
          activities.push({
            type: "post_created",
            id: `post_${post.id}`,
            date: post.created_at,
            description: `Created a community post`,
            post: {
              id: post.id,
              content: post.content?.substring(0, 100) || "",
              likes: post.likes_count || 0,
              comments: post.comments_count || 0,
            },
            points: 5,
            icon: "forum",
          });
        });
      }
    }

    // 4. Meet Activity (Hosted or Attended)
    if (!type || type === "all" || type === "earnings") {
      // Meets as creator (earnings)
      const { data: hostedMeets, error: hmError } = await supabaseAdmin
        .from("meets")
        .select(`
          *,
          participant:profiles!meets_participant_addr_fkey (
            username,
            avatar_url
          )
        `)
        .eq("creator_addr", userAddr)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!hmError && hostedMeets) {
        hostedMeets.forEach((meet) => {
          const participantName = 
            meet.participant?.username || 
            (meet.participant_addr ? `${meet.participant_addr.slice(0, 6)}…${meet.participant_addr.slice(-4)}` : "participant");
          
          activities.push({
            type: "meet_hosted",
            id: `meet_host_${meet.id}`,
            date: meet.scheduled_at || meet.created_at,
            description: `Hosted ${meet.duration_minutes || 0}min call with ${participantName}`,
            meet: {
              id: meet.id,
              duration: meet.duration_minutes || 0,
              participant: participantName,
              participantAvatar: meet.participant?.avatar_url,
            },
            earnings: (meet.total_price_cents || 0) / 100,
            points: Math.floor((meet.duration_minutes || 0) * 5), // 5 points per minute
            icon: "video_call",
          });
        });
      }

      // Meets as participant
      const { data: attendedMeets, error: amError } = await supabaseAdmin
        .from("meets")
        .select(`
          *,
          creator:profiles!meets_creator_addr_fkey (
            username,
            avatar_url
          )
        `)
        .eq("participant_addr", userAddr)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!amError && attendedMeets) {
        attendedMeets.forEach((meet) => {
          const creatorName = 
            meet.creator?.username || 
            (meet.creator_addr ? `${meet.creator_addr.slice(0, 6)}…${meet.creator_addr.slice(-4)}` : "creator");
          
          activities.push({
            type: "meet_attended",
            id: `meet_attend_${meet.id}`,
            date: meet.scheduled_at || meet.created_at,
            description: `Attended ${meet.duration_minutes || 0}min call with ${creatorName}`,
            meet: {
              id: meet.id,
              duration: meet.duration_minutes || 0,
              creator: creatorName,
              creatorAvatar: meet.creator?.avatar_url,
            },
            points: Math.floor((meet.duration_minutes || 0) * 2), // 2 points per minute
            icon: "videocam",
          });
        });
      }
    }

    // Get actual total points from database
    const { data: currentProgress } = await supabaseAdmin
      .from("user_video_progress")
      .select("total_points_earned")
      .eq("user_addr", userAddr);

    const totalPointsEarned = currentProgress?.reduce((sum, p) => sum + (p.total_points_earned || 0), 0) || 0;

    // Sort all activities by date (newest first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate stats
    const totalEarnings = activities
      .filter((a) => a.earnings)
      .reduce((sum, item) => sum + (item.earnings || 0), 0);

    return NextResponse.json({
      success: true,
      userAddr,
      activities: activities.slice(0, limit),
      stats: {
        totalActivities: activities.length,
        totalPointsEarned,
        totalEarnings,
        videosUploaded: activities.filter((a) => a.type === "video_upload").length,
        tasksCompleted: activities.filter((a) => a.type === "task_completed").length,
        postsCreated: activities.filter((a) => a.type === "post_created").length,
        meetsHosted: activities.filter((a) => a.type === "meet_hosted").length,
        meetsAttended: activities.filter((a) => a.type === "meet_attended").length,
      },
    });
  } catch (e: any) {
    console.error("[GET /api/leaderboard/activity] error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
