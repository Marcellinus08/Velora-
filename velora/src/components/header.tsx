// src/components/header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits, type Abi } from "viem";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { AbstractProfile } from "@/components/abstract-profile";
import ProfileUpsertOnLogin from "@/components/boot/profile-upsert-on-login";
import { getContractWithCurrentChain } from "@/lib/chain-utils";

/* ===== Minimal ERC20 ABI (read-only) ===== */
const ERC20_MIN_ABI = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
] as const satisfies Abi;

/* ===== Helpers ===== */
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
const short = (addr?: `0x${string}`) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "-");

/* ============== Hook terpadu: DB-first, fallback Abstract ============== */
type DbProfile = { abstract_id: string; username: string | null; avatar_url: string | null };

function useProfileAvatar(address?: `0x${string}`) {
  const addr = useMemo(() => (address ? address.toLowerCase() : ""), [address]);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!addr || !/^0x[a-f0-9]{40}$/.test(addr)) {
        if (alive) {
          setUsername(null);
          setAvatarUrl(null);
        }
        return;
      }

      try {
        // 1) DB dulu (tanpa cache + cache buster)
        const r = await fetch(`/api/profiles/${addr}?t=${Date.now()}`, { cache: "no-store" });
        let db: DbProfile | null = null;
        if (r.ok) db = (await r.json()) as DbProfile;

        const dbUser = db?.username ?? null;
        const dbAvatar = db?.avatar_url ?? null;

        if (alive) setUsername(dbUser);

        if (dbAvatar) {
          // pakai avatar upload user
          if (alive) setAvatarUrl(`${dbAvatar}?v=${Date.now()}`);
          return;
        }

        // 2) fallback ke Abstract jika DB tidak punya avatar
        try {
          const ra = await fetch(`/api/abstract/user/${addr}`, { cache: "force-cache" });
          if (ra.ok) {
            const j = await ra.json();
            const abs: string | null = j?.profilePicture || j?.avatar || j?.imageUrl || null;
            if (alive) setAvatarUrl(abs ?? null);
          } else if (alive) {
            setAvatarUrl(null);
          }
        } catch {
          if (alive) setAvatarUrl(null);
        }
      } catch {
        if (alive) {
          setUsername(null);
          setAvatarUrl(null);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [addr]);

  return { username, avatarUrl };
}

