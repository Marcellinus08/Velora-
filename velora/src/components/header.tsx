// "use client";

// import dynamic from "next/dynamic";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { FormEvent, useEffect, useRef, useState } from "react";

// import {
//   useLoginWithAbstract,
//   useGlobalWalletSignerAccount,
// } from "@abstract-foundation/agw-react";

// // 🔌 Button tanpa SSR (makin aman dari hydration)
// const ConnectWalletButton = dynamic(
//   () => import("@/components/connect-wallet-button").then((m) => m.ConnectWalletButton),
//   { ssr: false }
// );

// type SpeechRec = typeof window extends any
//   ? (Window & { webkitSpeechRecognition?: any; SpeechRecognition?: any })
//   : never;

// type Notif = {
//   id: string;
//   title: string;
//   body?: string;
//   time?: string;
//   unread?: boolean;
// };

// const RECENT_KEY = "vh_recent_queries";
// const short = (addr?: `0x${string}`) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

// export default function Header() {
//   const router = useRouter();

//   // Wallet state
//   const { login, logout } = useLoginWithAbstract();
//   const { address, status } = useGlobalWalletSignerAccount();

//   // Hindari mismatch: jangan pakai state wallet buat branching sampai mounted
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   const isConnected = mounted && status === "connected" && !!address;

//   // --- Search ---
//   const [q, setQ] = useState("");
//   const [openSug, setOpenSug] = useState(false);
//   const [recent, setRecent] = useState<string[]>([]);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // --- Menus ---
//   const [addOpen, setAddOpen] = useState(false);
//   const addRef = useRef<HTMLDivElement>(null);

//   const [notifOpen, setNotifOpen] = useState(false);
//   const notifRef = useRef<HTMLDivElement>(null);
//   const [notifications] = useState<Notif[]>([]);
//   const unreadCount = notifications.filter((n) => n.unread).length;

//   const [profileOpen, setProfileOpen] = useState(false);
//   const profileRef = useRef<HTMLDivElement>(null);
//   const user = { name: "Velora User", email: "user@example.com" };

//   const closeAllMenus = () => {
//     setAddOpen(false);
//     setNotifOpen(false);
//     setProfileOpen(false);
//   };

