"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

import TaskPanel, { TaskItem } from "@/components/task/taskpanel";
import VideoInfoSection from "@/components/task/videoinfo";
import Comments from "@/components/task/comments";
import VideoPlayer from "@/components/task/videoplayer";
import { BuyVideoButton } from "@/components/payments/TreasuryButtons";
import { TaskPageSkeleton } from "@/components/skeletons/task-skeleton";
import type { RecommendedVideo, VideoInfo } from "@/components/task/types";
import type { Address } from "viem";

/* ============== Helpers ============== */
const safe = (s?: string | null, fb = "") => (typeof s === "string" && s.trim() ? s : fb);
const safeThumb = (s?: string | null) => safe(s, "/placeholder-thumb.png");
const shortenAddr = (addr?: string | null) => {
  const a = safe(addr);
  return a ? (a.length <= 12 ? a : `${a.slice(0, 6)}...${a.slice(-4)}`) : "";
};
const titleize = (s: string) =>
  s
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

/** Ambil alamat wallet user dari LocalStorage (Abstract/Wagmi session) */
function getAbstractAddr(): `0x${string}` | null {
  try {
    const raw =
      localStorage.getItem("wagmi.store") ||
      localStorage.getItem("abstract:session") ||
      localStorage.getItem("abstract_id") ||
      localStorage.getItem("wallet");
    if (!raw) return null;
    const m = raw.match(/0x[a-fA-F0-9]{40}/);
    return m ? (m[0].toLowerCase() as `0x${string}`) : null;
  } catch {
    return null;
  }
}

/* ============== Row type ============== */
type VideoRow = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  video_url: string | null;
  video_path?: string | null;
  thumb_url: string | null;
  abstract_id: string | null;
  creator_addr?: string | null;
  points_total?: number | null;
  tasks_json?: any;
  likes_count?: number | null;
  price_cents?: number;
  currency?: string;
  creator?: { username: string | null; avatar_url: string | null } | null;
  video_purchases?: Array<{ buyer_id: string }>;
};

