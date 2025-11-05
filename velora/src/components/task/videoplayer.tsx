"use client";

import { useState } from 'react';
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
  return (
    <div 
      className="relative w-full aspect-video bg-neutral-900 rounded-lg overflow-hidden"
    >
      {/* Video atau Thumbnail */}
      {isLocked ? (
        <div className="relative w-full h-full">
          <Image
            src={thumbnailUrl}
            alt="Video thumbnail"
            fill
            className="object-cover filter blur-sm"
          />
          {/* Overlay gelap */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-10">
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
            </div>
          </div>
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