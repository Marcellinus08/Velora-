import React from "react";
import { 
  Users2, 
  Calendar, 
  Clock, 
  History, 
  ShoppingBag
} from "lucide-react";

interface MeetEmptyStateProps {
  type: "creators" | "upcoming" | "pending" | "history" | "orders";
}

export function MeetEmptyState({ type }: MeetEmptyStateProps) {
  const configs = {
    creators: {
      icon: Users2,
      title: "No Creators Available",
      description: "Discover amazing creators ready to connect with you",
      gradient: "from-blue-900/20 via-neutral-900/50 to-neutral-800/30",
      borderColor: "border-blue-500/40 hover:border-blue-400/60",
      iconGradient: "from-blue-500/15 to-blue-600/20",
      ringColor: "ring-blue-500/30",
      shadowColor: "shadow-blue-500/10 group-hover:shadow-blue-500/20",
      iconColor: "text-blue-300 group-hover:text-blue-200",
      glowColor: "from-blue-500/5 via-transparent to-blue-400/5",
      pulseColor: "bg-blue-400"
    },
    upcoming: {
      icon: Calendar,
      title: "No Upcoming Meetings",
      description: "Schedule meetings with your favorite creators to see them here",
      gradient: "from-emerald-900/20 via-neutral-900/50 to-neutral-800/30",
      borderColor: "border-emerald-500/40 hover:border-emerald-400/60",
      iconGradient: "from-emerald-500/15 to-emerald-600/20",
      ringColor: "ring-emerald-500/30",
      shadowColor: "shadow-emerald-500/10 group-hover:shadow-emerald-500/20",
      iconColor: "text-emerald-300 group-hover:text-emerald-200",
      glowColor: "from-emerald-500/5 via-transparent to-emerald-400/5",
      pulseColor: "bg-emerald-400"
    },
    pending: {
      icon: Clock,
      title: "No Pending Requests",
      description: "Your meeting requests will appear here once submitted",
      gradient: "from-amber-900/20 via-neutral-900/50 to-neutral-800/30",
      borderColor: "border-amber-500/40 hover:border-amber-400/60",
      iconGradient: "from-amber-500/15 to-amber-600/20",
      ringColor: "ring-amber-500/30",
      shadowColor: "shadow-amber-500/10 group-hover:shadow-amber-500/20",
      iconColor: "text-amber-300 group-hover:text-amber-200",
      glowColor: "from-amber-500/5 via-transparent to-amber-400/5",
      pulseColor: "bg-amber-400"
    },
    history: {
      icon: History,
      title: "No Meeting History",
      description: "Your completed meetings and call records will be saved here",
      gradient: "from-violet-900/20 via-neutral-900/50 to-neutral-800/30",
      borderColor: "border-violet-500/40 hover:border-violet-400/60",
      iconGradient: "from-violet-500/15 to-violet-600/20",
      ringColor: "ring-violet-500/30",
      shadowColor: "shadow-violet-500/10 group-hover:shadow-violet-500/20",
      iconColor: "text-violet-300 group-hover:text-violet-200",
      glowColor: "from-violet-500/5 via-transparent to-violet-400/5",
      pulseColor: "bg-violet-400"
    },
    orders: {
      icon: ShoppingBag,
      title: "No Orders Yet",
      description: "Your meeting purchases and transaction history will appear here",
      gradient: "from-rose-900/20 via-neutral-900/50 to-neutral-800/30",
      borderColor: "border-rose-500/40 hover:border-rose-400/60",
      iconGradient: "from-rose-500/15 to-rose-600/20",
      ringColor: "ring-rose-500/30",
      shadowColor: "shadow-rose-500/10 group-hover:shadow-rose-500/20",
      iconColor: "text-rose-300 group-hover:text-rose-200",
      glowColor: "from-rose-500/5 via-transparent to-rose-400/5",
      pulseColor: "bg-rose-400"
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`group relative rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.gradient} p-5 transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02] overflow-hidden cursor-pointer`}>
      {/* Dynamic background with moving gradients */}
      <div className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
        <div className={`absolute inset-0 bg-gradient-to-r ${config.glowColor} animate-pulse group-hover:animate-none`} />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent transform rotate-45 animate-pulse group-hover:via-white/20 transition-all duration-500" style={{ animationDuration: '3s' }} />
      </div>
      
      {/* Explosive hover effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className={`absolute inset-0 bg-gradient-to-r ${config.glowColor} animate-ping`} style={{ animationDuration: '0.8s' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent transform rotate-45 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 ease-out" />
      </div>
      
      {/* Floating orbs background - enhanced on hover */}
      <div className="absolute inset-0 overflow-hidden opacity-30 group-hover:opacity-70 transition-opacity duration-500">
        <div className={`absolute -top-4 -right-4 w-16 h-16 ${config.pulseColor} rounded-full blur-xl animate-pulse group-hover:scale-150 group-hover:animate-bounce transition-all duration-700`} style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className={`absolute -bottom-4 -left-4 w-12 h-12 ${config.pulseColor} rounded-full blur-lg animate-pulse group-hover:scale-125 group-hover:animate-spin transition-all duration-700`} style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className={`absolute top-1/2 left-1/2 w-8 h-8 ${config.pulseColor} rounded-full blur-md animate-pulse group-hover:scale-200 group-hover:animate-ping transition-all duration-700`} style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
      </div>

      {/* Particle explosion on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`absolute h-1 w-1 ${config.pulseColor} rounded-full animate-ping`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative flex flex-col items-center justify-center text-center min-h-[140px] z-10">
        {/* Floating icon container with explosive hover effects */}
        <div className="relative mb-6 animate-bounce group-hover:animate-none group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-1000" style={{ animationDuration: '2s' }}>
          <div className={`relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${config.iconGradient} ring-2 ${config.ringColor} shadow-2xl transition-all duration-700 group-hover:shadow-[0_0_40px_currentColor] group-hover:ring-4`}>
            <Icon className={`h-10 w-10 ${config.iconColor} transition-all duration-700 animate-pulse group-hover:animate-spin group-hover:scale-125 group-hover:drop-shadow-[0_0_20px_currentColor]`} />
            
            {/* Rotating ring effect - intensified on hover */}
            <div className={`absolute -inset-3 rounded-full border-2 border-dashed ${config.ringColor} opacity-40 animate-spin group-hover:opacity-100 group-hover:border-4 group-hover:animate-pulse transition-all duration-500`} style={{ animationDuration: '3s' }} />
            
            {/* Pulsing ring effect - explosive on hover */}
            <div className={`absolute -inset-6 rounded-full border ${config.ringColor} opacity-20 animate-ping group-hover:opacity-60 group-hover:-inset-12 group-hover:border-2 transition-all duration-500`} style={{ animationDuration: '2s' }} />
            
            {/* Multi-layer ring explosion on hover */}
            <div className="absolute -inset-8 opacity-0 group-hover:opacity-80 transition-opacity duration-500">
              <div className={`absolute inset-0 border-2 ${config.ringColor} rounded-full animate-ping`} />
              <div className={`absolute inset-2 border ${config.ringColor} rounded-full animate-ping`} style={{ animationDelay: '0.2s' }} />
              <div className={`absolute inset-4 border ${config.ringColor} rounded-full animate-ping`} style={{ animationDelay: '0.4s' }} />
            </div>
            
            {/* Type-specific enhanced animations */}
            {type === "pending" && (
              <div className="absolute -inset-8 opacity-80 group-hover:opacity-100 group-hover:-inset-12 transition-all duration-500">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`absolute h-2 w-2 ${config.pulseColor} rounded-full animate-ping group-hover:h-3 group-hover:w-3 transition-all duration-300`}
                    style={{
                      top: `${20 + Math.cos(i * 60 * Math.PI / 180) * 30}px`,
                      left: `${20 + Math.sin(i * 60 * Math.PI / 180) * 30}px`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>
            )}
            
            {type === "upcoming" && (
              <div className="absolute -inset-4 opacity-50 group-hover:opacity-90 group-hover:-inset-8 transition-all duration-500">
                <div className="w-full h-full border-2 border-dashed border-current rounded-full animate-spin group-hover:border-4 transition-all duration-300" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-2 border border-current rounded-full animate-spin group-hover:border-2 transition-all duration-300" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              </div>
            )}
            
            {type === "history" && (
              <div className="absolute -inset-6 opacity-30 group-hover:opacity-80 group-hover:-inset-10 transition-all duration-500">
                <div className={`absolute inset-0 border-2 ${config.ringColor} rounded-full animate-pulse group-hover:border-4 transition-all duration-300`} />
                <div className={`absolute inset-2 border ${config.ringColor} rounded-full animate-pulse group-hover:border-2 transition-all duration-300`} style={{ animationDelay: '0.3s' }} />
                <div className={`absolute inset-4 border ${config.ringColor} rounded-full animate-pulse group-hover:border-2 transition-all duration-300`} style={{ animationDelay: '0.6s' }} />
              </div>
            )}
            
            {(type === "creators" || type === "orders") && (
              <div className="absolute -inset-4 opacity-70 group-hover:opacity-100 group-hover:-inset-8 transition-all duration-500">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`absolute h-1 w-1 ${config.pulseColor} rounded-full animate-pulse group-hover:h-2 group-hover:w-2 group-hover:animate-ping transition-all duration-300`}
                    style={{
                      top: `${16 + Math.cos(i * 45 * Math.PI / 180) * 20}px`,
                      left: `${16 + Math.sin(i * 45 * Math.PI / 180) * 20}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced title with explosive glow effect */}
        <h3 className={`mb-3 text-xl font-black ${config.iconColor.split(' ')[0]} transition-all duration-500 transform hover:scale-110 relative animate-pulse group-hover:animate-none group-hover:text-white group-hover:scale-125 group-hover:drop-shadow-[0_0_30px_currentColor]`}>
          {config.title}
          <div className="absolute inset-0 blur-sm opacity-30 group-hover:opacity-80 group-hover:blur-lg transition-all duration-500">{config.title}</div>
        </h3>
        
        {/* Description with dramatic enhancement */}
        <p className="text-sm text-neutral-300 transition-all duration-500 max-w-[220px] leading-relaxed relative group-hover:text-white group-hover:scale-105 group-hover:drop-shadow-lg">
          <span className="inline-block">
            {config.description}
          </span>
        </p>

        {/* Interactive progress indicators - explosive on hover */}
        <div className="mt-6 flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-8 ${config.pulseColor} rounded-full opacity-60 animate-pulse group-hover:h-2 group-hover:w-12 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced corner decorations - explosive scaling */}
      <div className={`absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-bl ${config.iconGradient} opacity-30 rounded-full blur-sm animate-pulse hover:opacity-70 hover:scale-200 hover:animate-spin transition-all duration-700 group-hover:w-24 group-hover:h-24`} />
      <div className={`absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-tr ${config.iconGradient} opacity-20 rounded-full blur-sm animate-pulse hover:opacity-50 hover:scale-150 hover:animate-bounce transition-all duration-700 group-hover:w-20 group-hover:h-20`} style={{ animationDelay: '1s' }} />
      
      {/* Continuous shimmer edge effect - intensified */}
      <div className="absolute inset-0 rounded-2xl opacity-30 group-hover:opacity-80 pointer-events-none transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse group-hover:via-white/30 group-hover:animate-none transition-all duration-500" style={{ animationDuration: '3s' }} />
      </div>

      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={`absolute inset-0 rounded-2xl border-2 ${config.ringColor} animate-ping`} />
        <div className={`absolute inset-4 rounded-2xl border ${config.ringColor} animate-ping`} style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}