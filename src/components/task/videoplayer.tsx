"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  isLocked?: boolean;
  price?: {
    amount: number;
    currency: string;
  };
  points?: number;
  onUnlock?: () => void;
  unlockButtonElement?: React.ReactNode;
}

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  isLocked = false,
  price,
  points,
  onUnlock,
  unlockButtonElement,
}: VideoPlayerProps) {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [countdown, setCountdown] = useState(15);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const stopPreview = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPreviewPlaying(false);
    setShowOverlay(true);
    setCountdown(15);
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const handlePreviewClick = () => {
    if (!isLocked || !videoRef.current) return;

    setIsPreviewPlaying(true);
    setShowOverlay(false);
    setCountdown(15);
    
    videoRef.current.currentTime = 0;
    videoRef.current.play();

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Stop after 15 seconds
    previewTimeoutRef.current = setTimeout(() => {
      stopPreview();
    }, 15000);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    if (isPreviewPlaying) {
      e.preventDefault();
      e.stopPropagation();
      stopPreview();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !isLocked) return;
    
    // Force stop at 15 seconds if user seeks forward
    if (videoRef.current.currentTime >= 15) {
      stopPreview();
    }
  };

  return (
    <div 
      className="relative w-full aspect-video bg-neutral-900 rounded-lg overflow-hidden"
    >
      {/* Video atau Thumbnail */}
      {isLocked ? (
        <div className="relative w-full h-full">
          {/* Video for preview */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            playsInline
            poster={thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
            onContextMenu={(e) => e.preventDefault()}
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
          />
          
          {/* Overlay gelap */}
          <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
          
          {/* Click layer for pausing preview - Only active when preview is playing */}
          {isPreviewPlaying && (
            <div 
              className="absolute inset-0 z-[15] cursor-pointer"
              onClick={handleVideoClick}
            />
          )}
          
          {/* Lock overlay */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-10 transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="bg-neutral-800/80 p-4 rounded-full">
              <svg 
                className="w-8 h-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <div className="text-center px-4 pointer-events-auto">
              <h3 className="text-xl font-bold mb-2">Video Locked</h3>
              {price && (
                <div className="space-y-2 text-neutral-200 mb-4">
                  <p>Purchase this video to access exclusive content and earn rewards</p>
                </div>
              )}
              
              {unlockButtonElement || (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Default unlock button clicked');
                    onUnlock?.();
                  }}
                  className="mt-4 px-8 py-3 bg-[var(--primary-500)] text-white rounded-full font-semibold hover:bg-violet-600 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-violet-500/50 flex items-center justify-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Purchase Now</span>
                  {price && (
                    <span className="text-sm font-medium opacity-90">
                      {price.amount} {price.currency}
                    </span>
                  )}
                </button>
              )}

              {/* Preview Button - Show below purchase button when not playing */}
              {!isPreviewPlaying && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePreviewClick();
                  }}
                  className="mt-3 px-6 py-2 bg-neutral-800/90 hover:bg-neutral-700/90 text-white rounded-full font-medium transition-colors duration-200 backdrop-blur-sm flex items-center justify-center gap-2 mx-auto group"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  <span className="text-sm">Preview 15s</span>
                </button>
              )}
            </div>
          </div>

          {/* Preview indicator - Only show when video is actually playing */}
          {isPreviewPlaying && !showOverlay && (
            <div className="absolute bottom-4 left-4 z-20">
              <div className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 text-white backdrop-blur-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                <span className="text-sm font-medium">Preview</span>
              </div>
            </div>
          )}

          {/* Countdown Timer - Show when preview is playing */}
          {isPreviewPlaying && countdown > 0 && (
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/70 text-white rounded-lg backdrop-blur-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold tabular-nums">{countdown}s</span>
            </div>
          )}
        </div>
      ) : (
        <video
          src={videoUrl}
          className="w-full h-full"
          controls
          controlsList="nodownload"
          disablePictureInPicture={false}
          playsInline
          poster={thumbnailUrl}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}


    </div>
  );
}