/* ============== Avatar kecil (trigger) ============== */
function HeaderAvatar({
  address,
  avatarUrlOverride,
}: {
  address?: `0x${string}`;
  avatarUrlOverride?: string | null;
}) {
  return (
    <div className="rounded-full ring-2 ring-transparent hover:ring-[rgba(124,58,237,0.45)]">
      {avatarUrlOverride ? (
        <img
          src={avatarUrlOverride}
          alt="Avatar"
          className="block rounded-full object-cover h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
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

/* ===== Helper Material Icon (Round) ===== */
const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-icons-round ${className}`} aria-hidden="true">
    {name}
  </span>
);

/* =================== Header =================== */
type Notif = { id: string; title: string; body?: string; time?: string; unread?: boolean };
const RECENT_KEY = "vh_recent_queries";
const POLL_MS = 60_000;

export default function Header() {
  const router = useRouter();
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;
  const { logout } = useLoginWithAbstract();

  // === gunakan hook terpadu (DB-first, fallback Abstract) ===
  const { username: dbUsername, avatarUrl } = useProfileAvatar(address as `0x${string}` | undefined);

  /* ========= USDC.e balance ========= */
  const client = usePublicClient();
  const [usdceText, setUsdceText] = useState<string>("$0");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    function start() {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (document.visibilityState === "visible") void refreshUsdce();
      }, POLL_MS);
    }
    function stop() {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    if (isConnected) start();
    else stop();

    const onVis = () => {
      if (document.visibilityState === "visible") void refreshUsdce();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, address, isConnected]);

  /* ========= Search ========= */
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

  function handleVoice() {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search tidak didukung oleh browser ini. Coba Chrome/Edge desktop.");
      return;
    }
    const isSecure = location.protocol === "https:" || location.hostname === "localhost";
    if (!isSecure) {
      alert("Voice search memerlukan HTTPS (kecuali di localhost).");
      return;
    }
    try {
      const rec = new SR();
      rec.lang = "id-ID";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript as string;
        if (!text) return;
        setQ(text);
        saveRecent(text);
        router.push(`/search?q=${encodeURIComponent(text)}`);
      };
      rec.onerror = (e: any) => {
        const type = e?.error;
        if (type === "not-allowed" || type === "service-not-allowed") {
          alert("Izin mikrofon ditolak. Cek permission di browser.");
        } else if (type === "no-speech") {
          alert("Tidak ada suara terdeteksi. Coba lagi.");
        } else if (type === "audio-capture") {
          alert("Mikrofon tidak terdeteksi.");
        } else {
          alert("Voice search gagal. Coba lagi.");
        }
      };
      rec.start();
    } catch {
      alert("Voice search gagal diinisialisasi.");
    }
  }

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
          <MI name="menu" className="text-[14px] leading-none" />
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
          <form onSubmit={onSubmit} className="flex w-full items-center" role="search">
            <div className="relative flex min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <MI name="search" className="text-[14px] text-neutral-400" />
              </span>

              {/* type=text supaya tidak ada tombol clear bawaan */}
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setOpenSug(true)}
                className="h-10 w-full rounded-l-full border border-neutral-700 bg-neutral-950 pl-11 pr-[3.5rem] text-base text-neutral-50 placeholder:text-neutral-400 outline-none focus:border-neutral-500"
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
                  className="absolute inset-y-0 right-16 my-1 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                  aria-label="Clear text"
                  title="Clear"
                >
                  <MI name="close" className="text-[12px]" />
                </button>
              )}

              <button
                type="submit"
                className="h-10 w-16 rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                aria-label="Cari"
                title="Cari"
              >
                <MI name="search" className="text-[14px]" />
              </button>
            </div>

            {/* Voice button */}
            <button
              type="button"
              onClick={handleVoice}
              className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              aria-label="Pencarian suara"
              title="Pencarian suara"
            >
              <MI name="keyboard_voice" className="text-[14px]" />
            </button>
          </form>

          {/* Suggestion */}
          {openSug && ((recent.length > 0) || q) && (
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
                {[...new Set([...recent, ...(q ? ["tutorial","olahraga","crypto","masak","pendidikan","fotografi"].filter(s=>s.toLowerCase().includes(q.toLowerCase())):[])])]
                  .slice(0,7)
                  .map((s) => {
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
                            <MI name="close" className="text-[12px]" />
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
            <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">
              <div className="flex items-center gap-2">
                <MI name="star" className="text-[14px] text-yellow-400" />
                <span className="text-sm font-semibold text-neutral-50">2.500</span>
              </div>

              <div className="h-5 w-px bg-neutral-700" />

              <div className="flex items-center gap-2">
                <MI name="account_balance_wallet" className="text-[14px] text-[var(--primary-500)]" />
                <span className="text-sm font-semibold text-neutral-50">USDC.e {usdceText}</span>
              </div>
            </div>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex size-10 cursor-pointer items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
                    aria-label="Tambah"
                    title="Tambah"
                  >
                    <MI name="add" className="text-[14px]" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="bottom" className="w-44">
                  <DropdownMenuItem onClick={() => router.push("/ads")}>Create ads</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/upload")}>Upload video</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
                    aria-label="Notification"
                    title="Notification"
                  >
                    <MI name="notifications" className="text-[14px]" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-[var(--primary-500)]" />
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="bottom" className="w-80">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <h3 className="text-sm font-semibold text-neutral-100">Notifications</h3>
                  </div>

                  <div className="flex flex-col items-center px-6 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/70">
                      <MI name="notifications_none" className="text-[22px] text-neutral-300" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-neutral-200">No notifications yet</p>
                    <p className="mt-1 text-xs text-neutral-400">Notifications will appear here later.</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
                    aria-label="Open wallet menu"
                    title="Open wallet menu"
                  >
                    <HeaderAvatar
                      address={address as `0x${string}`}
                      avatarUrlOverride={avatarUrl}
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="bottom" className="w-72 p-0 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-[var(--primary-500)]">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <AbstractProfile size="xs" showTooltip={false} className="!h-8 !w-8" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-neutral-100">
                        {dbUsername ?? short(address as `0x${string}`)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span>{short(address as `0x${string}`)}</span>
                        <button
                          className="rounded p-1 hover:bg-neutral-800"
                          aria-label="Copy address"
                          onClick={() => {
                            if (address) navigator.clipboard?.writeText(address);
                          }}
                          title="Copy address"
                        >
                          <MI name="content_copy" className="text-[12px]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">{walletDropdownItems}</div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>

      <ProfileUpsertOnLogin />
    </header>
  );
}
