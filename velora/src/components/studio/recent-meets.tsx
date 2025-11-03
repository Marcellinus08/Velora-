"use client";

import type { StudioMeet } from "./types";
import Image from "next/image";

function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d2 = Math.floor(h / 24);
  if (d2 < 30) return `${d2}d ago`;
  const mo = Math.floor(d2 / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function StudioRecentMeets({
  items = [],
  showCount = 3,
}: {
  items?: StudioMeet[];
  showCount?: number;
}) {
  return (
    <section>
      <div className="rounded-2xl border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-neutral-400 font-medium">No meets yet.</p>
              <p className="text-sm text-neutral-500">Your completed meet bookings will appear here.</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800/50">
            {items.slice(0, showCount).map((meet) => {
              const isPending = meet.status === "pending";
              const isConfirmed = meet.status === "confirmed";
              const isCompleted = meet.status === "completed";
              const isCancelled = meet.status === "cancelled";
              
              const totalEarnings = (meet.total_price_cents / 100) * 0.8; // 80% for creator
              
              return (
                <li
                  key={meet.id}
                  className="group relative p-4 hover:bg-neutral-800/20 transition-all duration-200"
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-transparent opacity-0 group-hover:from-blue-600/5 group-hover:via-purple-600/5 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex items-center gap-4">
                    {/* Participant Avatar */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden bg-neutral-800/50 border-2 border-neutral-700/50 group-hover:border-blue-500/50 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-blue-900/20">
                      {meet.participant_avatar ? (
                        <Image
                          src={meet.participant_avatar}
                          alt={meet.participant_name || "Participant"}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                          <svg className="w-8 h-8 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Meet Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-neutral-50 truncate group-hover:text-white transition-colors">
                        {meet.participant_name || `${meet.participant_addr.slice(0, 6)}...${meet.participant_addr.slice(-4)}`}
                      </h3>
                      
                      {/* Meet Details */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDateTime(meet.scheduled_at)}</span>
                        </div>
                        
                        <span>•</span>
                        
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{meet.duration_minutes} min</span>
                        </div>
                        
                        <span>•</span>
                        
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>${meet.rate_usd_per_min}/min</span>
                        </div>
                        
                        <span>•</span>
                        
                        <span>Booked {timeAgo(meet.created_at)}</span>
                      </div>
                    </div>

                    {/* Stats - Compact Design */}
                    <div className="flex-shrink-0 flex items-center gap-4">
                      {/* Total Earnings (80% creator share) */}
                      <div className="flex items-center gap-2 bg-neutral-800/50 rounded-lg px-3 py-2 border border-neutral-700/50">
                        <div className="text-center">
                          <p className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">Earnings</p>
                          <p className="text-lg font-bold bg-gradient-to-br from-emerald-400 to-green-400 bg-clip-text text-transparent mt-0.5">
                            ${totalEarnings.toFixed(2)}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-emerald-400/60" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          isCompleted ? "bg-emerald-400" : 
                          isConfirmed ? "bg-blue-400 animate-pulse" : 
                          isPending ? "bg-yellow-400" : 
                          "bg-red-400"
                        }`} />
                        <span className={`text-xs font-semibold ${
                          isCompleted ? "text-emerald-400" : 
                          isConfirmed ? "text-blue-400" : 
                          isPending ? "text-yellow-400" : 
                          "text-red-400"
                        }`}>
                          {meet.status.charAt(0).toUpperCase() + meet.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
