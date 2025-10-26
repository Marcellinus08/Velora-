import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function SubscriptionErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="group relative rounded-xl border border-dashed border-red-500/40 bg-gradient-to-br from-red-900/20 via-neutral-900/50 to-orange-800/30 p-4 hover:border-red-400/60 transition-all duration-300 overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-h-[64px]">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-28 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/15 to-orange-600/20 ring-1 ring-red-500/30 shadow-lg shadow-red-500/10 group-hover:shadow-red-500/20 transition-all duration-300">
            <AlertTriangle className="h-8 w-8 text-red-300 group-hover:text-red-200 transition-colors duration-300 group-hover:animate-pulse" />
            {/* Error indicator */}
            <div className="absolute top-2 right-2 h-2 w-2 bg-red-400 rounded-full animate-ping" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-neutral-50 group-hover:text-white transition-colors duration-200">Something went wrong</h3>
            <p className="text-sm text-red-300 group-hover:text-red-200 transition-colors duration-200 line-clamp-2">{error}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="group/btn relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-orange-700 border border-transparent rounded-lg hover:from-red-500 hover:to-orange-600 focus:outline-none shadow-md hover:shadow-lg hover:shadow-red-500/20 transform hover:scale-[1.02] transition-all duration-200 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              <RefreshCw className="h-4 w-4 mr-2 relative z-10 group-hover/btn:rotate-180 transition-transform duration-500" />
              <span className="relative z-10">Try Again</span>
            </button>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-neutral-300 bg-neutral-800/50 border border-neutral-600/50 rounded-lg hover:bg-neutral-700/70 hover:text-white hover:border-neutral-500 focus:outline-none transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}