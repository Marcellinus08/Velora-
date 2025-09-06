// components/Header.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type SpeechRec = typeof window extends any
  ? (Window & { webkitSpeechRecognition?: any; SpeechRecognition?: any })
  : never;

const RECENT_KEY = "vh_recent_queries";

export default function Header() {
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenSug(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
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
  function voice() {
    const w = window as unknown as SpeechRec;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search tidak didukung di browser ini.");
      return;
    }
    const rec = new SR();
    rec.lang = "id-ID";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      setQ(text);
      saveRecent(text);
      router.push(`/search?q=${encodeURIComponent(text)}`);
    };
    rec.start();
  }

  const quick = ["tutorial", "olahraga", "crypto", "masak", "pendidikan", "fotografi"];
  const filtered = [...recent, ...quick]
    .filter((s, i, a) => a.indexOf(s) === i)
    .filter((s) => (q ? s.toLowerCase().includes(q.toLowerCase()) : true))
    .slice(0, 7);

  return (
    <header
      // grid 3 kolom: [sidebar | content | right]
      className="sticky top-0 z-20 grid w-full items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 py-2 sm:px-6 lg:px-8
                 grid-cols-[auto_1fr_auto] md:[grid-template-columns:var(--sidebar-w,16rem)_1fr_auto]"
    >
      {/* kolom 1: logo (lebarnya = sidebar) */}
      <div className="flex items-center gap-4">
        <button
          className="flex items-center justify-center rounded-full p-2 text-neutral-50 hover:bg-neutral-800 md:hidden"
          aria-label="Buka menu"
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
          </svg>
        </button>

        <Image
          src="/logo.png"
          alt="Velora Logo"
          width={512}
          height={128}
          priority
          className="h-[44px] w-auto sm:h-[42px] lg:h-[46px]"
        />
      </div>

      {/* kolom 2: SEARCH — otomatis start tepat setelah sidebar */}
      <div className="flex justify-start">
        {/* wrapper ini yang menentukan lebar maksimal bar */}
        <div ref={containerRef} className="relative w-full max-w-[720px]">
          <form onSubmit={onSubmit} className="flex w-full items-center">
            <div className="relative flex min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.9 14.32a8 8 0 111.414-1.414l3.39 3.39a1 1 0 01-1.414 1.415l-3.39-3.39zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>

              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setOpenSug(true)}
                className="h-10 w-full rounded-l-full border border-neutral-700 bg-neutral-950 pl-11 pr-[3.5rem] text-base text-neutral-50 placeholder:text-neutral-400 outline-none focus:border-neutral-500"
                placeholder="Search"
                aria-label="Search"
                autoComplete="off"
                enterKeyHint="search"
              />

              {q && (
                <button
                  type="button"
                  onClick={clear}
                  className="absolute inset-y-0 right-16 my-1 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                  aria-label="Bersihkan"
                  title="Bersihkan"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l3.536-3.536a1 1 0 111.415 1.415L11.414 10l3.536 3.536a1 1 0 11-1.415 1.415L10 11.414l-3.536 3.536a1 1 0 01-1.415-1.415L8.586 10 5.05 6.464A1 1 0 016.464 5.05L10 8.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              <button
                type="submit"
                className="h-10 w-16 rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                aria-label="Cari"
                title="Cari"
              >
                <svg className="mx-auto h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.9 14.32a8 8 0 111.414-1.414l3.39 3.39a1 1 0 01-1.414 1.415l-3.39-3.39zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={voice}
              className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              aria-label="Pencarian suara"
              title="Pencarian suara"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0013.9 1H19a7 7 0 00-2-1zM11 19.93V22h2v-2.07A8.001 8.001 0 0020 12h-2a6 6 0 11-12 0H4a8.001 8.001 0 007 7.93z" />
              </svg>
            </button>
          </form>

          {/* dropdown suggestions — lebar mengikuti input */}
          {openSug && (filtered.length > 0 || q) && (
            <div className="absolute left-0 right-0 top-[44px] rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
              <ul className="py-2">
                {filtered.map((s) => (
                  <li key={s}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setQ(s);
                        saveRecent(s);
                        router.push(`/search?q=${encodeURIComponent(s)}`);
                        setOpenSug(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                      <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M13 7H7v6h6V7z" />
                      </svg>
                      {s}
                    </button>
                  </li>
                ))}
                {q && <li className="px-4 pt-1 text-xs text-neutral-500">Tekan Enter untuk mencari “{q}”.</li>}
              </ul>
            </div>
          )}
        </div>
      </div>


      {/* kanan: biarkan seperti punyamu */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
              <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41ZM189.5,149.31a16.46,16.46,0,0,0-4.75,17.47l8.43,49.14-44.13-23.2a16.51,16.51,0,0,0-15.1,0L90,192.72l8.43-49.14a16.46,16.46,0,0,0-4.75-17.47L58,114.53,107.29,107a16.43,16.43,0,0,0,12.39-9l21.86-43.66,21.86,43.66a16.43,16.43,0,0,0,12.39,9L224,114.53Z"></path>
            </svg>
            <span className="text-sm font-semibold text-neutral-50">2.500</span>
          </div>
          <div className="h-5 w-px bg-neutral-700"></div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[var(--primary-500)]" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
              <path d="M224,72H48A24,24,0,0,0,24,96V192a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V160H192a8,8,0,0,1,0-16h32V96A24,24,0,0,0,224,72ZM40,96a8,8,0,0,1,8-8H224a8,8,0,0,1,8,8v48H192a24,24,0,0,0-24,24v16H48a8,8,0,0,1-8-8Z"></path>
            </svg>
            <span className="text-sm font-semibold text-neutral-50">Rp 500.000</span>
          </div>
        </div>

        <button
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800"
          aria-label="Tambah"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
        </button>

        <button
          className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800"
          aria-label="Notifikasi"
        >
          <svg fill="currentColor" height="20" width="20" viewBox="0 0 256 256" aria-hidden="true">
            <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
          </svg>
        </button>

        {/* Profil default (ikon) */}
        <button
        className="flex size-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 ring-1 ring-neutral-700/60 hover:bg-neutral-700"
        aria-label="Profil"
        title="Profil"
        >
        <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="currentColor"
            aria-hidden="true"
        >
            {/* kepala */}
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            {/* bahu/badan */}
            <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 19c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4v-1z"
            />
        </svg>
        </button>

      </div>
    </header>
  );
}
