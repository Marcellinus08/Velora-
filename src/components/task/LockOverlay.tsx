// src/components/task/LockOverlay.tsx
import React from 'react';

type Props = {
  price?: {
    amount: number;
    currency: string;
  };
};

export function LockOverlay({ price }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 transition-colors group-hover:bg-black/70">
      <div className="flex flex-col items-center gap-1">
        <svg 
          className="w-5 h-5 text-white" 
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
        {price && (
          <span className="text-[11px] font-medium text-white bg-black/40 px-2 py-0.5 rounded-full">
            {price.amount} {price.currency}
          </span>
        )}
      </div>
    </div>
  );
}