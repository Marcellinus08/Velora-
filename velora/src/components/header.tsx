// src/components/header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount, usePublicClient, useWatchBlockNumber } from "wagmi";
import { formatUnits, type Abi } from "viem";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { AbstractProfile } from "@/components/abstract-profile";
import ProfileUpsertOnLogin from "@/components/boot/profile-upsert-on-login"; // auto-upsert profil saat connect
import { getContractWithCurrentChain } from "@/lib/chain-utils";

/* ===== Minimal ERC20 ABI (read-only) ===== */
const ERC20_MIN_ABI = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
] as const satisfies Abi;

/* Format $ */
function formatUSD(n: number) {
  if (!isFinite(n) || n <= 0) return "$0";
  if (n < 1) return `$${n.toFixed(4)}`;
  if (n < 1000) return `$${n.toFixed(2)}`;
  const units = [
    { v: 1e9, s: "b" },
    { v: 1e6, s: "m" },
    { v: 1e3, s: "k" },
  ];
  for (const u of units) if (n >= u.v) return `$${(n / u.v).toFixed(1)}${u.s}`;
  return `$${n.toFixed(0)}`;
}

type Notif = { id: string; title: string; body?: string; time?: string; unread?: boolean };
const RECENT_KEY = "vh_recent_queries";
const short = (addr?: `0x${string}`) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

/* =================== DB Avatar trigger =================== */
type DbProfile = { abstract_id: string; username: string | null; avatar_url: string | null };