//   useEffect(() => {
//     try {
//       const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
//       if (Array.isArray(saved)) setRecent(saved.slice(0, 8));
//     } catch {}
//   }, []);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
//         e.preventDefault();
//         inputRef.current?.focus();
//         setOpenSug(true);
//       }
//       if (e.key === "Escape") {
//         setOpenSug(false);
//         closeAllMenus();
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   useEffect(() => {
//     const onDocClick = (e: MouseEvent) => {
//       if (!containerRef.current?.contains(e.target as Node)) setOpenSug(false);
//       if (!addRef.current?.contains(e.target as Node)) setAddOpen(false);
//       if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false);
//       if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
//     };
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, []);

//   function saveRecent(query: string) {
//     const list = [query, ...recent.filter((x) => x !== query)].slice(0, 8);
//     setRecent(list);
//     localStorage.setItem(RECENT_KEY, JSON.stringify(list));
//   }
//   function onSubmit(e: FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const query = q.trim();
//     if (!query) return;
//     saveRecent(query);
//     setOpenSug(false);
//     closeAllMenus();
//     router.push(`/search?q=${encodeURIComponent(query)}`);
//   }
//   function clear() {
//     setQ("");
//     setOpenSug(true);
//     inputRef.current?.focus();
//   }
//   function voice() {
//     const w = window as unknown as SpeechRec;
//     const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
//     if (!SR) return alert("Voice search tidak didukung di browser ini.");
//     const rec = new SR();
//     rec.lang = "id-ID";
//     rec.onresult = (e: any) => {
//       const text = e.results[0][0].transcript as string;
//       setQ(text);
//       saveRecent(text);
//       router.push(`/search?q=${encodeURIComponent(text)}`);
//     };
//     rec.start();
//   }

//   const quick = ["tutorial", "olahraga", "crypto", "masak", "pendidikan", "fotografi"];
//   const filtered = [...recent, ...quick]
//     .filter((s, i, a) => a.indexOf(s) === i)
//     .filter((s) => (q ? s.toLowerCase().includes(q.toLowerCase()) : true))
//     .slice(0, 7);

//   function removeRecent(term: string) {
//     const list = recent.filter((x) => x !== term);
//     setRecent(list);
//     localStorage.setItem(RECENT_KEY, JSON.stringify(list));
//   }
//   function clearAllRecent() {
//     setRecent([]);
//     localStorage.removeItem(RECENT_KEY);
//   }

//   return (
//     <header
//       className="sticky top-0 z-20 grid w-full items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 py-2 sm:px-6 lg:px-8
//                  grid-cols-[auto_1fr_auto] md:[grid-template-columns:var(--sidebar-w,16rem)_1fr_auto]"
//     >
//       {/* Kolom 1: Logo */}
//       <div className="flex items-center gap-4">
//         <button
//           className="flex items-center justify-center rounded-full p-2 text-neutral-50 hover:bg-neutral-800 md:hidden"
//           aria-label="Buka menu"
//         >
//           <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
//             <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
//           </svg>
//         </button>

//         <Link href="/">
//           <Image
//             src="/logo.png"
//             alt="Velora Logo"
//             width={512}
//             height={128}
//             priority
//             className="h-[44px] w-auto sm:h-[42px] lg:h-[46px]"
//           />
//         </Link>
//       </div>

//       {/* Kolom 2: Search */}
//       <div className="flex justify-start">
//         <div ref={containerRef} className="relative w-full max-w-[720px]">
//           <form onSubmit={onSubmit} className="flex w-full items-center">
//             <div className="relative flex min-w-0 flex-1">
//               <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
//                 <svg className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                   <path
//                     fillRule="evenodd"
//                     d="M12.9 14.32a8 8 0 111.414-1.414l3.39 3.39a1 1 0 01-1.414 1.415l-3.39-3.39zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </span>

//               <input
//                 ref={inputRef}
//                 type="search"
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//                 onFocus={() => setOpenSug(true)}
//                 className="h-10 w-full rounded-l-full border border-neutral-700 bg-neutral-950 pl-11 pr-[3.5rem] text-base text-neutral-50 placeholder:text-neutral-400 outline-none focus:border-neutral-500"
//                 placeholder="Search"
//                 aria-label="Search"
//                 autoComplete="off"
//                 enterKeyHint="search"
//               />

//               {q && (
//                 <button
//                   type="button"
//                   onClick={clear}
//                   className="absolute inset-y-0 right-16 my-1 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
//                   aria-label="Bersihkan"
//                   title="Bersihkan"
//                 >
//                   <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
//                     <path
//                       fillRule="evenodd"
//                       d="M10 8.586l3.536-3.536a1 1 0 111.415 1.415L11.414 10l3.536 3.536a1 1 0 11-1.415 1.414L10 11.414l-3.536 3.536a1 1 0 01-1.415-1.415L8.586 10 5.05 6.464A1 1 0 016.464 5.05L10 8.586z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//               )}

//               <button
//                 type="submit"
//                 className="h-10 w-16 rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
//                 aria-label="Cari"
//                 title="Cari"
//               >
//                 <svg className="mx-auto h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                   <path
//                     fillRule="evenodd"
//                     d="M12.9 14.32a8 8 0 111.414-1.414l3.39 3.39a1 1 0 01-1.414 1.415l-3.39-3.39zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <button
//               type="button"
//               onClick={voice}
//               className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
//               aria-label="Pencarian suara"
//               title="Pencarian suara"
//             >
//               <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
//                 <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0013.9 1H19a7 7 0 00-2-1zM11 19.93V22h2v-2.07A8.001 8.001 0 0020 12h-2a6 6 0 11-12 0H4a8.001 8.001 0 007 7.93z" />
//               </svg>
//             </button>
//           </form>

//           {openSug && (filtered.length > 0 || q) && (
//             <div className="absolute left-0 right-0 top-[44px] mx-auto w-full max-w-[720px] rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
//               {recent.length > 0 && (
//                 <div className="flex items-center justify-between px-4 py-2 text-xs text-neutral-400">
//                   <span>Recent searches</span>
//                   <button
//                     onMouseDown={(e) => e.preventDefault()}
//                     onClick={clearAllRecent}
//                     className="rounded-md px-2 py-1 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
//                   >
//                     Clear all
//                   </button>
//                 </div>
//               )}

//               <ul className="py-2">
//                 {filtered.map((s) => {
//                   const isRecent = recent.includes(s);
//                   return (
//                     <li key={s} className="group relative">
//                       <button
//                         onMouseDown={(e) => e.preventDefault()}
//                         onClick={() => {
//                           setQ(s);
//                           saveRecent(s);
//                           router.push(`/search?q=${encodeURIComponent(s)}`);
//                           setOpenSug(false);
//                         }}
//                         className="flex w-full items-center gap-3 px-4 py-2 pr-12 text-left text-sm text-neutral-200 hover:bg-neutral-800"
//                       >
//                         {isRecent ? (
//                           <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
//                             <path d="M12 8v5l4 2-.75 1.33L11 14V8h1z" />
//                             <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
//                           </svg>
//                         ) : (
//                           <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
//                             <path
//                               fillRule="evenodd"
//                               d="M12.9 14.32a8 8 0 111.414-1.414l3.39 3.39a1 1 0 01-1.414 1.415l-3.39-3.39zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
//                               clipRule="evenodd"
//                             />
//                           </svg>
//                         )}
//                         <span className="truncate">{s}</span>
//                       </button>

//                       {isRecent && (
//                         <button
//                           onMouseDown={(e) => e.preventDefault()}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeRecent(s);
//                           }}
//                           aria-label="Remove from history"
//                           title="Remove from history"
//                           className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 group-hover:flex"
//                         >
//                           <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
//                             <path
//                               fillRule="evenodd"
//                               d="M11.414 10l3.536-3.536a1 1 0 10-1.414-1.414L10 8.586 6.464 5.05A1 1 0 105.05 6.464L8.586 10l-3.536 3.536a1 1 0 001.414-1.414L11.414 10z"
//                               clipRule="evenodd"
//                             />
//                           </svg>
//                         </button>
//                       )}
//                     </li>
//                   );
//                 })}
//                 {q && <li className="px-4 pt-1 text-xs text-neutral-500">Press Enter to search “{q}”.</li>}
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Kolom 3: kanan */}
//       <div className="flex items-center gap-2 sm:gap-4">
//         {!isConnected ? (
//           <ConnectWalletButton className="min-w-28 px-4" />
//         ) : (
//           <>
//             {/* Badge poin & saldo */}
//             <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">
//               <div className="flex items-center gap-2">
//                 <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 256 256">
//                   <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41ZM189.5,149.31a16.46,16.46,0,0,0-4.75,17.47l8.43,49.14-44.13-23.2a16.51,16.51,0,0,0-15.1,0L90,192.72l8.43-49.14a16.46,16.46,0,0,0-4.75-17.47L58,114.53,107.29,107a16.43,16.43,0,0,0,12.39-9l21.86-43.66,21.86,43.66a16.43,16.43,0,0,0,12.39,9L224,114.53Z"></path>
//                 </svg>
//                 <span className="text-sm font-semibold text-neutral-50">2.500</span>
//               </div>
//               <div className="h-5 w-px bg-neutral-700" />
//               <div className="flex items-center gap-2">
//                 <svg className="h-5 w-5 text-[var(--primary-500)]" fill="currentColor" viewBox="0 0 256 256">
//                   <path d="M224,72H48A24,24,0,0,0,24,96V192a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V160H192a8,8,0,0,1,0-16h32V96A24,24,0,0,0,224,72ZM40,96a8,8,0,0,1,8-8H224a8,8,0,0,1,8,8v48H192a24,24,0,0,0-24,24v16H48a8,8,0,0,1-8-8Z"></path>
//                 </svg>
//                 <span className="text-sm font-semibold text-neutral-50">Rp 500.000</span>
//               </div>
//             </div>

