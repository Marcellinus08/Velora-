"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { toast } from "@/components/ui/toast";
import { MI } from "./MI";

const RECENT_KEY = "vh_recent_queries";

type VideoResult = {
  id: string;
  title: string;
  abstract_id: string;
  thumb_url?: string | null;
};

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [openSug, setOpenSug] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // State untuk mobile search overlay
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Expose function globally for MobileIcon to call
  useEffect(() => {
    (window as any).__openMobileSearch = () => {
      setMobileSearchOpen(true);
      // Close any open dropdowns by clicking outside
      document.body.click();
    };
    return () => {
      delete (window as any).__openMobileSearch;
    };
  }, []);

  // Prevent body scroll when mobile search is open
  useEffect(() => {
    if (mobileSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSearchOpen]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(saved)) setRecent(saved.slice(0, 8));
    } catch {}
  }, []);

  // Debounced search for video results
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset video results if query is empty
    if (!q || q.trim().length < 1) {
      setVideoResults([]);
      setLoadingVideos(false);
      return;
    }

    // Set loading state
    setLoadingVideos(true);

    // Debounce search by 300ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/videos?q=${encodeURIComponent(q)}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setVideoResults(data.videos || []);
        }
      } catch (error) {
        console.error("Error searching videos:", error);
      } finally {
        setLoadingVideos(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        // Di mobile, buka overlay
        if (window.innerWidth < 768) {
          setMobileSearchOpen(true);
        }
        setTimeout(() => inputRef.current?.focus(), 100);
        setOpenSug(true);
      }
      if (e.key === "Escape") {
        setOpenSug(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenSug(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function saveRecent(query: string) {
    const list = [query, ...recent.filter((x) => x !== query)].slice(0, 8);
    setRecent(list);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    saveRecent(query);
    
    // Keep dropdown open to show results
    setOpenSug(true);
  }
  function clear() {
    setQ("");
    setOpenSug(true);
    setVideoResults([]);
    inputRef.current?.focus();
  }
  function removeRecent(term: string) {
    const list = recent.filter((x) => x !== term);
    setRecent(list);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  }
  function clearAllRecent() {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }

  // Handle mobile search icon click
  const handleMobileSearchClick = () => {
    setMobileSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle close mobile search
  const handleCloseMobileSearch = () => {
    setMobileSearchOpen(false);
    setOpenSug(false);
    setQ("");
    setVideoResults([]);
  };

  return (
    <>
      {/* Mobile Search Overlay - Full screen seperti YouTube - Rendered in Portal */}
      {mobileSearchOpen && typeof window !== 'undefined' && createPortal(
        <div 
          className="md:hidden fixed inset-0 z-[9999] bg-neutral-900"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Header dengan back button dan search input */}
          <div className="flex items-center gap-2 px-2 py-2 border-b border-neutral-800">
            <button
              onClick={handleCloseMobileSearch}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close search"
            >
              <MI name="arrow_back" className="text-[20px] text-neutral-200" />
            </button>

            <form onSubmit={onSubmit} className="flex-1 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setOpenSug(true)}
                className="flex-1 h-10 bg-neutral-800 rounded-full px-4 text-sm text-neutral-50 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-600"
                placeholder="Search"
                autoFocus
              />
              {q && (
                <button
                  type="button"
                  onClick={clear}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Clear"
                >
                  <MI name="close" className="text-[18px] text-neutral-400" />
                </button>
              )}
            </form>

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={() => {
                const w = window as any;
                const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
                if (!SR) {
                  toast.error(
                    "Voice Search Not Supported",
                    "This feature requires Chrome/Edge browser\nPlease use a compatible browser",
                    5000
                  );
                  return;
                }
                const isSecure = location.protocol === "https:" || location.hostname === "localhost";
                if (!isSecure) {
                  toast.error(
                    "HTTPS Required",
                    "Voice search requires HTTPS connection\nPlease use a secure connection",
                    5000
                  );
                  return;
                }
                try {
                  const rec = new SR();
                  rec.lang = "en-US";
                  rec.interimResults = false;
                  rec.maxAlternatives = 1;
                  rec.onresult = (e: any) => {
                    const text = e.results?.[0]?.[0]?.transcript as string;
                    if (!text) return;
                    setQ(text);
                    saveRecent(text);
                    setOpenSug(true);
                  };
                  rec.onerror = () => {
                    toast.error(
                      "Voice Search Failed",
                      "Could not recognize your voice\nPlease try again",
                      4000
                    );
                  };
                  rec.start();
                } catch {
                  toast.error(
                    "Voice Search Error",
                    "Failed to initialize voice recognition\nPlease check your microphone",
                    5000
                  );
                }
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Voice search"
            >
              <MI name="keyboard_voice" className="text-[20px] text-neutral-200" />
            </button>
          </div>

          {/* Search Results / Recent Searches */}
          <div className="overflow-y-auto h-[calc(100vh-60px)]">
            {/* Video Results */}
            {videoResults.length > 0 && (
              <div className="border-b border-neutral-800">
                <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between">
                  <span>Videos</span>
                  <span className="font-semibold text-purple-400">{videoResults.length} results</span>
                </div>
                <ul>
                  {videoResults.map((video) => (
                    <li key={video.id}>
                      <button
                        onClick={() => {
                          saveRecent(video.title); // Save to history when clicking video
                          handleCloseMobileSearch();
                          router.push(`/video?id=${video.id}`);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-neutral-800 cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-20 h-12 bg-neutral-800 rounded overflow-hidden">
                          {video.thumb_url ? (
                            <img 
                              src={video.thumb_url} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MI name="video_library" className="text-neutral-600 text-[18px]" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-neutral-200 font-medium flex-1 text-left line-clamp-2">
                          {video.title}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Loading State */}
            {loadingVideos && (
              <div className="px-4 py-4 flex items-center gap-3 text-sm text-neutral-400">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching videos...</span>
              </div>
            )}

            {/* Recent Searches - Tampil saat tidak ada query atau setelah ada hasil */}
            {recent.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-4 py-3 text-xs text-neutral-400 border-t border-neutral-800">
                  <span>Recent searches</span>
                  <button
                    onClick={clearAllRecent}
                    className="rounded-md px-2 py-1 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
                <ul>
                  {recent.map((s) => (
                    <li key={s} className="group relative">
                      <div className="flex w-full items-center gap-4 px-4 py-3 hover:bg-neutral-800 cursor-pointer">
                        <div 
                          onClick={() => {
                            setQ(s);
                            setOpenSug(true);
                          }}
                          className="flex items-center gap-4 flex-1"
                        >
                          <MI name="history" className="text-neutral-400 text-[20px] flex-shrink-0" />
                          <span className="text-sm text-neutral-200 flex-1 text-left">{s}</span>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecent(s);
                          }}
                          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-700 cursor-pointer flex-shrink-0"
                          aria-label="Remove"
                          role="button"
                        >
                          <MI name="close" className="text-[16px] text-neutral-400" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty State */}
            {!loadingVideos && !q && recent.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MI name="search" className="text-[48px] text-neutral-700 mb-4" />
                <p className="text-neutral-400 text-sm">Start searching for videos</p>
              </div>
            )}

            {/* No Results State */}
            {!loadingVideos && q && videoResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MI name="search_off" className="text-[48px] text-neutral-700 mb-4" />
                <p className="text-neutral-300 text-base font-medium mb-1">No results found</p>
                <p className="text-neutral-500 text-sm">Try different keywords</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Desktop/Tablet Search Bar - Hidden di mobile */}
      <div className="hidden md:flex justify-start relative z-40" suppressHydrationWarning>
        <div ref={containerRef} className="relative transition-all duration-300 w-full max-w-[720px]" suppressHydrationWarning>
          <form onSubmit={onSubmit} className="flex w-full items-center" role="search" suppressHydrationWarning>
            <div className="relative flex min-w-0 flex-1" suppressHydrationWarning>
            <span className="pointer-events-none absolute inset-y-0 left-3 lg:left-4 flex items-center" suppressHydrationWarning>
              <MI name="search" className="text-[16px] lg:text-[18px] text-neutral-400" />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setOpenSug(true)}
              className="h-9 lg:h-10 w-full rounded-l-full border border-neutral-700 bg-neutral-950 pl-10 lg:pl-11 pr-13 lg:pr-[3.5rem] text-sm lg:text-base text-neutral-50 placeholder:text-neutral-400 outline-none focus:border-neutral-500"
              placeholder="Search"
              aria-label="Search"
              inputMode="search"
              enterKeyHint="search"
              role="searchbox"
              suppressHydrationWarning
            />

            {q && (
              <button
                type="button"
                onClick={clear}
                className="absolute inset-y-0 right-14 lg:right-16 my-1 flex h-7 lg:h-8 w-7 lg:w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 cursor-pointer"
                aria-label="Clear text"
                title="Clear"
                suppressHydrationWarning
              >
                <MI name="close" className="text-[15px] lg:text-[16px]" />
              </button>
            )}

            <button
              type="submit"
              className="h-9 lg:h-10 w-14 lg:w-16 cursor-pointer rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 flex items-center justify-center"
              aria-label="Search"
              title="Search"
              suppressHydrationWarning
            >
              <MI name="search" className="text-[17px] lg:text-[18px]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const w = window as any;
              const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
              if (!SR) {
                toast.error(
                  "Voice Search Not Supported",
                  "This feature requires Chrome/Edge desktop browser\nPlease use a compatible browser",
                  5000
                );
                return;
              }
              const isSecure = location.protocol === "https:" || location.hostname === "localhost";
              if (!isSecure) {
                toast.error(
                  "HTTPS Required",
                  "Voice search requires HTTPS connection\nPlease use a secure connection",
                  5000
                );
                return;
              }
              try {
                const rec = new SR();
                rec.lang = "en-US";
                rec.interimResults = false;
                rec.maxAlternatives = 1;
                rec.onresult = (e: any) => {
                  const text = e.results?.[0]?.[0]?.transcript as string;
                  if (!text) return;
                  setQ(text);
                  saveRecent(text);
                  router.push(`/search?q=${encodeURIComponent(text)}`);
                };
                rec.onerror = () => {
                  toast.error(
                    "Voice Search Failed",
                    "Could not recognize your voice\nPlease try again",
                    4000
                  );
                };
                rec.start();
              } catch {
                toast.error(
                  "Voice Search Error",
                  "Failed to initialize voice recognition\nPlease check your microphone",
                  5000
                );
              }
            }}
            className="ml-2 sm:ml-3 cursor-pointer hidden sm:flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            aria-label="Voice search"
            title="Voice search"
            suppressHydrationWarning
          >
            <MI name="keyboard_voice" className="text-[16px] sm:text-[18px]" />
          </button>
        </form>

        {openSug && (recent.length > 0 || q || videoResults.length > 0) && (
          <div className="absolute left-0 right-0 top-[44px] mx-auto w-full max-w-[720px] rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
            {/* Video Results Section */}
            {videoResults.length > 0 && (
              <div className="border-b border-neutral-800">
                <div className="px-4 py-2 text-xs text-neutral-400 flex items-center justify-between">
                  <span>Videos</span>
                  <span className="font-semibold text-purple-400">{videoResults.length} results</span>
                </div>
                <ul className="py-2 max-h-[500px] overflow-y-auto">
                  {videoResults.map((video) => (
                    <li key={video.id} className="group relative">
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setOpenSug(false);
                          setQ('');
                          setVideoResults([]);
                          router.push(`/video?id=${video.id}`);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-800 cursor-pointer transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-16 h-10 bg-neutral-800 rounded overflow-hidden">
                          {video.thumb_url ? (
                            <img 
                              src={video.thumb_url} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MI name="video_library" className="text-neutral-600 text-[16px]" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-neutral-200 font-medium flex-1">
                          {video.title}
                        </span>
                      </button>
                    </li>
                  ))}

                </ul>
              </div>
            )}

            {/* Loading State */}
            {loadingVideos && (
              <div className="px-4 py-3 flex items-center gap-2 text-sm text-neutral-400">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching videos...</span>
              </div>
            )}

            {/* Recent Searches Section */}
            {recent.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 text-xs text-neutral-400">
                <span>Recent searches</span>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={clearAllRecent}
                  className="rounded-md px-2 py-1 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            <ul className="py-2">
              {[...new Set([...recent])]
                .slice(0, 7)
                .map((s) => {
                  const isRecent = recent.includes(s);
                  return (
                    <li key={s} className="group relative">
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setQ(s);
                          setOpenSug(true);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 pr-12 text-left text-sm text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                      >
                        <MI name="history" className="text-neutral-400 text-[16px]" />
                        <span className="truncate">{s}</span>
                      </button>

                      {isRecent && (
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecent(s);
                          }}
                          aria-label="Remove from history"
                          title="Remove from history"
                          className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 group-hover:flex cursor-pointer"
                        >
                          <MI name="close" className="text-[16px]" />
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

// Mobile Icon Component - Export as property
SearchBar.MobileIcon = function MobileSearchIcon() {
  const handleClick = () => {
    // Call global function to open mobile search
    if ((window as any).__openMobileSearch) {
      (window as any).__openMobileSearch();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="md:hidden flex size-8 cursor-pointer border border-[var(--primary-500)] items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
      aria-label="Search"
      title="Search"
      type="button"
    >
      <MI name="search" className="text-[16px]" />
    </button>
  );
};
