import React from "react";
import { Wallet, Shield, Play } from "lucide-react";
import { ConnectWalletButton } from "@/components/connect-wallet-button";

export function ConnectWalletPrompt() {
  return (
    <div className="group relative rounded-2xl border border-dashed border-violet-500/40 bg-gradient-to-br from-violet-900/20 via-neutral-900/50 to-neutral-800/30 p-5 transition-all duration-700 hover:-translate-y-2 hover:scale-[1.01] overflow-hidden cursor-pointer max-sm:p-3 max-sm:rounded-xl">
      {/* Dynamic background with moving gradients */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-400/5 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent transform rotate-45 animate-pulse group-hover:via-white/15 transition-all duration-500" style={{ animationDuration: '4s' }} />
      </div>
      
      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-violet-400 rounded-full blur-xl animate-pulse group-hover:scale-125 transition-all duration-700" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-violet-400 rounded-full blur-lg animate-pulse group-hover:scale-110 transition-all duration-700" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-violet-400 rounded-full blur-md animate-pulse group-hover:scale-150 transition-all duration-700" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
      </div>

      {/* Main content container */}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-h-[80px] z-10 max-sm:gap-3 max-sm:min-h-[60px]">
        <div className="flex items-center gap-4 max-sm:gap-3">
          {/* Enhanced icon container */}
          <div className="relative animate-bounce group-hover:animate-none group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000" style={{ animationDuration: '2.5s' }}>
            <div className="relative flex h-18 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-violet-600/20 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/10 transition-all duration-700 group-hover:shadow-[0_0_30px_currentColor] group-hover:ring-4 max-sm:h-14 max-sm:w-16 max-sm:rounded-xl">
              <Wallet className="h-9 w-9 text-violet-300 transition-all duration-700 animate-pulse group-hover:animate-none group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_currentColor] max-sm:h-7 max-sm:w-7" />
              
              {/* Animated connection indicators */}
              <div className="absolute top-2 right-2 h-2.5 w-2.5 bg-violet-400 rounded-full animate-pulse opacity-70 group-hover:animate-ping transition-all duration-300" />
              
              {/* Rotating ring effects */}
              <div className="absolute -inset-3 rounded-2xl border-2 border-dashed border-violet-500/30 opacity-30 animate-spin group-hover:opacity-60 group-hover:border-4 transition-all duration-500" style={{ animationDuration: '4s' }} />
              <div className="absolute -inset-5 rounded-2xl border border-violet-500/30 opacity-15 animate-ping group-hover:opacity-40 transition-all duration-500" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Enhanced text content */}
          <div className="space-y-2 max-sm:space-y-1">
            <h3 className="text-lg font-bold text-violet-300 group-hover:text-white transition-all duration-500 transform group-hover:scale-105 animate-pulse group-hover:animate-none group-hover:drop-shadow-lg max-sm:text-base">
              Login Required
            </h3>
            <p className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-all duration-500 max-w-[280px] leading-relaxed group-hover:scale-105 max-sm:text-xs max-sm:max-w-[200px]">
              You need to login first to access your subscription management and personalized features
            </p>
            
            {/* Feature indicators with enhanced animations */}
            <div className="flex items-center gap-4 pt-1 max-sm:gap-2">
              <div className="flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-300 max-sm:gap-1">
                <Shield className="h-3 w-3 text-green-400 animate-pulse max-sm:h-2.5 max-sm:w-2.5" />
                <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 max-sm:text-[10px]">Secure</span>
              </div>
              <div className="flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-300 max-sm:gap-1" style={{ transitionDelay: '100ms' }}>
                <Play className="h-3 w-3 text-purple-400 animate-pulse max-sm:h-2.5 max-sm:w-2.5" style={{ animationDelay: '0.5s' }} />
                <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 max-sm:text-[10px]">Instant</span>
              </div>
              <div className="flex items-center gap-1.5 group-hover:scale-105 transition-transform duration-300 max-sm:gap-1" style={{ transitionDelay: '200ms' }}>
                <Wallet className="h-3 w-3 text-blue-400 animate-pulse max-sm:h-2.5 max-sm:w-2.5" style={{ animationDelay: '1s' }} />
                <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 max-sm:text-[10px]">Web3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced corner decorations */}
      <div className="absolute -top-2 -right-2 w-14 h-14 bg-gradient-to-bl from-blue-500/15 to-cyan-600/20 opacity-20 rounded-full blur-sm animate-pulse group-hover:opacity-40 group-hover:scale-125 group-hover:animate-spin transition-all duration-700" />
      <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-tr from-blue-500/15 to-cyan-600/20 opacity-15 rounded-full blur-sm animate-pulse group-hover:opacity-30 group-hover:scale-110 transition-all duration-700" style={{ animationDelay: '1s' }} />
      
      {/* Shimmer edge effect */}
      <div className="absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-60 pointer-events-none transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse group-hover:via-white/20 transition-all duration-500" style={{ animationDuration: '4s' }} />
      </div>

      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/30 animate-ping" />
        <div className="absolute inset-4 rounded-2xl border border-blue-500/30 animate-ping" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}