//             {/* Tombol + */}
//             <div ref={addRef} className="relative">
//               <button
//                 type="button"
//                 aria-haspopup="menu"
//                 aria-expanded={addOpen}
//                 aria-controls="add-menu"
//                 onClick={() => {
//                   setAddOpen((v) => !v);
//                   setNotifOpen(false);
//                   setProfileOpen(false);
//                 }}
//                 className="flex size-10 cursor-pointer items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
//                 aria-label="Tambah"
//                 title="Tambah"
//               >
//                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" clipRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
//                 </svg>
//               </button>

//               {addOpen && (
//                 <div
//                   id="add-menu"
//                   role="menu"
//                   className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/30"
//                 >
//                   <Link
//                     href="/ads"
//                     role="menuitem"
//                     className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800"
//                     onClick={closeAllMenus}
//                   >
//                     <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
//                       <path d="M15 8.5V5l6-3v20l-6-3v-3.5l-2.5 1H8a3 3 0 01-3-3V9a3 3 0 013-3h4.5l2.5 1.5zM6 9v6a1 1 0 001 1h4v-8H7a1 1 0 00-1 1z" />
//                     </svg>
//                     Create ads
//                   </Link>
//                   <div className="h-px bg-neutral-800" />
//                   <Link
//                     href="/upload"
//                     role="menuitem"
//                     className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800"
//                     onClick={closeAllMenus}
//                   >
//                     <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
//                       <path d="M12 3l4 4h-3v6h-2V7H8l4-4zM5 18h14v2H5v-2z" />
//                     </svg>
//                     Upload video
//                   </Link>
//                 </div>
//               )}
//             </div>

