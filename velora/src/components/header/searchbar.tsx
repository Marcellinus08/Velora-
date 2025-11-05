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
        inputRef.current?.focus();
        setOpenSug(true);
      }
      if (e.key === "Escape") setOpenSug(false);
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
    setOpenSug(false);
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

  return (
    <div className="flex justify-start w-full">
      <div ref={containerRef} className="relative w-full max-w-[600px]">
        <form onSubmit={onSubmit} className="flex w-full items-center" role="search">
          <div className="relative flex min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 sm:left-3 flex items-center">
              <MI name="search" className="text-[14px] sm:text-[16px] text-neutral-400" />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setOpenSug(true)}
              className="h-8 sm:h-9 w-full rounded-l-full border border-neutral-700 bg-neutral-950 pl-8 sm:pl-9 pr-9 sm:pr-12 text-xs sm:text-sm text-neutral-50 placeholder:text-neutral-400 outline-none focus:border-neutral-500"
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
                className="absolute inset-y-0 right-9 sm:right-12 my-0.5 sm:my-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 cursor-pointer"
                aria-label="Clear text"
                title="Clear"
              >
                <MI name="close" className="text-[12px] sm:text-[14px]" />
              </button>
            )}

            <button
              type="submit"
              className="h-8 sm:h-9 w-10 sm:w-12 cursor-pointer rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 flex items-center justify-center"
              aria-label="Search"
              title="Search"
            >
              <MI name="search" className="text-[14px] sm:text-[16px]" />
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
            className="ml-1.5 sm:ml-2 cursor-pointer hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            aria-label="Voice search"
            title="Voice search"
          >
            <MI name="keyboard_voice" className="text-[14px] sm:text-[16px]" />
          </button>
        </form>

        {openSug && (recent.length > 0 || q) && (
          <div className="absolute left-0 right-0 top-[34px] sm:top-[38px] mx-auto w-full max-w-[600px] rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70 z-50">
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
              {q && <li className="px-4 pt-1 text-xs text-neutral-500">Press Enter to search “{q}”.</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
