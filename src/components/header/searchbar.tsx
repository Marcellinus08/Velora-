"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { MI } from "./MI";

const RECENT_KEY = "vh_recent_queries";

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [openSug, setOpenSug] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false); // State untuk expand search di mobile
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      if (Array.isArray(saved)) setRecent(saved.slice(0, 8));
    } catch {}
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 100);
        setOpenSug(true);
      }
      if (e.key === "Escape") {
        setOpenSug(false);
        if (window.innerWidth < 640) {
          setExpanded(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenSug(false);
        // Di mobile, collapse search bar jika klik di luar
        if (window.innerWidth < 640 && !q) {
          setExpanded(false);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [q]);

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
    setOpenSug(false);
    setExpanded(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }
  function clear() {
    setQ("");
    setOpenSug(true);
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

  // Handle search icon click di mobile
  const handleSearchIconClick = () => {
    if (window.innerWidth < 640 && !expanded) {
      setExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 100);
      setOpenSug(true);
    }
  };

  return (
    <>
      {/* Backdrop overlay ketika search expanded di mobile - DISABLED */}
      {/* {expanded && (
        <div 
          className="sm:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => {
            setExpanded(false);
            setOpenSug(false);
            setQ("");
          }}
        />
      )} */}
      
      <div className="flex justify-start relative z-40">
        <div ref={containerRef} className="relative transition-all duration-300 w-full max-w-[720px] hidden sm:block">
          <form onSubmit={onSubmit} className="flex w-full items-center" role="search">
            {/* Mobile: Icon search button DIHAPUS */}
            {/* Desktop: Always show full search bar */}
            <div className="relative flex min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 sm:left-4 flex items-center">
              <MI name="search" className="text-[16px] sm:text-[18px] text-neutral-400" />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setOpenSug(true)}
              className="h-9 sm:h-10 w-full rounded-l-full border border-neutral-700 bg-neutral-950 pl-9 sm:pl-11 pr-12 sm:pr-[3.5rem] text-sm sm:text-base text-neutral-50 placeholder:text-neutral-400 outline-none focus:border-neutral-500"
              placeholder="Search"
              aria-label="Search"
              inputMode="search"
              enterKeyHint="search"
              role="searchbox"
            />

            {q && (
              <button
                type="button"
                onClick={clear}
                className="absolute inset-y-0 right-12 sm:right-16 my-1 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 cursor-pointer"
                aria-label="Clear text"
                title="Clear"
              >
                <MI name="close" className="text-[14px] sm:text-[16px]" />
              </button>
            )}

            <button
              type="submit"
              className="h-9 sm:h-10 w-12 sm:w-16 cursor-pointer rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 flex items-center justify-center"
              aria-label="Search"
              title="Search"
            >
              <MI name="search" className="text-[16px] sm:text-[18px]" />
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
          >
            <MI name="keyboard_voice" className="text-[16px] sm:text-[18px]" />
          </button>
        </form>

        {openSug && (recent.length > 0 || q) && (
          <div className="absolute left-0 right-0 top-[44px] mx-auto w-full max-w-[720px] rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
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
                          saveRecent(s);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 pr-12 text-left text-sm text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                      >
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
              {q && <li className="px-4 pt-1 text-xs text-neutral-500">Press Enter to search "{q}".</li>}
            </ul>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
