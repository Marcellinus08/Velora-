"use client";

import { useState } from "react";
import type { StudioAd } from "./types";
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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

export default function StudioRecentAds({
  items = [],
  showCount = 3,
  onStatusChange,
}: {
  items?: StudioAd[];
  showCount?: number;
  onStatusChange?: () => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggleStatus = async (ad: StudioAd) => {
    const newStatus = ad.status === "active" ? "paused" : "active";
    setUpdating(ad.id);
    setOpenMenuId(null);
    
    try {
      const { supabase } = await import("@/lib/supabase");
      
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus })
        .eq("id", ad.id);
      
      if (error) {
        console.error("Failed to update campaign status:", error);
        alert("Failed to update campaign status");
      } else {
        // Refresh data
        if (onStatusChange) {
          onStatusChange();
        }
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      alert("Error updating campaign");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <section>
      <div className="rounded-2xl border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <p className="text-neutral-400 font-medium">No campaigns yet.</p>
              <p className="text-sm text-neutral-500">Create your first ad campaign to start promoting your content.</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800/50">
            {items.slice(0, showCount).map((ad) => {
              const isActive = ad.status === "active";
              const isPaused = ad.status === "paused";
              const isEnded = ad.status === "ended";
              
              return (
                <li
                  key={ad.id}
                  className="group relative p-4 hover:bg-neutral-800/20 transition-all duration-200"
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-blue-600/0 to-transparent opacity-0 group-hover:from-purple-600/5 group-hover:via-blue-600/5 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex items-center gap-4">
                    {/* Banner Thumbnail with enhanced styling */}
                    <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800/50 border border-neutral-700/50 group-hover:border-neutral-600/50 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-purple-900/10">
                      {ad.banner_url ? (
                        <Image
                          src={ad.banner_url}
                          alt={ad.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="128px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Campaign Info - Better organized */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-neutral-50 truncate group-hover:text-white transition-colors">
                        {ad.title}
                      </h3>
                      <p className="text-sm text-neutral-400 truncate mt-0.5">
                        {ad.description || "No description provided"}
                      </p>
                      
                      {/* Campaign Details */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(ad.start_date)} - {formatDate(ad.end_date)}</span>
                        </div>
                        
                        <span>•</span>
                        
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{ad.duration_days} days</span>
                        </div>
                        
                        <span>•</span>
                        
                        <span>Created {timeAgo(ad.created_at)}</span>
                        
                        {ad.cta_text && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
                              <span>CTA: "{ad.cta_text}"</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats - Compact Design */}
                    <div className="flex-shrink-0 flex items-center gap-4">
                      {/* Clicks */}
                      <div className="flex items-center gap-2 bg-neutral-800/50 rounded-lg px-3 py-2 border border-neutral-700/50">
                        <div className="text-center">
                          <p className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">Clicks</p>
                          <p className="text-xl font-bold bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent mt-0.5">
                            {ad.clicks}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-purple-400/60" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          isActive ? "bg-emerald-400 animate-pulse" : isPaused ? "bg-yellow-400" : "bg-red-400"
                        }`} />
                        <span className={`text-xs font-semibold ${
                          isActive ? "text-emerald-400" : isPaused ? "text-yellow-400" : "text-red-400"
                        }`}>
                          {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                        </span>
                      </div>

                      {/* Kebab Menu (3 dots) - Only show if not ended */}
                      {!isEnded && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === ad.id ? null : ad.id);
                            }}
                            disabled={updating === ad.id}
                            className="p-2 hover:bg-neutral-700/50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === ad.id && (
                            <>
                              {/* Backdrop to close menu */}
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenMenuId(null)}
                              />
                              
                              <div className="absolute right-0 mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                <button
                                  onClick={() => handleToggleStatus(ad)}
                                  className="w-full px-4 py-3 text-left text-sm hover:bg-neutral-700/50 transition-colors flex items-center gap-3"
                                >
                                  {isActive ? (
                                    <>
                                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-neutral-200">Pause Campaign</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-neutral-200">Activate Campaign</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
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
