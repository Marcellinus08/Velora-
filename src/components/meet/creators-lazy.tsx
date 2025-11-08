// src/components/meet/creators-lazy.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MeetCard } from "./MeetCard";
import { MeetEmptyState } from "./empty-state";
import { MeetCreatorsGridSkeleton } from "@/components/skeletons/meet-skeleton";

interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  pricing: { voice?: number; video?: number };
}

interface CreatorsLazyProps {
  allCreators: Creator[];
  isLoading: boolean;
  onCreatorSelect: (creator: Creator) => void;
}

const ITEMS_PER_PAGE = 9; // Show 9 creators per batch (3x3 grid)

/**
 * CreatorsLazy
 * Implements infinite scroll lazy loading untuk meet creators list
 * 
 * Features:
 * - Initial load: First 9 creators
 * - Auto-load: Next 9 ketika user scroll ke bottom
 * - Skeleton: Beautiful loading indicator saat fetching batch
 * - Infinite scroll: Automatic batch loading via Intersection Observer
 * - Responsive grid: Adapts ke desktop/tablet/mobile
 * 
 * @param allCreators - Complete list of all creators
 * @param isLoading - Initial loading state (dari parent)
 * @param onCreatorSelect - Callback when creator is selected
 */
export function CreatorsLazy({
  allCreators,
  isLoading: initialLoading,
  onCreatorSelect,
}: CreatorsLazyProps) {
  const [displayedCreators, setDisplayedCreators] = useState<Creator[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initialize dengan initial data
  useEffect(() => {
    if (!initialLoading && allCreators.length > 0) {
      const firstBatch = allCreators.slice(0, ITEMS_PER_PAGE);
      setDisplayedCreators(firstBatch);
      setPage(1);
      setHasMore(allCreators.length > ITEMS_PER_PAGE);
    } else if (!initialLoading && allCreators.length === 0) {
      setHasMore(false);
    }
  }, [allCreators, initialLoading]);

  // Load more creators
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || displayedCreators.length === 0) return;

    setIsLoadingMore(true);
    // Simulate network delay
    setTimeout(() => {
      const nextPage = page + 1;
      const startIdx = displayedCreators.length;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      const nextBatch = allCreators.slice(startIdx, endIdx);

      if (nextBatch.length > 0) {
        setDisplayedCreators((prev) => [...prev, ...nextBatch]);
        setPage(nextPage);
        setHasMore(endIdx < allCreators.length);
      } else {
        setHasMore(false);
      }
      setIsLoadingMore(false);
    }, 300);
  }, [displayedCreators.length, page, hasMore, isLoadingMore, allCreators]);

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadMore, hasMore, isLoadingMore]);

  return (
    <>
      {initialLoading ? (
        <MeetCreatorsGridSkeleton count={9} />
      ) : displayedCreators.length === 0 ? (
        <MeetEmptyState type="creators" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {displayedCreators.map((c) => (
              <MeetCard key={c.id} creator={c} onCall={() => onCreatorSelect(c)} />
            ))}
          </div>

          {/* Loading indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce delay-100" />
                <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce delay-200" />
                <span className="ml-2 text-sm text-neutral-400">Loading more creators...</span>
              </div>
            </div>
          )}

          {/* Sentinel element untuk Intersection Observer */}
          <div ref={sentinelRef} className="h-4" />

          {/* End of list message */}
          {!hasMore && displayedCreators.length > 0 && (
            <div className="flex justify-center py-8">
              <span className="text-sm text-neutral-500">You've reached the end</span>
            </div>
          )}
        </>
      )}
    </>
  );
}