//             {/* Notifikasi */}
//             <div ref={notifRef} className="relative">
//               <button
//                 type="button"
//                 aria-haspopup="dialog"
//                 aria-expanded={notifOpen}
//                 aria-controls="notif-panel"
//                 onClick={() => {
//                   setNotifOpen((v) => !v);
//                   setAddOpen(false);
//                   setProfileOpen(false);
//                 }}
//                 className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
//                 aria-label="Notification"
//                 title="Notification"
//               >
//                 <svg fill="currentColor" height="20" width="20" viewBox="0 0 256 256">
//                   <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
//                 </svg>
//                 {unreadCount > 0 && <span className="absolute right-2 top-2 block h-2 w-2 rounded-full bg-[var(--primary-500)]" />}
//               </button>

//               {notifOpen && (
//                 <div
//                   id="notif-panel"
//                   role="dialog"
//                   aria-labelledby="notif-title"
//                   className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/30"
//                 >
//                   <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
//                     <h3 id="notif-title" className="text-sm font-semibold text-neutral-100">
//                       Notifications
//                     </h3>
//                   </div>

//                   {notifications.length === 0 ? (
//                     <div className="flex flex-col items-center px-6 py-8 text-center">
//                       <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/70">
//                         <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-300" fill="currentColor">
//                           <path d="M18 16l1 2H5l1-2c.667-1.333 1-3.667 1-7a5 5 0 1110 0c0 3.333.333 5.667 1 7zM9 19a3 3 0 006 0H9z" />
//                         </svg>
//                       </div>
//                       <p className="mt-3 text-sm font-medium text-neutral-200">No notifications yet</p>
//                       <p className="mt-1 text-xs text-neutral-400">Notifications will appear here later.</p>
//                     </div>
//                   ) : (
//                     <ul className="max-h-80 divide-y divide-neutral-800 overflow-auto">
//                       {notifications.map((n) => (
//                         <li key={n.id} className="flex gap-3 px-4 py-3 hover:bg-neutral-800/60">
//                           <div
//                             className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
//                             style={{ backgroundColor: n.unread ? "var(--primary-500)" : "transparent" }}
//                           />
//                           <div className="min-w-0 flex-1">
//                             <p className="truncate text-sm font-medium text-neutral-100">{n.title}</p>
//                             {n.body && <p className="truncate text-xs text-neutral-400">{n.body}</p>}
//                           </div>
//                           {n.time && <span className="ml-2 whitespace-nowrap text-xs text-neutral-500">{n.time}</span>}
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Profil */}
//             <div ref={profileRef} className="relative">
//               <button
//                 type="button"
//                 aria-haspopup="menu"
//                 aria-expanded={profileOpen}
//                 aria-controls="profile-menu"
//                 onClick={() => {
//                   setProfileOpen((v) => !v);
//                   setAddOpen(false);
//                   setNotifOpen(false);
//                 }}
//                 className="flex size-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 ring-1 ring-neutral-700/60 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
//                 aria-label="Profil"
//                 title={address ? `Connected: ${short(address)}` : "Profil"}
//               >
//                 <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
//                   <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
//                   <path fillRule="evenodd" clipRule="evenodd" d="M4 19c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4v-1z" />
//                 </svg>
//               </button>

