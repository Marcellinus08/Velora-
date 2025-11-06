"use client";

import { useState, useEffect } from "react";
import { Heart, HeartOff, Loader2 } from "lucide-react";

interface FollowButtonProps {
  creatorAddr: string;
  userAddr?: string;
  creatorUsername?: string;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
}

export function FollowButton({
  creatorAddr,
  userAddr,
  creatorUsername,
  onFollowChange,
  className = "",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check follow status on mount or when addresses change
  useEffect(() => {
    if (!userAddr || !creatorAddr) return;

    const checkFollowStatus = async () => {
      try {
        const response = await fetch("/api/profiles/follow/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            follower_addr: userAddr,
            followee_addr: creatorAddr,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (err) {
        console.error("[Follow Button] Error checking status:", err);
      }
    };

    checkFollowStatus();
  }, [userAddr, creatorAddr]);

  const handleFollowClick = async () => {
    if (!userAddr || !creatorAddr) {
      setError("Please connect your wallet first");
      return;
    }

    if (userAddr.toLowerCase() === creatorAddr.toLowerCase()) {
      setError("You cannot follow yourself");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        // Unfollow
        const response = await fetch("/api/profiles/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            follower_addr: userAddr,
            followee_addr: creatorAddr,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to unfollow");
        }

        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        // Follow
        const response = await fetch("/api/profiles/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            follower_addr: userAddr,
            followee_addr: creatorAddr,
            followee_username: creatorUsername,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to follow");
        }

        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("[Follow Button] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userAddr || !creatorAddr) {
    return null;
  }

  // Don't show button if user is viewing own profile
  if (userAddr.toLowerCase() === creatorAddr.toLowerCase()) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleFollowClick}
        disabled={isLoading}
        className={`
          relative inline-flex items-center justify-center gap-2
          px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isFollowing
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 active:scale-95"
              : "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 active:scale-95"
          }
          ${className}
        `}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isFollowing ? (
          <Heart size={18} className="fill-current" />
        ) : (
          <HeartOff size={18} />
        )}
        <span className="text-sm">
          {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
        </span>
      </button>

      {error && (
        <div className="text-xs text-red-400 px-1">
          {error}
        </div>
      )}
    </div>
  );
}

export default FollowButton;
