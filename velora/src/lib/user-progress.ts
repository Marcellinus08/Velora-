/**
 * Helper functions untuk user progress tracking
 */

export type ProgressAction = "purchase" | "task" | "share";

export interface UserVideoProgress {
  id: string;
  user_addr: string;
  video_id: string;
  has_purchased: boolean;
  has_completed_task: boolean;
  has_shared: boolean;
  points_from_purchase: number;
  points_from_task: number;
  points_from_share: number;
  total_points_earned: number;
  purchased_at?: string;
  task_completed_at?: string;
  shared_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch user progress untuk video tertentu
 */
export async function getUserProgress(
  userAddr: string,
  videoId: string
): Promise<UserVideoProgress | null> {
  try {
    const response = await fetch(
      `/api/user-progress?userAddr=${encodeURIComponent(userAddr)}&videoId=${encodeURIComponent(videoId)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch progress");
    }

    const data = await response.json();
    return data.progress;
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return null;
  }
}

/**
 * Update user progress (award points untuk action tertentu)
 */
export async function updateUserProgress(
  userAddr: string,
  videoId: string,
  action: ProgressAction,
  totalPoints: number
): Promise<{ success: boolean; pointsAwarded: number; progress: UserVideoProgress | null }> {
  try {
    const response = await fetch("/api/user-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAddr: userAddr.toLowerCase(),
        videoId,
        action,
        totalPoints,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update progress");
    }

    const data = await response.json();
    return {
      success: true,
      pointsAwarded: data.pointsAwarded || 0,
      progress: data.progress,
    };
  } catch (error) {
    console.error("Error updating user progress:", error);
    return {
      success: false,
      pointsAwarded: 0,
      progress: null,
    };
  }
}

/**
 * Hitung persentase completion dari video
 */
export function calculateCompletionPercentage(progress: UserVideoProgress | null): number {
  if (!progress) return 0;

  let completed = 0;
  if (progress.has_purchased) completed++;
  if (progress.has_completed_task) completed++;
  if (progress.has_shared) completed++;

  return Math.floor((completed / 3) * 100);
}

/**
 * Cek apakah user sudah complete semua aktivitas
 */
export function isFullyCompleted(progress: UserVideoProgress | null): boolean {
  if (!progress) return false;
  return progress.has_purchased && progress.has_completed_task && progress.has_shared;
}