function HeaderAvatar({ address }: { address?: `0x${string}` }) {
  const [dbAvatar, setDbAvatar] = useState<string | null>(null);
  const [useDb, setUseDb] = useState<boolean>(false);
  const cacheBust = useRef<number>(Date.now()); // supaya ga kena cache lama

  const addrLower = useMemo(
    () => (address ? address.toLowerCase() : ""),
    [address]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!addrLower || !/^0x[a-f0-9]{40}$/.test(addrLower)) {
        setUseDb(false);
        setDbAvatar(null);
        return;
      }
      try {
        const r = await fetch(`/api/profiles/${addrLower}`, { cache: "no-store" });
        if (!r.ok) {
          setUseDb(false);
          setDbAvatar(null);
          return;
        }
        const p: DbProfile = await r.json();
        if (!alive) return;
        if (p?.avatar_url) {
          setDbAvatar(`${p.avatar_url}?v=${cacheBust.current}`);
          setUseDb(true);
        } else {
          setUseDb(false);
          setDbAvatar(null);
        }
      } catch {
        if (!alive) return;
        setUseDb(false);
        setDbAvatar(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [addrLower]);

  return (
    <div className="rounded-full ring-2 ring-transparent hover:ring-[rgba(124,58,237,0.45)]">
      {useDb && dbAvatar ? (
        // pakai <img> biasa biar ga perlu whitelist domain tambahan (kamu sudah whitelist Supabase di next.config)
        <img
          src={dbAvatar}
          alt="Avatar"
          className="block rounded-full object-cover h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onError={() => setUseDb(false)} // fallback ke AbstractProfile kalau gagal load
        />
      ) : (
        <AbstractProfile
          size="sm"
          showTooltip={false}
          className="!h-8 !w-8 sm:!h-9 sm:!w-9 md:!h-10 md:!w-10"
        />
      )}
    </div>
  );
}
/* ======================================================== */

export default function Header() {
  const router = useRouter();
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;
  const { logout } = useLoginWithAbstract();

  /* ========= USDC.e balance (live per block) ========= */
  const client = usePublicClient();
  const [usdceText, setUsdceText] = useState<string>("$0");

  async function refreshUsdce() {
    try {
      if (!client || !address) {
        setUsdceText("$0");
        return;
      }
      const usdce = getContractWithCurrentChain("usdce");
      const [dec, bal] = await Promise.all([
        client.readContract({
          address: usdce.address as `0x${string}`,
          abi: ERC20_MIN_ABI,
          functionName: "decimals",
        }),
        client.readContract({
          address: usdce.address as `0x${string}`,
          abi: ERC20_MIN_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
      ]);
      const amount = Number(formatUnits(bal as bigint, Number(dec)));
      setUsdceText(formatUSD(amount));
    } catch {
      setUsdceText("$0");
    }
  }

  useEffect(() => {
    void refreshUsdce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, address]);

  useWatchBlockNumber({
    enabled: Boolean(client && address),
    onBlockNumber: () => void refreshUsdce(),
  });

  /* ========= Search state ========= */
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

  const [notifications] = useState<Notif[]>([]);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const quick = ["tutorial", "olahraga", "crypto", "masak", "pendidikan", "fotografi"];
  const filtered = [...recent, ...quick]
    .filter((s, i, a) => a.indexOf(s) === i)
    .filter((s) => (q ? s.toLowerCase().includes(q.toLowerCase()) : true))
    .slice(0, 7);

  const itemCls = "px-3 py-2 text-[13px]";
  const walletDropdownItems = [
    <DropdownMenuItem key="profile" className={itemCls} onClick={() => router.push("/profile")}>
      Profile
    </DropdownMenuItem>,
    <DropdownMenuItem key="studio" className={itemCls} onClick={() => router.push("/studio")}>
      Studio
    </DropdownMenuItem>,
    <DropdownMenuItem key="setting" className={itemCls} onClick={() => router.push("/settings")}>
      Setting
    </DropdownMenuItem>,
    <div key="sep" className="h-px my-0.5 bg-neutral-800" />,
    <DropdownMenuItem
      key="disconnect"
      className={itemCls + " text-destructive"}
      onClick={() => logout()}
    >
      Disconnect
    </DropdownMenuItem>,
  ];

  return (
    <header
      className="sticky top-0 z-20 grid w-full items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 py-2 sm:px-6 lg:px-8
                 grid-cols-[auto_1fr_auto] md:[grid-template-columns:var(--sidebar-w,16rem)_1fr_auto]"
    >
      {/* Kolom 1: Logo */}
      <div className="flex items-center gap-4">
        <button
          className="flex items-center justify-center rounded-full p-2 text-neutral-50 hover:bg-neutral-800 md:hidden"
          aria-label="Buka menu"
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
          </svg>
        </button>

        <Link href="/" aria-label="Home">
          <Image
            src="/logo.png"
            alt="Velora Logo"
            width={512}
            height={128}
            priority
            className="h-[44px] w-auto sm:h-[42px] lg:h-[46px]"
          />
        </Link>
      </div>

      {/* Kolom 2: Search */}
      <div className="flex justify-start">
        <div ref={containerRef} className="relative w-full max-w-[720px]">
          <form onSubmit={onSubmit} className="flex w-full items-center">
            <div className="relative flex min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg
                  className="h-5 w-5 text-neutral-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
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
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l3.536-3.536a1 1 0 111.415 1.415L11.414 10l3.536 3.536a1 1 0 11-1.415 1.414L10 11.414l-3.536 3.536a1 1 0 01-1.415-1.415L8.586 10 5.05 6.464A1 1 0 016.464 5.05L10 8.586z"
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

            {/* Voice button */}
            <button
              type="button"
              onClick={() => {
                const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SR) return alert("Voice search tidak didukung di browser ini.");
                const rec = new SR();
                rec.lang = "id-ID";
                rec.onresult = (e: any) => {
                  const text = e.results[0][0].transcript as string;
                  setQ(text);
                  saveRecent(text);
                  router.push(`/search?q=${encodeURIComponent(text)}`);
                };
                rec.start();
              }}
              className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              aria-label="Pencarian suara"
              title="Pencarian suara"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0013.9 1H19a7 7 0 00-2-1zM11 19.93V22h2v-2.07A8.001 8.001 0 0020 12h-2a6 6 0 11-12 0H4a8.001 8.001 0 007 7.93z" />
              </svg>
            </button>
          </form>

          {openSug && (filtered.length > 0 || q) && (
            <div className="absolute left-0 right-0 top-[44px] mx-auto w-full max-w-[720px] rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
              {recent.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 text-xs text-neutral-400">
                  <span>Recent searches</span>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={clearAllRecent}
                    className="rounded-md px-2 py-1 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                  >
                    Clear all
                  </button>
                </div>
              )}

              <ul className="py-2">
                {filtered.map((s) => {
                  const isRecent = recent.includes(s);
                  return (
                    <li key={s} className="group relative">
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setQ(s);
                          saveRecent(s);
                          router.push(`/search?q=${encodeURIComponent(s)}`);
                          setOpenSug(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 pr-12 text-left text-sm text-neutral-200 hover:bg-neutral-800"
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
                          className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 group-hover:flex"
                        >
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M11.414 10l3.536-3.536a1 1 0 10-1.414-1.414L10 8.586 6.464 5.05A1 1 0 105.05 6.464L8.586 10l-3.536 3.536a1 1 0 001.414-1.414L11.414 10z"
                              clipRule="evenodd"
                            />
                          </svg>
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

      {/* Kolom 3: kanan */}
      <div className="flex items-center gap-2 sm:gap-4">
        {!isConnected ? (
          <div className="flex items-center gap-2">
            <ConnectWalletButton className="min-w-28 px-4" />
          </div>
        ) : (
          <>
            {/* Points + USDC.e */}
            <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">
              {/* Points */}
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z"></path>
                </svg>
                <span className="text-sm font-semibold text-neutral-50">2.500</span>
              </div>

              <div className="h-5 w-px bg-neutral-700" />

              {/* USDC.e (bridged) */}
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-[var(--primary-500)]" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,72H48A24,24,0,0,0,24,96V192a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V160H192a8,8,0,0,1,0-16h32V96A24,24,0,0,0,224,72ZM40,96a8,8,0,0,1,8-8H224a8,8,0,0,1,8,8v48H192a24,24,0,0,0-24,24v16H48a8,8,0,0,1-8-8Z"></path>
                </svg>
                <span className="text-sm font-semibold text-neutral-50">USDC.e {usdceText}</span>
              </div>
            </div>

            {/* Tombol + */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex size-10 cursor-pointer items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
                    aria-label="Tambah"
                    title="Tambah"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="bottom" className="w-44">
                  <DropdownMenuItem onClick={() => router.push("/ads")}>Create ads</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/studio/upload")}>Upload video</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Notifikasi */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
                    aria-label="Notification"
                    title="Notification"
                  >
                    <svg fill="currentColor" height="20" width="20" viewBox="0 0 256 256">
                      <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-[var(--primary-500)]" />
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="bottom" className="w-80">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <h3 className="text-sm font-semibold text-neutral-100">Notifications</h3>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/70">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-300" fill="currentColor">
                          <path d="M18 16l1 2H5l1-2c.667-1.333 1-3.667 1-7a5 5 0 1110 0c0 3.333.333 5.667 1 7zM9 19a3 3 0 006 0H9z" />
                        </svg>
                      </div>
                      <p className="mt-3 text-sm font-medium text-neutral-200">No notifications yet</p>
                      <p className="mt-1 text-xs text-neutral-400">Notifications will appear here later.</p>
                    </div>
                  ) : (
                    <ul className="max-h-80 divide-y divide-neutral-800 overflow-auto">
                      {notifications.map((n) => (
                        <li key={n.id} className="flex gap-3 px-4 py-3 hover:bg-neutral-800/60">
                          <div
                            className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: n.unread ? "var(--primary-500)" : "transparent" }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-neutral-100">{n.title}</p>
                            {n.body && <p className="truncate text-xs text-neutral-400">{n.body}</p>}
                          </div>
                          {n.time && (
                            <span className="ml-2 whitespace-nowrap text-xs text-neutral-500">{n.time}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Avatar / Profile — cek DB dulu */}
            <div>
              <ConnectWalletButton
                customTrigger={<HeaderAvatar address={address as `0x${string}` | undefined} />}
                dropdownAvatarSize="xs"
                dropdownAvatarClassName="!h-7 !w-7 sm:!h-8 sm:!w-8"
                customDropdownItems={walletDropdownItems}
              />
            </div>
          </>
        )}
      </div>

      {/* Boot: upsert profile otomatis saat connect */}
      <ProfileUpsertOnLogin />
    </header>
  );
}
