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

          // Creator gets 70% of video sales (30% goes to platform)
          const videoSalesTotal = sales?.reduce((sum, sale) => sum + ((sale.price_cents || 0) / 100), 0) || 0;
          const videoEarnings = videoSalesTotal * 0.7; // 70% for creator

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
            points: 0, // No points for upload
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
          // Task completion (include both correct and wrong answers)
          if (p.has_completed_task) {
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
              points: p.points_from_task || 0, // 0 if wrong answer
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
            points: 0, // No points for community post
            icon: "forum",
          });
        });
      }

      // Community Comments
      const { data: communityComments, error: ccError } = await supabaseAdmin
        .from("community_comments")
        .select(`
          *,
          post:community_posts (
            id,
            content,
            user_addr
          )
        `)
        .eq("user_addr", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!ccError && communityComments) {
        communityComments.forEach((comment) => {
          activities.push({
            type: "community_comment",
            id: `community_comment_${comment.id}`,
            date: comment.created_at,
            description: `Commented on a community post`,
            comment: {
              id: comment.id,
              text: comment.comment?.substring(0, 100) || "",
            },
            post: {
              id: comment.post_id,
              content: comment.post?.content?.substring(0, 50) || "",
            },
            points: 0, // No points for community comment
            icon: "chat",
          });
        });
      }
    }

    // 4. Campaign/Ads Creation Activity (with points)
    if (!type || type === "all" || type === "content") {
      const { data: campaigns, error: cError } = await supabaseAdmin
        .from("campaigns")
        .select("*")
        .eq("creator_addr", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!cError && campaigns) {
        for (const campaign of campaigns) {
          // Get click count for this campaign
          const { count: clickCount } = await supabaseAdmin
            .from("campaign_clicks")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          // Calculate points earned from this campaign (creation_fee_cents / 10)
          const adsPoints = campaign.creation_fee_cents ? Math.floor(campaign.creation_fee_cents / 10) : 0;

          activities.push({
            type: "campaign_created",
            id: `campaign_${campaign.id}`,
            date: campaign.created_at,
            description: `Created ad campaign "${campaign.title}"`,
            campaign: {
              id: campaign.id,
              title: campaign.title,
              banner_url: campaign.banner_url,
              clicks: clickCount || 0,
              status: campaign.status,
            },
            points: adsPoints,
            icon: "campaign",
          });
        }
      }
    }

    // 5. Follow Activity
    if (!type || type === "all" || type === "social") {
      const { data: follows, error: fError } = await supabaseAdmin
        .from("follows")
        .select(`
          *,
          followed:profiles!follows_following_addr_fkey (
            username,
            avatar_url,
            abstract_id
          )
        `)
        .eq("follower_addr", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!fError && follows) {
        follows.forEach((follow) => {
          const followedName = 
            follow.followed?.username || 
            (follow.following_addr ? `${follow.following_addr.slice(0, 6)}…${follow.following_addr.slice(-4)}` : "user");

          activities.push({
            type: "user_followed",
            id: `follow_${follow.id}`,
            date: follow.created_at,
            description: `Followed ${followedName}`,
            user: {
              name: followedName,
              avatar: follow.followed?.avatar_url,
              addr: follow.following_addr,
            },
            points: 0, // No points for following
            icon: "person_add",
          });
        });
      }
    }

    // 6. Comments Activity
    if (!type || type === "all" || type === "social") {
      const { data: comments, error: commError } = await supabaseAdmin
        .from("video_comments")
        .select(`
          *,
          video:videos (
            id,
            title,
            thumb_url
          )
        `)
        .eq("user_addr", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!commError && comments) {
        comments.forEach((comment) => {
          activities.push({
            type: "comment_posted",
            id: `comment_${comment.id}`,
            date: comment.created_at,
            description: `Commented on "${comment.video?.title || 'video'}"`,
            comment: {
              id: comment.id,
              text: comment.comment?.substring(0, 100) || "",
            },
            video: {
              id: comment.video_id,
              title: comment.video?.title || "Unknown Video",
              thumbnail: comment.video?.thumb_url,
            },
            points: 0, // No points for commenting
            icon: "comment",
          });
        });
      }
    }

    // 7. Likes Activity
    if (!type || type === "all" || type === "social") {
      const { data: likes, error: lError } = await supabaseAdmin
        .from("video_likes")
        .select(`
          *,
          video:videos (
            id,
            title,
            thumb_url
          )
        `)
        .eq("user_addr", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!lError && likes) {
        likes.forEach((like) => {
          activities.push({
            type: "video_liked",
            id: `like_${like.id}`,
            date: like.created_at,
            description: `Liked "${like.video?.title || 'video'}"`,
            video: {
              id: like.video_id,
              title: like.video?.title || "Unknown Video",
              thumbnail: like.video?.thumb_url,
            },
            points: 0, // No points for liking
            icon: "favorite",
          });
        });
      }
    }

    // 8. Earnings from Video Sales (detailed)
    if (!type || type === "all" || type === "earnings") {
      const { data: mySales, error: sError } = await supabaseAdmin
        .from("video_purchases")
        .select(`
          *,
          video:videos!video_purchases_video_id_fkey (
            id,
            title,
            thumb_url,
            abstract_id
          ),
          buyer:profiles!video_purchases_buyer_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq("video.abstract_id", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!sError && mySales) {
        mySales.forEach((sale) => {
          const buyerName = 
            sale.buyer?.username || 
            (sale.buyer_id ? `${sale.buyer_id.slice(0, 6)}…${sale.buyer_id.slice(-4)}` : "buyer");

          activities.push({
            type: "video_sold",
            id: `sale_${sale.id}`,
            date: sale.created_at,
            description: `Sold "${sale.video?.title || 'video'}" to ${buyerName}`,
            video: {
              id: sale.video_id,
              title: sale.video?.title || "Unknown Video",
              thumbnail: sale.video?.thumb_url,
            },
            buyer: {
              name: buyerName,
              avatar: sale.buyer?.avatar_url,
            },
            earnings: (sale.price_cents || 0) / 100,
            points: 0, // No points, but earnings
            icon: "attach_money",
          });
        });
      }
    }

    // 9. Meet Activity (Hosted, Attended, and Purchased)
    if (!type || type === "all" || type === "earnings") {
      // Meet purchases (as buyer/participant booking)
      const { data: meetPurchases, error: mpError } = await supabaseAdmin
        .from("meets")
        .select(`
          *,
          creator:profiles!meets_creator_addr_fkey (
            username,
            avatar_url
          )
        `)
        .eq("participant_addr", userAddr)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!mpError && meetPurchases) {
        meetPurchases.forEach((meet) => {
          const creatorName = 
            meet.creator?.username || 
            (meet.creator_addr ? `${meet.creator_addr.slice(0, 6)}…${meet.creator_addr.slice(-4)}` : "creator");
          
          activities.push({
            type: "meet_purchase",
            id: `meet_purchase_${meet.id}`,
            date: meet.created_at,
            description: `Booked ${meet.duration_minutes || 0}min call with ${creatorName}`,
            meet: {
              id: meet.id,
              duration: meet.duration_minutes || 0,
              creator: creatorName,
              creatorAvatar: meet.creator?.avatar_url,
              status: meet.status,
            },
            points: 0, // No points for purchasing meet
            icon: "call",
          });
        });
      }

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
          
          // Creator gets 80% of meet earnings (20% goes to platform)
          const meetTotal = (meet.total_price_cents || 0) / 100;
          const creatorEarnings = meetTotal * 0.8; // 80% for creator (payMeet: 80/20)
          
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
            earnings: creatorEarnings,
            points: 0, // No points for hosting meet
            icon: "video_call",
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

    // Get ads points from user_ads_progress
    const { data: adsProgress } = await supabaseAdmin
      .from("user_ads_progress")
      .select("total_ads_points, campaigns_created")
      .eq("user_addr", userAddr)
      .maybeSingle();

    const adsPointsTotal = adsProgress?.total_ads_points || 0;
    const adsCreatedCount = adsProgress?.campaigns_created || 0;

    // Sort all activities by date (newest first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate total profit separately (always, regardless of filter)
    // 1. Get ALL video sales earnings
    const { data: allVideos } = await supabaseAdmin
      .from("videos")
      .select("id")
      .eq("abstract_id", userAddr);

    let totalVideoEarnings = 0;
    if (allVideos) {
      for (const video of allVideos) {
        const { data: sales } = await supabaseAdmin
          .from("video_purchases")
          .select("price_cents")
          .eq("video_id", video.id);
        
        // Creator gets 70% of video sales (30% goes to platform)
        const videoSalesTotal = sales?.reduce((sum, sale) => sum + ((sale.price_cents || 0) / 100), 0) || 0;
        totalVideoEarnings += videoSalesTotal * 0.7; // 70% for creator
      }
    }

    // 2. Get ALL completed meets earnings
    const { data: allMeets } = await supabaseAdmin
      .from("meets")
      .select("total_price_cents")
      .eq("creator_addr", userAddr)
      .eq("status", "completed");

    // Creator gets 80% of meet earnings (20% goes to platform)
    const meetTotal = allMeets?.reduce((sum, meet) => sum + ((meet.total_price_cents || 0) / 100), 0) || 0;
    const totalMeetEarnings = meetTotal * 0.8; // 80% for creator (payMeet: 80/20)

    // Total profit = video sales (70%) + meet earnings (80%)
    const totalProfit = totalVideoEarnings + totalMeetEarnings;

    // Calculate stats from activities (for display in cards)
    const totalEarnings = activities
      .filter((a) => a.earnings)
      .reduce((sum, item) => sum + (item.earnings || 0), 0);

    const totalPoints = activities
      .reduce((sum, item) => sum + (item.points || 0), 0);

    // Count only activities that earned points (purchases, tasks with correct answers, shares)
    const videoPurchasesWithPoints = activities.filter((a) => a.type === "video_purchased" && a.points > 0).length;
    const tasksCompletedWithPoints = activities.filter((a) => a.type === "task_completed" && a.points > 0).length;
    const videoSharesWithPoints = activities.filter((a) => a.type === "video_shared" && a.points > 0).length;

    return NextResponse.json({
      success: true,
      userAddr,
      activities: activities.slice(0, limit),
      stats: {
        totalActivities: activities.length,
        totalPointsEarned: totalPoints,
        totalEarnings: totalProfit, // Use calculated profit instead
        
        // Only count activities that earned points
        videoPurchases: videoPurchasesWithPoints,
        tasksCompleted: tasksCompletedWithPoints,
        videoShares: videoSharesWithPoints,
        
        // Ads stats
        adsCreated: adsCreatedCount,
        adsPoints: adsPointsTotal,
        
        // Additional stats
        videosUploaded: activities.filter((a) => a.type === "video_upload").length,
        postsCreated: activities.filter((a) => a.type === "post_created").length,
        communityComments: activities.filter((a) => a.type === "community_comment").length,
        meetsHosted: activities.filter((a) => a.type === "meet_hosted").length,
        meetsPurchased: activities.filter((a) => a.type === "meet_purchase").length,
        campaignsCreated: activities.filter((a) => a.type === "campaign_created").length,
        usersFollowed: activities.filter((a) => a.type === "user_followed").length,
        commentsPosted: activities.filter((a) => a.type === "comment_posted").length,
        videosLiked: activities.filter((a) => a.type === "video_liked").length,
        videosSold: activities.filter((a) => a.type === "video_sold").length,
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
