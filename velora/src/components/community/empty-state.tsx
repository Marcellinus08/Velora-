import React from "react";
import { 
  MessageSquare, 
  Users, 
  Heart, 
  TrendingUp, 
  Sparkles
} from "lucide-react";

interface CommunityEmptyStateProps {
  category: string;
}

export function CommunityEmptyState({ category }: CommunityEmptyStateProps) {
  const isAllTopics = category === "All Topics";
  
  const config = {
    icon: isAllTopics ? MessageSquare : TrendingUp,
    title: isAllTopics ? "No Posts Yet" : `No Posts in ${category}`,
    description: isAllTopics 
      ? "Community discussions will appear here once members start sharing" 
      : `No discussions found for ${category} category yet`,
    gradient: "from-indigo-900/20 via-neutral-900/50 to-neutral-800/30",
    borderColor: "border-indigo-500/40 hover:border-indigo-400/60",
    iconGradient: "from-indigo-500/15 to-indigo-600/20",
    ringColor: "ring-indigo-500/30",
    shadowColor: "shadow-indigo-500/10 group-hover:shadow-indigo-500/20",
    iconColor: "text-indigo-300 group-hover:text-indigo-200",
    glowColor: "from-indigo-500/5 via-transparent to-indigo-400/5",
    pulseColor: "bg-indigo-400"
  };

  const Icon = config.icon;

  return (
    <div className={`group relative rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.gradient} p-8 transition-all duration-700 hover:-translate-y-2 hover:scale-[1.01] overflow-hidden cursor-pointer`}>
      {/* Dynamic background with moving gradients */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <div className={`absolute inset-0 bg-gradient-to-r ${config.glowColor} animate-pulse`} />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent transform rotate-45 animate-pulse group-hover:via-white/15 transition-all duration-500" style={{ animationDuration: '4s' }} />
      </div>
      
      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <div className={`absolute -top-6 -right-6 w-20 h-20 ${config.pulseColor} rounded-full blur-xl animate-pulse group-hover:scale-125 transition-all duration-700`} style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className={`absolute -bottom-6 -left-6 w-16 h-16 ${config.pulseColor} rounded-full blur-lg animate-pulse group-hover:scale-110 transition-all duration-700`} style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className={`absolute top-1/3 left-1/4 w-12 h-12 ${config.pulseColor} rounded-full blur-md animate-pulse group-hover:scale-150 transition-all duration-700`} style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
      </div>

      {/* Main content container */}
      <div className="relative flex flex-col items-center justify-center text-center min-h-[200px] z-10">
        {/* Icon container with community-specific animations */}
        <div className="relative mb-8 animate-bounce group-hover:animate-none group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000" style={{ animationDuration: '2.5s' }}>
          <div className={`relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${config.iconGradient} ring-2 ${config.ringColor} shadow-2xl transition-all duration-700 group-hover:shadow-[0_0_40px_currentColor] group-hover:ring-4`}>
            <Icon className={`h-12 w-12 ${config.iconColor} transition-all duration-700 animate-pulse group-hover:animate-none group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_currentColor]`} />
            
            {/* Community-specific floating elements */}
            <div className="absolute -inset-6 opacity-0 group-hover:opacity-80 transition-opacity duration-700">
              {/* Heart icons floating around */}
              <Heart className="absolute -top-2 -right-2 h-4 w-4 text-pink-300 animate-ping" style={{ animationDelay: '0s' }} />
              <Users className="absolute -bottom-2 -left-2 h-4 w-4 text-blue-300 animate-ping" style={{ animationDelay: '0.3s' }} />
              <Sparkles className="absolute -top-2 -left-2 h-4 w-4 text-yellow-300 animate-ping" style={{ animationDelay: '0.6s' }} />
              <TrendingUp className="absolute -bottom-2 -right-2 h-4 w-4 text-green-300 animate-ping" style={{ animationDelay: '0.9s' }} />
            </div>

            {/* Rotating ring effects */}
            <div className={`absolute -inset-4 rounded-full border-2 border-dashed ${config.ringColor} opacity-30 animate-spin group-hover:opacity-70 group-hover:border-4 transition-all duration-500`} style={{ animationDuration: '4s' }} />
            <div className={`absolute -inset-8 rounded-full border ${config.ringColor} opacity-15 animate-ping group-hover:opacity-40 transition-all duration-500`} style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Enhanced title */}
        <h3 className={`mb-4 text-2xl font-black ${config.iconColor.split(' ')[0]} transition-all duration-500 transform relative animate-pulse group-hover:animate-none group-hover:text-white group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_currentColor]`}>
          {config.title}
          <div className="absolute inset-0 blur-sm opacity-20 group-hover:opacity-60 transition-all duration-500">{config.title}</div>
        </h3>
        
        {/* Description */}
        <p className="text-base text-neutral-300 group-hover:text-neutral-100 transition-all duration-500 max-w-[300px] leading-relaxed mb-8 group-hover:scale-105">
          {config.description}
        </p>

        {/* Interactive stats indicators */}
        <div className="mt-8 flex items-center gap-6">
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
            <div className="h-2 w-2 bg-pink-400 rounded-full animate-pulse" />
            <span className="text-xs text-neutral-400 group-hover:text-neutral-300">0 Likes</span>
          </div>
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <span className="text-xs text-neutral-400 group-hover:text-neutral-300">0 Comments</span>
          </div>
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
            <span className="text-xs text-neutral-400 group-hover:text-neutral-300">0 Posts</span>
          </div>
        </div>
      </div>

      {/* Enhanced corner decorations */}
      <div className={`absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-bl ${config.iconGradient} opacity-20 rounded-full blur-sm animate-pulse group-hover:opacity-40 group-hover:scale-125 group-hover:animate-spin transition-all duration-700`} />
      <div className={`absolute -bottom-3 -left-3 w-16 h-16 bg-gradient-to-tr ${config.iconGradient} opacity-15 rounded-full blur-sm animate-pulse group-hover:opacity-30 group-hover:scale-110 transition-all duration-700`} style={{ animationDelay: '1s' }} />
      
      {/* Shimmer edge effect */}
      <div className="absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-60 pointer-events-none transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse group-hover:via-white/20 transition-all duration-500" style={{ animationDuration: '4s' }} />
      </div>

      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={`absolute inset-0 rounded-2xl border-2 ${config.ringColor} animate-ping`} />
        <div className={`absolute inset-6 rounded-2xl border ${config.ringColor} animate-ping`} style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}