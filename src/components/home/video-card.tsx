"use client";

import { useState, useRef, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AbstractProfile } from "@/components/abstract-profile";
import { BuyVideoButton } from "@/components/payments/TreasuryButtons";

/* Avatar component with error handling */
function CreatorAvatar({ 
  avatarSrc, 
  address 
}: { 
  avatarSrc: string; 
  address?: string;
}) {
  const [imgError, setImgError] = useState(false);
  
  if (!avatarSrc || imgError) {
    return address ? (
      <AbstractProfile address={address as `0x${string}`} size="xs" showTooltip={false} className="!h-6 !w-6" />
    ) : (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-500" fill="currentColor" aria-hidden="true">
        <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
      </svg>
    );
  }
  
  return (
    <Image
      src={avatarSrc}
      alt="Avatar"
      width={24}
      height={24}
      className="h-full w-full object-cover"
      loading="lazy"
      quality={75}
      onError={() => {
        console.warn(`Failed to load creator avatar: ${avatarSrc}`);
        setImgError(true);
      }}
    />
  );
}

interface VideoCardProps {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  videoUrl?: string | null;
  totalPoints: number;
  isOwned: boolean;
  isCreator: boolean;
  creatorAvatar: string;
  creatorName: string;
  creatorAddress?: string;
  priceText: string;
  priceUsd: number;
  canBuy: boolean;
}

export const VideoCard = memo(function VideoCard({
  videoId,
  title,
  thumbnailUrl,
  videoUrl,
  totalPoints,
  isOwned,
  isCreator,
  creatorAvatar,
  creatorName,
  creatorAddress,
  priceText,
  priceUsd,
  canBuy,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle hover start
  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // Delay showing video by 500ms to avoid accidental hovers
    hoverTimerRef.current = setTimeout(() => {
      if (videoUrl) {
        setShowVideo(true);
      }
    }, 500);
  };

  // Handle hover end
  const handleMouseLeave = () => {
    setIsHovered(false);
    
    // Clear timers
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Stop and reset video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    setShowVideo(false);
    setCountdown(10);
  };

  // Handle video play and auto-stop after 10 seconds
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCountdown(10);
      
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Video started playing, set 10 second timer
            playTimerRef.current = setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
              }
              setShowVideo(false);
              setCountdown(10);
            }, 10000); // 10 seconds

            // Start countdown interval
            countdownIntervalRef.current = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          })
          .catch((error) => {
            console.warn("Video autoplay failed:", error);
          });
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [showVideo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const bg = thumbnailUrl || "/placeholder-thumb.png";

  return (
    <div
      className="group flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 transition-all duration-300 hover:shadow-lg hover:border-neutral-700 hover:scale-[1.01] transform mobile-video-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Elegant Thumbnail */}
      <div className="relative w-full overflow-hidden rounded-t-xl">
        {/* Points badge - simple and clean - Show for everyone including creator */}
        {totalPoints > 0 && (
          <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/85 px-2.5 py-1 text-xs font-semibold text-neutral-100 backdrop-blur">
            <span
              className="material-icons-round text-yellow-400 align-middle"
              style={{ fontSize: "16px" }}
              aria-hidden="true"
            >
              star
            </span>
            <span>{totalPoints}</span>
          </div>
        )}

        {/* Simple owned indicator */}
        {isOwned && (
          <div className="absolute right-2 top-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--primary-500)] text-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <div className="aspect-video w-full overflow-hidden bg-neutral-800 relative">
          {/* Thumbnail Image */}
          <Image
            src={bg}
            alt={title}
            width={640}
            height={360}
            className={`h-full w-full object-cover transition-all duration-300 ${
              showVideo ? "opacity-0" : "opacity-100 group-hover:scale-105"
            }`}
            loading="lazy"
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
          />
          
          {/* Video Preview */}
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                showVideo ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              muted
              playsInline
              preload="metadata"
            />
          )}
          
          {/* Preview indicator when hovering */}
          {isHovered && videoUrl && (
            <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Preview</span>
              </div>
              
              {showVideo && countdown > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{countdown}s</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clean Info Section */}
      <div className="flex flex-1 flex-col gap-2 p-3 pb-4">
        <h3 className="text-base font-semibold leading-snug text-neutral-50 group-hover:text-[var(--primary-500)] transition-colors duration-200 mobile-video-card-title">
          {title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-neutral-400 mobile-video-card-author">
          <div className="h-6 w-6 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
            <CreatorAvatar avatarSrc={creatorAvatar} address={creatorAddress} />
          </div>
          <span>{creatorName}</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <p className={`text-base font-bold mobile-video-card-price ${isOwned || isCreator ? "text-violet-300" : "text-neutral-50"}`}>
            {isCreator ? "Your Video" : isOwned ? "Owned" : priceText}
          </p>

          {/* Simple Action Buttons */}
          {isCreator || isOwned ? (
            <Link href={`/video?id=${videoId}`} prefetch={false} className="relative z-10">
              <button
                type="button"
                className="group relative inline-flex items-center gap-2 rounded-full bg-neutral-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-neutral-600 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-neutral-900 cursor-pointer mobile-video-card-button"
                title="Watch this video"
              >
                <span className="material-icons-round text-[16px]" aria-hidden>
                  play_arrow
                </span>
                Watch
              </button>
            </Link>
          ) : canBuy ? (
            <div className="relative z-10">
              <BuyVideoButton
                videoId={videoId}
                creator={creatorAddress as `0x${string}`}
                priceUsd={priceUsd}
                className="group relative inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-purple-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 focus-visible:ring-offset-neutral-900 cursor-pointer mobile-video-card-button"
              >
                Buy
              </BuyVideoButton>
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-full bg-neutral-700 px-4 py-2 text-sm font-semibold text-white opacity-60 cursor-not-allowed mobile-video-card-button"
              title={priceUsd <= 0 ? "Free video" : "Invalid creator address"}
            >
              {priceUsd <= 0 ? "Free" : "Buy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
