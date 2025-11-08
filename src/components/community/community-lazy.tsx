// src/components/community/community-lazy.tsx
"use client";

import React, { useMemo } from "react";
import CommunityPostRow from "@/components/community/postrow";
import { CommunityEmptyState } from "@/components/community/empty-state";
import { CommunityPost } from "@/components/community/types";

interface CommunityLazyProps {
  allPosts: CommunityPost[];
  isLoading: boolean;
  currentAddress?: string;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (data: { postId: string; title: string; content: string }) => Promise<void>;
  error?: string | null;
}

export function CommunityLazy({
  allPosts,
  isLoading,
  currentAddress,
  onLike,
  onDelete,
  onEdit,
  error,
}: CommunityLazyProps) {
  // Memoized posts to prevent unnecessary recalculations
  const transformedPosts = useMemo(() => allPosts, [allPosts]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-4 max-sm:p-3 max-sm:rounded-md">
        <p className="text-sm text-red-300 max-sm:text-xs">{error}</p>
      </div>
    );
  }

  if (transformedPosts.length === 0 && !isLoading) {
    return <CommunityEmptyState category="All Topics" />;
  }

  return (
    <div className="flex flex-col gap-4 max-sm:gap-3 max-sm:w-full max-sm:overflow-hidden">
      {transformedPosts.map((post) => (
        <CommunityPostRow
          key={post.id}
          post={post}
          currentAddress={currentAddress}
          onLike={() => onLike(post.id)}
          onDelete={() => onDelete(post.id)}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
