import React from "react";
import Link from "next/link";
import { PlayCircle, CheckCircle2, ShoppingCart, BookOpen } from "lucide-react";

interface EmptyStateProps {
  type: "available" | "completed";
}

export function SubscriptionEmptyState({ type }: EmptyStateProps) {
  const configs = {
    available: {
      icon: ShoppingCart,
      title: "No Videos Purchased Yet",
      description: "Discover amazing content to start your learning journey",
      buttonText: "Explore Videos",
      buttonLink: "/",
      buttonIcon: PlayCircle,
      gradient: "from-violet-900/20 via-neutral-900/50 to-neutral-800/30",
      borderColor: "border-violet-500/40 hover:border-violet-400/60",
      iconGradient: "from-violet-500/15 to-violet-600/20",
      ringColor: "ring-violet-500/30",
      shadowColor: "shadow-violet-500/10 group-hover:shadow-violet-500/20",
      buttonGradient: "from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600",
      buttonShadow: "hover:shadow-violet-500/20",
      iconColor: "text-violet-300 group-hover:text-violet-200",
      glowColor: "from-violet-500/5 via-transparent to-violet-400/5",
      pulseColor: "bg-violet-400"
    },
    completed: {
      icon: CheckCircle2,
      title: "No Completed Videos Yet",
      description: "Complete tasks inside your purchased videos and share your progress to unlock achievements and move them here",
      buttonText: "Leaderboard",
      buttonLink: "/leaderboard",
      buttonIcon: BookOpen,
      gradient: "from-violet-900/20 via-neutral-900/50 to-neutral-800/30",
      borderColor: "border-violet-500/40 hover:border-violet-400/60",
      iconGradient: "from-violet-500/15 to-violet-600/20",
      ringColor: "ring-violet-500/30",
      shadowColor: "shadow-violet-500/10 group-hover:shadow-violet-500/20",
      buttonGradient: "from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600",
      buttonShadow: "hover:shadow-violet-500/20",
      iconColor: "text-violet-300 group-hover:text-violet-200",
      glowColor: "from-violet-500/5 via-transparent to-violet-400/5",
      pulseColor: "bg-violet-400"
    }
  };

  const config = configs[type];
  const Icon = config.icon;
  const ButtonIcon = config.buttonIcon;

  return (
    <div className={`group relative rounded-xl sm:rounded-2xl border border-dashed ${config.borderColor} bg-gradient-to-br ${config.gradient} p-4 sm:p-5 transition-all duration-700 hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] overflow-hidden cursor-pointer`}>
      {/* Dynamic background with moving gradients */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <div className={`absolute inset-0 bg-gradient-to-r ${config.glowColor} animate-pulse`} />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent transform rotate-45 animate-pulse group-hover:via-white/15 transition-all duration-500" style={{ animationDuration: '4s' }} />
      </div>
      
      {/* Floating orbs background - Smaller on mobile */}
      <div className="absolute inset-0 overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <div className={`absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 ${config.pulseColor} rounded-full blur-xl animate-pulse group-hover:scale-125 transition-all duration-700`} style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className={`absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 ${config.pulseColor} rounded-full blur-lg animate-pulse group-hover:scale-110 transition-all duration-700`} style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className={`absolute top-1/3 right-1/3 w-6 h-6 sm:w-8 sm:h-8 ${config.pulseColor} rounded-full blur-md animate-pulse group-hover:scale-150 transition-all duration-700`} style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
      </div>

      {/* Main content container */}
      <div className="relative flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between min-h-[80px] z-10">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          {/* Enhanced icon container - Smaller on mobile */}
          <div className="relative animate-bounce group-hover:animate-none group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000 flex-shrink-0" style={{ animationDuration: '2.5s' }}>
            <div className={`relative flex h-16 w-16 sm:h-18 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${config.iconGradient} ring-2 ${config.ringColor} shadow-lg ${config.shadowColor} transition-all duration-700 group-hover:shadow-[0_0_30px_currentColor] group-hover:ring-4`}>
              <Icon className={`h-7 w-7 sm:h-9 sm:w-9 ${config.iconColor} transition-all duration-700 animate-pulse group-hover:animate-none group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_currentColor]`} />
              
              {/* Animated indicators */}
              {type === "available" ? (
                <div className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-2 w-2 sm:h-2.5 sm:w-2.5 ${config.pulseColor} rounded-full animate-pulse opacity-70 group-hover:animate-ping transition-all duration-300`} />
              ) : (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 h-1 bg-purple-500/20 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-purple-400 rounded-full group-hover:w-full transition-all duration-1000 ease-out" />
                </div>
              )}
              
              {/* Rotating ring effects */}
              <div className={`absolute -inset-2 sm:-inset-3 rounded-xl sm:rounded-2xl border-2 border-dashed ${config.ringColor} opacity-30 animate-spin group-hover:opacity-60 group-hover:border-4 transition-all duration-500`} style={{ animationDuration: '4s' }} />
              <div className={`absolute -inset-3 sm:-inset-5 rounded-xl sm:rounded-2xl border ${config.ringColor} opacity-15 animate-ping group-hover:opacity-40 transition-all duration-500`} style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Enhanced text content */}
          <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
            <h3 className={`text-base sm:text-lg font-bold ${config.iconColor.split(' ')[0]} group-hover:text-white transition-all duration-500 transform group-hover:scale-105 animate-pulse group-hover:animate-none group-hover:drop-shadow-lg`}>
              {config.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-200 transition-all duration-500 max-w-[280px] sm:max-w-none leading-relaxed group-hover:scale-105">
              {config.description}
            </p>
          </div>
        </div>

        {/* Enhanced button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href={config.buttonLink} className="w-full sm:w-auto">
            <button className={`group/btn w-full sm:w-auto relative inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r ${config.buttonGradient} border border-transparent rounded-lg sm:rounded-xl focus:outline-none shadow-lg hover:shadow-xl ${config.buttonShadow} transform hover:scale-105 transition-all duration-300 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              <ButtonIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 relative z-10 group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-transform duration-300" />
              <span className="relative z-10">{config.buttonText}</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Enhanced corner decorations - Smaller on mobile */}
      <div className={`absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-bl ${config.iconGradient} opacity-20 rounded-full blur-sm animate-pulse group-hover:opacity-40 group-hover:scale-125 group-hover:animate-spin transition-all duration-700`} />
      <div className={`absolute -bottom-1.5 -left-1.5 sm:-bottom-2 sm:-left-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr ${config.iconGradient} opacity-15 rounded-full blur-sm animate-pulse group-hover:opacity-30 group-hover:scale-110 transition-all duration-700`} style={{ animationDelay: '1s' }} />
      
      {/* Shimmer edge effect */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-20 group-hover:opacity-60 pointer-events-none transition-opacity duration-500">
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse group-hover:via-white/20 transition-all duration-500" style={{ animationDuration: '4s' }} />
      </div>

      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 ${config.ringColor} animate-ping`} />
        <div className={`absolute inset-4 rounded-xl sm:rounded-2xl border ${config.ringColor} animate-ping`} style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}