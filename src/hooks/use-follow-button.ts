// src/hooks/use-follow-button.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";

interface UseFollowButtonResult {
  isFollowing: boolean;
  isLoading: boolean;
  isSelf: boolean;
  handleFollow: () => Promise<void>;
}

export function useFollowButton(targetAddress?: string | null): UseFollowButtonResult {
  const { address: myAddress } = useAccount();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const myAddr = myAddress?.toLowerCase();
  const targetAddr = targetAddress?.toLowerCase();
  const isSelf = !!myAddr && !!targetAddr && myAddr === targetAddr;

  console.log("[Follow Button Hook] Init:", { myAddr, targetAddr, isSelf });

  // Check follow status on mount and when addresses change
  useEffect(() => {
    if (!myAddr || !targetAddr || isSelf) {
      console.log("[Follow Button Hook] Skipping check:", { myAddr, targetAddr, isSelf });
      setIsChecking(false);
      setIsFollowing(false);
      return;
    }

    let active = true;

    async function checkFollowStatus() {
      try {
        console.log("[Follow Button Hook] Checking follow status:", { myAddr, targetAddr });
        // Add timestamp to prevent caching
        const res = await fetch(`/api/profiles/follow/check?follower=${myAddr}&followee=${targetAddr}&t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (!res.ok) {
          console.error("[Follow Button Hook] Check failed:", res.status);
          const errorData = await res.json().catch(() => ({}));
          console.error("[Follow Button Hook] Error data:", errorData);
          return;
        }
        const data = await res.json();
        console.log("[Follow Button Hook] Check result:", data);
        if (active) {
          setIsFollowing(data.isFollowing || false);
        }
      } catch (error) {
        console.error("[Follow Button Hook] Error checking follow status:", error);
      } finally {
        if (active) {
          setIsChecking(false);
        }
      }
    }

    setIsChecking(true);
    checkFollowStatus();

    return () => {
      active = false;
    };
  }, [myAddr, targetAddr, isSelf]);

  const handleFollow = useCallback(async () => {
    if (!myAddr || !targetAddr || isSelf || isLoading) {
      console.warn("[Follow Button] Cannot follow:", { myAddr, targetAddr, isSelf, isLoading });
      if (!myAddr) {
        alert("Please connect your wallet to follow users");
      }
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        console.log("[Follow Button] Unfollowing:", { myAddr, targetAddr });
        const res = await fetch("/api/profiles/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            follower_addr: myAddr,
            followee_addr: targetAddr,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("[Follow Button] Unfollow failed:", res.status, errorData);
          throw new Error(errorData.error || "Failed to unfollow");
        }

        console.log("[Follow Button] Unfollowed successfully");
        setIsFollowing(false);
      } else {
        // Follow
        console.log("[Follow Button] Following:", { myAddr, targetAddr });
        const res = await fetch("/api/profiles/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            follower_addr: myAddr,
            followee_addr: targetAddr,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("[Follow Button] Follow failed:", res.status, errorData);
          throw new Error(errorData.error || "Failed to follow");
        }

        console.log("[Follow Button] Followed successfully");
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("[Follow Button] Error toggling follow:", error);
      alert(error instanceof Error ? error.message : "Failed to follow");
    } finally {
      setIsLoading(false);
    }
  }, [myAddr, targetAddr, isSelf, isLoading, isFollowing]);

  return {
    isFollowing,
    isLoading: isLoading || isChecking,
    isSelf,
    handleFollow,
  };
}
