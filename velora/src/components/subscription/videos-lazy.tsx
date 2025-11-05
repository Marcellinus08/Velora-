// src/components/subscription/videos-lazy.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SubscriptionVideoRow } from "./videorow";
import { SubscriptionEmptyState } from "./empty-state";
import { SubscriptionRowsGridSkeleton } from "@/components/skeletons/subscription-skeleton";

interface VideoItem {
  purchaseId: string;
  purchasedAt: string;
  buyer: string;
  priceUsd: number;
  currency: string;
  status: string | null;
  tasksDone: boolean;
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  durationSeconds?: number;
  thumbUrl?: string;
  videoUrl?: string;
  creator?: string | null;
}

interface SubscriptionVideosLazyProps {
  allAvailable: VideoItem[];
  allCompleted: VideoItem[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 6; // Show 6 items per batch untuk subscription

/**
 * SubscriptionVideosLazy
 * Implements infinite scroll lazy loading untuk subscription pages
 * 
 * Features:
 * - Initial load: First 6 videos untuk setiap section
 * - Auto-load: Next 6 ketika user scroll ke bottom
 * - Skeleton: Beautiful loading indicator saat fetching batch
 * - Infinite scroll: Automatic batch loading via Intersection Observer
 * 
 * @param allAvailable - Complete list of available subscription videos
 * @param allCompleted - Complete list of completed subscription videos
 * @param isLoading - Initial loading state (dari parent)
 */
export function SubscriptionVideosLazy({
  allAvailable,
  allCompleted,
  isLoading: initialLoading,
}: SubscriptionVideosLazyProps) {
  // Available videos state
  const [availableItems, setAvailableItems] = useState<VideoItem[]>([]);
  const [availablePage, setAvailablePage] = useState(0);
  const [availableHasMore, setAvailableHasMore] = useState(true);
  const [availableIsLoadingMore, setAvailableIsLoadingMore] = useState(false);
  const availableSentinelRef = useRef<HTMLDivElement>(null);

  // Completed videos state
  const [completedItems, setCompletedItems] = useState<VideoItem[]>([]);
  const [completedPage, setCompletedPage] = useState(0);
  const [completedHasMore, setCompletedHasMore] = useState(true);
  const [completedIsLoadingMore, setCompletedIsLoadingMore] = useState(false);
  const completedSentinelRef = useRef<HTMLDivElement>(null);

  // Initialize dengan initial data
  useEffect(() => {
    if (!initialLoading) {
      // Load first batch dari available
      if (allAvailable.length > 0) {
        const firstBatch = allAvailable.slice(0, ITEMS_PER_PAGE);
        setAvailableItems(firstBatch);
        setAvailablePage(1);
        setAvailableHasMore(allAvailable.length > ITEMS_PER_PAGE);
      } else {
        setAvailableHasMore(false);
      }

      // Load first batch dari completed
      if (allCompleted.length > 0) {
        const firstBatch = allCompleted.slice(0, ITEMS_PER_PAGE);
        setCompletedItems(firstBatch);
        setCompletedPage(1);
        setCompletedHasMore(allCompleted.length > ITEMS_PER_PAGE);
      } else {
        setCompletedHasMore(false);
      }
    }
  }, [allAvailable, allCompleted, initialLoading]);

  // Load more available videos
  const loadMoreAvailable = useCallback(() => {
    if (availableIsLoadingMore || !availableHasMore) return;

    setAvailableIsLoadingMore(true);
    // Simulate network delay
    setTimeout(() => {
      const nextPage = availablePage + 1;
      const startIdx = availableItems.length;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      const nextBatch = allAvailable.slice(startIdx, endIdx);

      if (nextBatch.length > 0) {
        setAvailableItems((prev) => [...prev, ...nextBatch]);
        setAvailablePage(nextPage);
        setAvailableHasMore(endIdx < allAvailable.length);
      } else {
        setAvailableHasMore(false);
      }
      setAvailableIsLoadingMore(false);
    }, 300);
  }, [availableItems.length, availablePage, availableHasMore, availableIsLoadingMore, allAvailable]);

  // Load more completed videos
  const loadMoreCompleted = useCallback(() => {
    if (completedIsLoadingMore || !completedHasMore) return;

    setCompletedIsLoadingMore(true);
    // Simulate network delay
    setTimeout(() => {
      const nextPage = completedPage + 1;
      const startIdx = completedItems.length;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      const nextBatch = allCompleted.slice(startIdx, endIdx);

      if (nextBatch.length > 0) {
        setCompletedItems((prev) => [...prev, ...nextBatch]);
        setCompletedPage(nextPage);
        setCompletedHasMore(endIdx < allCompleted.length);
      } else {
        setCompletedHasMore(false);
      }
      setCompletedIsLoadingMore(false);
    }, 300);
  }, [completedItems.length, completedPage, completedHasMore, completedIsLoadingMore, allCompleted]);

  // Intersection Observer untuk available
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && availableHasMore && !availableIsLoadingMore) {
          loadMoreAvailable();
        }
      },
      { threshold: 0.1 }
    );

    if (availableSentinelRef.current) {
      observer.observe(availableSentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadMoreAvailable, availableHasMore, availableIsLoadingMore]);

  // Intersection Observer untuk completed
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && completedHasMore && !completedIsLoadingMore) {
          loadMoreCompleted();
        }
      },
      { threshold: 0.1 }
    );

    if (completedSentinelRef.current) {
      observer.observe(completedSentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadMoreCompleted, completedHasMore, completedIsLoadingMore]);

  const fmtUSD = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      isFinite(n) ? n : 0
    );

  return (
    <div>
      {/* Available Videos Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-100">Available Videos</h3>
        {initialLoading ? (
          <SubscriptionRowsGridSkeleton count={3} />
        ) : availableItems.length === 0 ? (
          <SubscriptionEmptyState type="available" />
        ) : (
          <div className="space-y-4">
            {availableItems.map((v) => (
              <SubscriptionVideoRow
                key={v.purchaseId}
                videoId={v.id}
                title={v.title}
                thumb={v.thumbUrl || "/placeholder-thumb.png"}
                subtext={`Purchased • ${fmtUSD(v.priceUsd)}`}
                primaryAction={{ label: "Watch" }}
              />
            ))}
            {availableIsLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce delay-200" />
                  <span className="ml-2 text-sm text-neutral-400">Loading more videos...</span>
                </div>
              </div>
            )}
            {/* Sentinel element untuk Intersection Observer */}
            <div ref={availableSentinelRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Completed Videos Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-100">Completed Videos</h3>
        {initialLoading ? (
          <SubscriptionRowsGridSkeleton count={2} />
        ) : completedItems.length === 0 ? (
          <SubscriptionEmptyState type="completed" />
        ) : (
          <div className="space-y-4">
            {completedItems.map((v) => (
              <SubscriptionVideoRow
                key={v.purchaseId}
                videoId={v.id}
                title={v.title}
                thumb={v.thumbUrl || "/placeholder-thumb.png"}
                subtext={`Completed • ${fmtUSD(v.priceUsd)}`}
                primaryAction={{ label: "Rewatch", variant: "secondary" }}
              />
            ))}
            {completedIsLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce delay-200" />
                  <span className="ml-2 text-sm text-neutral-400">Loading more videos...</span>
                </div>
              </div>
            )}
            {/* Sentinel element untuk Intersection Observer */}
            <div ref={completedSentinelRef} className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