//               {profileOpen && (
//                 <div
//                   id="profile-menu"
//                   role="menu"
//                   className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/30"
//                 >
//                   <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200">
//                       <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
//                         <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
//                         <path fillRule="evenodd" clipRule="evenodd" d="M4 19c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4v-1z" />
//                       </svg>
//                     </div>
//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-semibold text-neutral-100">{user.name}</p>
//                       <p className="truncate text-xs text-neutral-400">
//                         {address ? short(address as `0x${string}`) : user.email}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="py-1">
//                     <Link
//                       href="/profile"
//                       role="menuitem"
//                       className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800"
//                       onClick={closeAllMenus}
//                     >
//                       <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
//                         <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
//                         <path d="M4 19c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4v-1z" />
//                       </svg>
//                       Profile
//                     </Link>

//                     <Link
//                       href="/studio"
//                       role="menuitem"
//                       className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800"
//                       onClick={closeAllMenus}
//                     >
//                       <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
//                         <path d="M4 6h16v10H4z" />
//                         <path d="M8 20h8v-2H8z" />
//                       </svg>
//                       Studio
//                     </Link>

//                     <Link
//                       href="/settings"
//                       role="menuitem"
//                       className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800"
//                       onClick={closeAllMenus}
//                     >
//                       <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
//                         <path d="M19.14 12.94a7.004 7.004 0 00.02-1.88l2.03-1.58-2-3.46-2.41.96a7.038 7.038 0 00-1.63-.95l-.37-2.55h-4l-.37-2.55c-.58.23-1.13.55-1.63.95l-2.41-.96-2 3.46 2.03 1.58a7.004 7.004 0 000 1.88L2.72 14.5l2 3.46 2.41-.96c.5.4 1.05.72 1.63.95l.37 2.55h4l.37-2.55c.58-.23 1.13-.55 1.63-.95l2.41.96 2-3.46-2.03-1.56zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/>
//                       </svg>
//                       Setting
//                     </Link>

//                     <div className="my-1 h-px bg-neutral-800" />

//                     <button
//                       onClick={() => {
//                         closeAllMenus();
//                         logout();
//                       }}
//                       className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-red-300 hover:bg-neutral-800"
//                     >
//                       <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
//                         <path d="M10 17l-1.41-1.41L12.17 12 8.59 8.41 10 7l5 5-5 5z" />
//                         <path d="M4 4h6v2H6v12h4v2H4z" />
//                       </svg>
//                       Disconnect
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </header>
//   );
// }




"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount, useBalance } from "wagmi";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { AbstractProfile } from "@/components/abstract-profile";

type Notif = {
  id: string;
  title: string;
  body?: string;
  time?: string;
  unread?: boolean;
};

const RECENT_KEY = "vh_recent_queries";
const short = (addr?: `0x${string}`) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