export default function VideoPage() {
  const sp = useSearchParams();
  const idFromQuery = sp.get("id") || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [row, setRow] = useState<VideoRow | null>(null);
  const [reco, setReco] = useState<RecommendedVideo[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [hasCompletedTask, setHasCompletedTask] = useState<boolean>(false);
  const [taskPoints, setTaskPoints] = useState<number>(0);
  const [hasShared, setHasShared] = useState<boolean>(false);
  const [sharePoints, setSharePoints] = useState<number>(0);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);

  // wallet user (untuk komentar, like, follow dsb.)
  const [me, setMe] = useState<`0x${string}` | null>(null);
  
  useEffect(() => {
    // Polling untuk wallet address sampai ketemu
    const checkWallet = () => {
      const addr = getAbstractAddr();
      if (addr && addr !== me) {
        console.log('[Video Page] 💳 Wallet address detected:', addr);
        setMe(addr);
      }
    };
    
    // Check immediately
    checkWallet();
    
    // Poll every 500ms for max 5 seconds
    const interval = setInterval(checkWallet, 500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!me) {
        console.log('[Video Page] ⏱️ Wallet polling stopped - no wallet found after 5s');
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []); // Run once on mount

  // Re-check purchase saat wallet address berubah (dari null ke address)
  useEffect(() => {
    console.log('[Video Page] 👀 useEffect triggered - me:', me, 'row:', row ? row.id : 'null');
    
    if (!me || !row) {
      console.log('[Video Page] ⏭️ Skipping purchase check - missing wallet or video data');
      return;
    }
    
    console.log('[Video Page] 🔄 Wallet detected, re-checking purchase status...');
    
    (async () => {
      try {
        console.log('===========================================');
        console.log('[Video Page] 🔍 RE-CHECKING PURCHASE (Wallet Changed)');
        console.log('===========================================');
        console.log('[Video Page] User wallet:', me);
        console.log('[Video Page] Video ID:', row.id);
        
        // Cek langsung dari video_purchases
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("video_purchases")
          .select("id, buyer_id, created_at")
          .eq("video_id", row.id)
          .ilike("buyer_id", me)
          .maybeSingle();
        
        console.log('[Video Page] 📊 Purchase check result:', { purchaseData, purchaseError });
        
        if (purchaseData) {
          console.log('[Video Page] ✅ SUCCESS: Purchase found!');
          setHasPurchased(true);
        } else {
          // Fallback: get all purchases and filter
          const { data: purchaseList, error: listError } = await supabase
            .from("video_purchases")
            .select("id, buyer_id, created_at")
            .eq("video_id", row.id);
          
          console.log('[Video Page] 📋 All purchases:', purchaseList);
          console.log('[Video Page] 📋 List error:', listError);
          
          const hasPurch = purchaseList?.some(
            (p: any) => {
              const match = p.buyer_id?.toLowerCase() === me.toLowerCase();
              console.log(`  🔍 Comparing: "${p.buyer_id}" vs "${me}" => ${match}`);
              return match;
            }
          );
          
          if (hasPurch) {
            console.log('[Video Page] ✅ SUCCESS: Purchase found via filter!');
            setHasPurchased(true);
          } else {
            console.log('[Video Page] ❌ FAILED: No purchase found');
            setHasPurchased(false);
          }
        }
        
        // Cek progress untuk task dan share
        const { data: progressData } = await supabase
          .from("user_video_progress")
          .select("has_purchased, has_completed_task, points_from_task, has_shared, points_from_share")
          .eq("user_addr", me.toLowerCase())
          .eq("video_id", row.id)
          .maybeSingle();

        console.log('[Video Page] 📈 Progress data:', progressData);

        if (progressData) {
          if ((progressData as any).has_completed_task) {
            setHasCompletedTask(true);
            setTaskPoints((progressData as any).points_from_task || 0);
          }
          if ((progressData as any).has_shared) {
            setHasShared(true);
            setSharePoints((progressData as any).points_from_share || 0);
          }
          if ((progressData as any).has_purchased && !purchaseData) {
            console.log('[Video Page] ✅ Purchase found in progress table');
            setHasPurchased(true);
          }
        }
        
        console.log('===========================================');
        console.log('[Video Page] 🎯 Final hasPurchased state will be set to:', 
          purchaseData || (progressData as any)?.has_purchased || false);
        console.log('===========================================');
      } catch (error) {
        console.error('❌ Error re-checking purchase:', error);
      }
    })();
  }, [me, row]); // Trigger saat wallet atau row berubah

  useEffect(() => {
    // Reset state saat video ID berubah
    setRow(null);
    setReco([]);
    setTasks([]);
    setTotalPoints(0);
    setHasCompletedTask(false);
    setTaskPoints(0);
    setHasShared(false);
    setSharePoints(0);
    setHasPurchased(false);
    
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const selectCols = `
          id,
          title,
          description,
          category,
          video_url,
          video_path,
          thumb_url,
          abstract_id,
          points_total,
          tasks_json,
          likes_count,
          price_cents,
          currency,
          creator:profiles!videos_abstract_id_fkey(username,avatar_url),
          video_purchases(buyer_id)
        `;

        const oneReq = idFromQuery
          ? supabase.from("videos").select(selectCols).eq("id", idFromQuery).single()
          : supabase.from("videos").select(selectCols).order("created_at", { ascending: false }).limit(1).maybeSingle();

        const { data: one, error: e1 } = await oneReq;
        if (e1) throw e1;
        if (!one) throw new Error("Video tidak ditemukan.");

        if (!alive) return;
        setRow(one as VideoRow);

        // ====== tasks
        let pulled: TaskItem[] = [];
        let points = Number((one as any).points_total || 0) || 0;

        // Coba fetch dari video_tasks table terlebih dahulu
        try {
          const { data: taskRows, error: taskError } = await supabase
            .from("video_tasks")
            .select("id, order_no, question, options, points, answer_index")
            .eq("video_id", (one as any).id)
            .order("order_no", { ascending: true });

          if (taskRows && Array.isArray(taskRows) && taskRows.length > 0) {
            pulled = taskRows.map((r: any) => {
              let opts: string[] = [];
              const raw = (r as any).options;
              if (Array.isArray(raw)) opts = raw;
              else if (typeof raw === "string") {
                try {
                  const p = JSON.parse(raw);
                  opts = Array.isArray(p) ? p : [];
                } catch {
                  opts = raw.split("|").map((s) => s.trim()).filter(Boolean);
                }
              }
              return {
                id: String(r.id),
                question: String(r.question ?? ""),
                options: opts,
                points: typeof r.points === "number" ? r.points : undefined,
                answerIndex: typeof (r as any).answer_index === "number" ? (r as any).answer_index : undefined,
              };
            });
            if (!points) points = pulled.reduce((a, b) => a + (b.points || 0), 0);
          } else if (taskError) {
            console.log('[Video Page] video_tasks table not found or error, using tasks_json fallback:', taskError.message);
          }
        } catch (taskFetchError) {
          console.log('[Video Page] Error fetching from video_tasks, using tasks_json fallback:', taskFetchError);
        }

        // Fallback: gunakan tasks_json dari videos table
        if (pulled.length === 0 && Array.isArray((one as any).tasks_json)) {
          pulled = ((one as any).tasks_json as any[]).map((t, i) => ({
            id: `${(one as any).id}_${i}`,
            question: String(t?.question ?? ""),
            options: Array.isArray(t?.options) ? (t.options as string[]) : [],
            points: typeof t?.points === "number" ? t.points : undefined,
            answerIndex: typeof t?.answerIndex === "number" ? t.answerIndex : undefined,
          }));
          if (!points) points = pulled.reduce((a, b) => a + (b.points || 0), 0);
        }

        setTasks(pulled);
        setTotalPoints(points);

        // ====== Cek apakah user sudah pernah purchase, complete task, dan share
        if (me) {
          try {
            console.log('===========================================');
            console.log('[Video Page] 🔍 CHECKING PURCHASE STATUS');
            console.log('===========================================');
            console.log('[Video Page] User wallet:', me);
            console.log('[Video Page] User wallet (lowercase):', me.toLowerCase());
            console.log('[Video Page] Video ID:', (one as any).id);
            console.log('===========================================');
            
            // PRIORITAS 1: Cek langsung dari video_purchases (sumber utama)
            // Cek dengan case-insensitive menggunakan ilike atau langsung dengan lowercase
            const { data: purchaseData, error: purchaseError } = await supabase
              .from("video_purchases")
              .select("id, buyer_id, created_at")
              .eq("video_id", (one as any).id)
              .ilike("buyer_id", me) // Case-insensitive match
              .maybeSingle();
            
            console.log('[Video Page] 📊 Direct purchase query result:');
            console.log('  - Data:', purchaseData);
            console.log('  - Error:', purchaseError);
            
            if (purchaseData) {
              console.log('[Video Page] ✅ SUCCESS: User has purchased this video!');
              console.log('[Video Page] Purchase details:', purchaseData);
              setHasPurchased(true);
            } else {
              console.log('[Video Page] ⚠️ No purchase found with ilike, trying alternative...');
              
              // Fallback: coba query tanpa case sensitivity
              const { data: purchaseList, error: listError } = await supabase
                .from("video_purchases")
                .select("id, buyer_id, created_at")
                .eq("video_id", (one as any).id);
              
              console.log('[Video Page] 📋 All purchases for this video:');
              console.log('  - Count:', purchaseList?.length || 0);
              console.log('  - Purchases:', purchaseList);
              console.log('  - Error:', listError);
              
              // Manual check di client side
              const hasPurch = purchaseList?.some(
                (p: any) => {
                  const match = p.buyer_id?.toLowerCase() === me.toLowerCase();
                  console.log(`  - Comparing "${p.buyer_id?.toLowerCase()}" === "${me.toLowerCase()}" => ${match}`);
                  return match;
                }
              );
              
              if (hasPurch) {
                console.log('[Video Page] ✅ SUCCESS: Purchase found via client-side filter!');
                setHasPurchased(true);
              } else {
                console.log('[Video Page] ❌ FAILED: No matching purchase found');
              }
            }
            
            // PRIORITAS 2: Cek progress untuk task dan share status
            const { data: progressData } = await supabase
              .from("user_video_progress")
              .select("has_purchased, has_completed_task, points_from_task, has_shared, points_from_share")
              .eq("user_addr", me.toLowerCase())
              .eq("video_id", (one as any).id)
              .maybeSingle();

            console.log('[Video Page] 📈 Progress data:', progressData);

            if (progressData) {
              // Jika ada data progress, gunakan untuk task dan share
              if ((progressData as any).has_completed_task) {
                setHasCompletedTask(true);
                setTaskPoints((progressData as any).points_from_task || 0);
                console.log('[Video Page] ✅ Task completed previously');
              }
              if ((progressData as any).has_shared) {
                setHasShared(true);
                setSharePoints((progressData as any).points_from_share || 0);
                console.log('[Video Page] ✅ Already shared');
              }
              
              // Double-check purchase status dari progress juga
              if (!purchaseData && (progressData as any).has_purchased) {
                console.log('[Video Page] ✅ Purchase found in user_video_progress (backup)');
                setHasPurchased(true);
              }
            }
            
            console.log('===========================================');
            console.log('[Video Page] 🏁 FINAL RESULT:');
            console.log('  - Has Purchased:', purchaseData || (progressData as any)?.has_purchased ? 'YES ✅' : 'NO ❌');
            console.log('  - Video will be:', purchaseData || (progressData as any)?.has_purchased ? 'UNLOCKED 🔓' : 'LOCKED 🔒');
            console.log('===========================================');
            
          } catch (error) {
            console.error("❌ Error fetching user purchase/progress:", error);
          }
        } else {
          console.log('[Video Page] ⚠️ No wallet address found, user not logged in');
        }

        // ====== rekomendasi (ambil beberapa, nanti panel menampilkan 3 random)
        const userWallet = me?.toLowerCase();
        
        const { data: others } = await supabase
          .from("videos")
          .select(`
            id, 
            title, 
            thumb_url, 
            abstract_id,
            points_total,
            price_cents,
            currency,
            creator:profiles!videos_abstract_id_fkey(
              username,
              avatar_url
            ),
            video_purchases(buyer_id)
          `)
          .neq('id', (one as any).id)
          .order('created_at', { ascending: false })
          .limit(12);

        if (alive && others) {
          const mapped: RecommendedVideo[] = others.map((v: any) => {
            const hasPrice = v.price_cents > 0;
            const purchases = v.video_purchases || [];
            const isPurchased = userWallet && purchases.some(
              (p: any) => p.buyer_id?.toLowerCase() === userWallet
            );
            
            return {
              id: v.id,
              title: safe(v.title, "Untitled"),
              creator: {
                name: v?.creator?.username || undefined,
                wallet: v?.abstract_id || undefined
              },
              thumbnail: safeThumb(v.thumb_url),
              points: v?.points_total || 0,
              price: v.price_cents ? {
                amount: v.price_cents / 100,
                currency: v.currency || 'USD'
              } : undefined,
              isLocked: hasPrice && !isPurchased // Video terkunci hanya jika berbayar dan belum dibeli
            };
          });

          setReco(mapped);
        }
      } catch (e: any) {
        if (alive) setErr(e?.message || "Gagal memuat data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [idFromQuery, me]); // tambahkan me ke dependencies

  // Bentuk data untuk komponen info (termasuk tag dari category)
  const videoInfo: VideoInfo | null = useMemo(() => {
    if (!row) return null;
    const wallet = safe(row.abstract_id, "");
    const walletShort = wallet ? shortenAddr(wallet) : "—";
    const displayName = safe(row.creator?.username, walletShort || "Unknown");
    const tags = row.category ? [titleize(row.category)] : [];

    return {
      title: safe(row.title, "Untitled"),
      views: "Streaming",
      heroImage: safeThumb(row.thumb_url),
      description: safe(row.description, "No description has been provided by the creator."),
      creator: {
        name: displayName,
        followers: walletShort,
        avatar: safe(row.creator?.avatar_url, ""),
        wallet,
      },
      tags,
    };
  }, [row]);

  const videoSrc = useMemo(() => (row ? safe(row.video_url, row.video_path || "") : ""), [row]);
  const initialLikes = row?.likes_count ?? 0;

  const isLocked = useMemo(() => {
    if (!row) return false;
    
    // Jika video gratis, tidak pernah locked
    if (!row.price_cents || row.price_cents === 0) return false;
    
    // Jika tidak ada wallet (belum connect), locked
    if (!me) return true;
    
    // Gunakan state hasPurchased yang sudah di-cek dari database
    return !hasPurchased;
  }, [row, me, hasPurchased]);

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      {err && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {err}
        </div>
      )}

      {loading && <TaskPageSkeleton />}

      {!loading && row && (
        <>
          <div className="grid grid-cols-12 items-stretch gap-8">
            {/* Player kiri */}
            <section className="col-span-12 lg:col-span-8">
              <VideoPlayer 
                videoUrl={videoSrc || ''} 
                thumbnailUrl={safeThumb(row.thumb_url)}
                isLocked={isLocked}
                price={row.price_cents ? {
                  amount: row.price_cents / 100,
                  currency: row.currency || 'USD'
                } : undefined}
                points={totalPoints}
                unlockButtonElement={
                  isLocked && (row.abstract_id || row.creator_addr) && row.price_cents ? (
                    <BuyVideoButton
                      videoId={row.id}
                      creator={(row.creator_addr || row.abstract_id) as Address}
                      priceUsd={row.price_cents / 100}
                      className="mt-4 px-6 py-2 bg-[var(--primary-500)] text-white rounded-full font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onSuccess={() => {
                        // Reload halaman setelah 2 detik agar toast terlihat
                        setTimeout(() => {
                          window.location.reload();
                        }, 2000);
                      }}
                    >
                      Unlock Now
                    </BuyVideoButton>
                  ) : undefined
                }
              />
            </section>

            {/* Panel task kanan */}
            <aside className="col-span-12 lg:col-span-4">
              <TaskPanel 
                className="h-full" 
                tasks={tasks} 
                totalPoints={totalPoints}
                isLocked={isLocked}
                videoId={row.id}
                userAddress={me || undefined}
                hasCompletedTask={hasCompletedTask}
                earnedTaskPoints={taskPoints}
              />
            </aside>

            {/* Info + rekomendasi */}
            {videoInfo && (
              <VideoInfoSection
                video={videoInfo}
                recommendations={reco}
                videoId={row.id}
                initialLikes={initialLikes}
                sharePoints={Math.floor(totalPoints * 0.4)} // 40% dari total point untuk share
                totalPoints={totalPoints} // Total point dari video
                userAddress={me || undefined}
                hasShared={hasShared}
                claimedSharePoints={sharePoints}
              />
            )}
          </div>

          {/* Comments tersambung DB */}
          <Comments 
            videoId={row.id} 
            currentUserAddr={me}
            isLocked={isLocked}
          />
        </>
      )}
    </main>
  );
}
