// src/components/community/community-lazy.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import CommunityPostRow from "@/components/community/postrow";
import { CommunityPagination } from "@/components/community/community-pagination";
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

const ITEMS_PER_PAGE_DEFAULT = 10;

export function CommunityLazy({
  allPosts,
  isLoading,
  currentAddress,
  onLike,
  onDelete,
  onEdit,
  error,
}: CommunityLazyProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);

  // Memoized posts to prevent unnecessary recalculations
  const transformedPosts = useMemo(() => allPosts, [allPosts]);

  // Calculate pagination
  const totalPages = Math.ceil(transformedPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = transformedPosts.slice(startIndex, endIndex);

  // Reset ke halaman 1 ketika data atau items per page berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [transformedPosts.length, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of posts
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-4">
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (paginatedPosts.length === 0 && !isLoading) {
    return <CommunityEmptyState category="All Topics" />;
  }

  return (
    <div className="space-y-4">
      {/* Posts */}
      <div className="flex flex-col gap-4">
        {paginatedPosts.map((post) => (
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

      {/* Pagination Controls */}
      {transformedPosts.length > ITEMS_PER_PAGE_DEFAULT && (
        <CommunityPagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={transformedPosts.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
}