export default function Header() {
  const router = useRouter();
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;
  const { logout } = useLoginWithAbstract();

  // useBalance without `watch` (watch caused TS error). We'll use refetch polling below.
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}` | undefined,
  });

  // Poll balance every 15s while connected (safe alternative to `watch`)
  useEffect(() => {
    if (!address) return;
    // immediate refetch (in case connect just happened)
    void refetchBalance();
    const id = setInterval(() => {
      void refetchBalance();
    }, 15000); // 15 seconds
    return () => clearInterval(id);
  }, [address, refetchBalance]);

  // search state
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

  // notifications example (empty for now)
  const [notifications] = useState<Notif[]>([]);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const formattedBadgeBalance = balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : "0.0000 ETH";

  // quick suggestions + filtered (needed by search UI)
  const quick = ["tutorial", "olahraga", "crypto", "masak", "pendidikan", "fotografi"];
  const filtered = [...recent, ...quick]
    .filter((s, i, a) => a.indexOf(s) === i)
    .filter((s) => (q ? s.toLowerCase().includes(q.toLowerCase()) : true))
    .slice(0, 7);

  // wallet dropdown items for profile menu (used by ConnectWalletButton when connected)
  const walletDropdownItems = [
    <div key="profile-head" className="px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-200">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M4 19c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4v-1z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-neutral-100">Velora User</div>
          <div className="truncate text-xs text-neutral-400">{address ? short(address as `0x${string}`) : "Not connected"}</div>
        </div>
      </div>
    </div>,

    <DropdownMenuSeparator key="sep-1" />,

    <DropdownMenuItem key="profile" onClick={() => router.push("/profile")}>
      Profile
    </DropdownMenuItem>,
    <DropdownMenuItem key="studio" onClick={() => router.push("/studio")}>
      Studio
    </DropdownMenuItem>,
    <DropdownMenuItem key="setting" onClick={() => router.push("/settings")}>
      Setting
    </DropdownMenuItem>,

    <DropdownMenuSeparator key="sep-2" />,

    <DropdownMenuItem key="disconnect" onClick={() => logout()} className="text-destructive">
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
        <button className="flex items-center justify-center rounded-full p-2 text-neutral-50 hover:bg-neutral-800 md:hidden" aria-label="Buka menu">
          <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
        </button>

        <Link href="/" aria-label="Home">
          <Image src="/logo.png" alt="Velora Logo" width={512} height={128} priority className="h-[44px] w-auto sm:h-[42px] lg:h-[46px]" />
        </Link>
      </div>

      {/* Kolom 2: Search */}
      <div className="flex justify-start">
        <div ref={containerRef} className="relative w-full max-w-[720px]">
          <form onSubmit={onSubmit} className="flex w-full items-center">
            <div className="relative flex min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.39 3.39a1 1 0 01-1.414 1.415l-3.39-3.39zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd"/></svg>
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
                <button type="button" onClick={clear} className="absolute inset-y-0 right-16 my-1 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200" aria-label="Bersihkan">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 8.586l3.536-3.536a1 1 0 111.415 1.415L11.414 10l3.536 3.536a1 1 0 11-1.415 1.414L10 11.414l-3.536 3.536a1 1 0 01-1.415-1.415L8.586 10 5.05 6.464A1 1 0 016.464 5.05L10 8.586z" clipRule="evenodd"/></svg>
                </button>
              )}

              <button type="submit" className="h-10 w-16 rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700" aria-label="Cari" title="Cari">
                <svg className="mx-auto h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.39 3.39a1 1 0 01-1.414 1.415l-3.39-3.39zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" /></svg>
              </button>
            </div>

            {/* Voice button (keep existing behavior) */}
            <button type="button" onClick={() => {
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
            }} className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-neutral-700" aria-label="Pencarian suara" title="Pencarian suara">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0013.9 1H19a7 7 0 00-2-1zM11 19.93V22h2v-2.07A8.001 8.001 0 0020 12h-2a6 6 0 11-12 0H4a8.001 8.001 0 007 7.93z" /></svg>
            </button>
          </form>

          {openSug && (filtered.length > 0 || q) && (
            <div className="absolute left-0 right-0 top-[44px] mx-auto w-full max-w-[720px] rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70">
              {recent.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 text-xs text-neutral-400">
                  <span>Recent searches</span>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={clearAllRecent} className="rounded-md px-2 py-1 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100">Clear all</button>
                </div>
              )}

              <ul className="py-2">
                {filtered.map((s) => {
                  const isRecent = recent.includes(s);
                  return (
                    <li key={s} className="group relative">
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setQ(s); saveRecent(s); router.push(`/search?q=${encodeURIComponent(s)}`); setOpenSug(false); }} className="flex w-full items-center gap-3 px-4 py-2 pr-12 text-left text-sm text-neutral-200 hover:bg-neutral-800">
                        <span className="truncate">{s}</span>
                      </button>

                      {isRecent && (
                        <button onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); removeRecent(s); }} aria-label="Remove from history" title="Remove from history" className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100 group-hover:flex">
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor"><path fillRule="evenodd" d="M11.414 10l3.536-3.536a1 1 0 10-1.414-1.414L10 8.586 6.464 5.05A1 1 0 105.05 6.464L8.586 10l-3.536 3.536a1 1 0 001.414-1.414L11.414 10z" clipRule="evenodd" /></svg>
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
        {/* If NOT connected: only show the ConnectWalletButton */}
        {!isConnected ? (
          <div className="flex items-center gap-2">
            <ConnectWalletButton className="min-w-28 px-4" />
          </div>
        ) : (
          <>
            {/* Poin & saldo (connected) */}
            <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 256 256"><path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z"></path></svg>
                <span className="text-sm font-semibold text-neutral-50">2.500</span>
              </div>

              <div className="h-5 w-px bg-neutral-700" />

              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-[var(--primary-500)]" fill="currentColor" viewBox="0 0 256 256"><path d="M224,72H48A24,24,0,0,0,24,96V192a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V160H192a8,8,0,0,1,0-16h32V96A24,24,0,0,0,224,72ZM40,96a8,8,0,0,1,8-8H224a8,8,0,0,1,8,8v48H192a24,24,0,0,0-24,24v16H48a8,8,0,0,1-8-8Z"></path></svg>
                <span className="text-sm font-semibold text-neutral-50">{formattedBadgeBalance}</span>
              </div>
            </div>

            {/* Tombol + (Create ads / Upload video) */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex size-10 cursor-pointer items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40" aria-label="Tambah" title="Tambah">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" clipRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="bottom" className="w-44">
                  <DropdownMenuItem onClick={() => router.push("/ads")}>
                    Create ads
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/upload")}>
                    Upload video
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Notifikasi (dropdown with empty state) */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40" aria-label="Notification" title="Notification">
                    <svg fill="currentColor" height="20" width="20" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path></svg>
                    {unreadCount > 0 && <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-[var(--primary-500)]" />}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="bottom" className="w-80">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <h3 className="text-sm font-semibold text-neutral-100">Notifications</h3>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/70">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-300" fill="currentColor"><path d="M18 16l1 2H5l1-2c.667-1.333 1-3.667 1-7a5 5 0 1110 0c0 3.333.333 5.667 1 7zM9 19a3 3 0 006 0H9z"/></svg>
                      </div>
                      <p className="mt-3 text-sm font-medium text-neutral-200">No notifications yet</p>
                      <p className="mt-1 text-xs text-neutral-400">Notifications will appear here later.</p>
                    </div>
                  ) : (
                    <ul className="max-h-80 divide-y divide-neutral-800 overflow-auto">
                      {notifications.map((n) => (
                        <li key={n.id} className="flex gap-3 px-4 py-3 hover:bg-neutral-800/60">
                          <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: n.unread ? "var(--primary-500)" : "transparent" }} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-neutral-100">{n.title}</p>
                            {n.body && <p className="truncate text-xs text-neutral-400">{n.body}</p>}
                          </div>
                          {n.time && <span className="ml-2 whitespace-nowrap text-xs text-neutral-500">{n.time}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Profile: use AbstractProfile as trigger and pass walletDropdownItems */}
            <div>
              <ConnectWalletButton
                customTrigger={<div className="rounded-full ring-2 ring-transparent hover:ring-[rgba(124,58,237,0.45)]"><AbstractProfile size="sm" showTooltip /></div>}
                customDropdownItems={walletDropdownItems}
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
