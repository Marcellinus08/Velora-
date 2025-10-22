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
      <div className="flex flex-col items-center gap-2">
        <span className="material-icons-round text-2xl text-white">lock</span>
        {price && (
          <span className="text-sm font-medium text-white">
            {price.amount} {price.currency}
          </span>
        )}
      </div>
    </div>
  );
}