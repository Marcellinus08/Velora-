"use client";

import { useEffect, useMemo, useState } from "react";
import AdForm from "./form";
import AdSummary from "./summary";
import PayPreviewModal from "./paymodal";
import { TREASURY_ADDRESS } from "@/config/abstract-contracts";
import type { CreateAdProps } from "./types";
import { toast } from "@/components/ui/toast";

const DURATION_DAYS = 3;
const PRICE_USD = 1;

const PAID_FLAG = "vh_ad_paid_preview_fixed";
const MIN_TITLE = 1;
const MIN_DESC = 1;

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function CreateAd({
  campaignId,
  paidTx = "",
  onPaid,
  myVideos = [],
  creatorAddr = "",
}: CreateAdProps) {
  // Slot availability state
  const [slotsInfo, setSlotsInfo] = useState<{
    activeCount: number;
    maxSlots: number;
    isFull: boolean;
    availableSlots: number;
    nextAvailableDate: string | null;
    message: string;
  } | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // User active campaign state
  const [userActiveCampaign, setUserActiveCampaign] = useState<{
    hasActiveCampaign: boolean;
    activeCampaign: {
      id: string;
      title: string;
      start_date: string;
      end_date: string;
    } | null;
    message: string;
  } | null>(null);
  const [loadingUserCampaign, setLoadingUserCampaign] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaURL, setMediaURL] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [ctaText, setCtaText] = useState<string>("Watch Now");

  const [paidPreview, setPaidPreview] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [localTx, setLocalTx] = useState<`0x${string}` | "">("");
  const [saving, setSaving] = useState(false);

  const ONCHAIN_ENABLED = Boolean(TREASURY_ADDRESS) && PRICE_USD > 0;

  // Check if user already has an active campaign
  useEffect(() => {
    const checkUserCampaign = async () => {
      if (!creatorAddr) {
        setLoadingUserCampaign(false);
        return;
      }

      try {
        const response = await fetch(`/api/campaigns/check-user-active?creatorAddr=${encodeURIComponent(creatorAddr)}`);
        const data = await response.json();
        
        if (response.ok && data.ok) {
          setUserActiveCampaign(data);
          console.log("👤 User campaign status:", data);
          
          if (data.hasActiveCampaign) {
            console.warn("⚠️ User already has an active campaign:", data.activeCampaign.title);
          }
        }
      } catch (error) {
        console.error("Failed to check user active campaign:", error);
      } finally {
        setLoadingUserCampaign(false);
      }
    };

    checkUserCampaign();
  }, [creatorAddr]);

  // Check campaign slots on mount
  useEffect(() => {
    const checkSlots = async () => {
      try {
        const response = await fetch('/api/campaigns/check-slots');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setSlotsInfo(data);
          console.log("📊 Campaign slots:", data);
          
          if (data.isFull) {
            console.warn("⚠️ All campaign slots are full!");
          }
        }
      } catch (error) {
        console.error("Failed to check campaign slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    checkSlots();
  }, []);

  useEffect(() => {
    if (!ONCHAIN_ENABLED) {
      setPaidPreview(
        typeof window !== "undefined" && sessionStorage.getItem(PAID_FLAG) === "1"
      );
    }
  }, [ONCHAIN_ENABLED]);

  useEffect(() => {
    if (!media) {
      if (mediaURL) URL.revokeObjectURL(mediaURL);
      setMediaURL(null);
      return;
    }
    const url = URL.createObjectURL(media);
    setMediaURL(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  const formValid =
    title.trim().length >= MIN_TITLE &&
    description.trim().length >= MIN_DESC &&
    media !== null &&
    selectedVideoId !== "" &&
    ctaText.trim().length > 0;

  useEffect(() => {
    console.log("Form validation:", {
      title: title.trim().length,
      description: description.trim().length,
      media: !!media,
      selectedVideoId,
      ctaText: ctaText.trim().length,
      formValid,
      myVideos: myVideos.length,
    });
  }, [title, description, media, selectedVideoId, ctaText, formValid, myVideos.length]);

  const paidOnChain = Boolean(paidTx || localTx);
  const isPaid = paidOnChain || paidPreview;

  const payDisabled = !formValid || userActiveCampaign?.hasActiveCampaign || slotsInfo?.isFull || false;
  const canPublish = formValid && isPaid;

  useEffect(() => {
    console.log("Payment Status:", {
      paidTx,
      localTx,
      paidOnChain,
      paidPreview,
      isPaid,
      canPublish,
      formValid,
    });
  }, [paidTx, localTx, paidOnChain, paidPreview, isPaid, canPublish, formValid]);

  const totalUsdText = useMemo(() => fmtUSD(PRICE_USD), []);
  const daysLabel = "days"; // Always plural since DURATION_DAYS = 3

  // Function to reset all form inputs
  function resetForm() {
    console.log("🔄 Resetting form inputs...");
    
    // Reset all form fields
    setTitle("");
    setDescription("");
    setMedia(null);
    setMediaURL(null);
    setSelectedVideoId("");
    setCtaText("Watch Now");
    
    // Reset payment states
    setPaidPreview(false);
    setLocalTx("");
    setSaving(false);
    setShowPayModal(false);
    
    // Clear session storage for paid preview
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(PAID_FLAG);
    }
    
    // Refresh user campaign status after creating a campaign
    const refreshUserCampaign = async () => {
      if (!creatorAddr) return;

      try {
        const response = await fetch(`/api/campaigns/check-user-active?creatorAddr=${encodeURIComponent(creatorAddr)}`);
        const data = await response.json();
        
        if (response.ok && data.ok) {
          setUserActiveCampaign(data);
          console.log("🔄 User campaign status refreshed:", data);
        }
      } catch (error) {
        console.error("Failed to refresh user campaign status:", error);
      }
    };

    // Refresh slots info after creating a campaign
    const refreshSlots = async () => {
      try {
        const response = await fetch('/api/campaigns/check-slots');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setSlotsInfo(data);
          console.log("🔄 Campaign slots refreshed:", data);
        }
      } catch (error) {
        console.error("Failed to refresh campaign slots:", error);
      }
    };

    // Execute refresh operations
    refreshUserCampaign();
    refreshSlots();
    
    console.log("✅ Form reset completed - ready for new campaign!");
  }

  function onChooseMedia(file: File | null) {
    setMedia(file);
  }

  function openPaymentPreview() {
    // Check if user already has an active campaign
    if (userActiveCampaign?.hasActiveCampaign) {
      const campaign = userActiveCampaign.activeCampaign;
      const endDate = campaign 
        ? new Date(campaign.end_date).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Unknown';

      toast.error(
        "You Already Have an Active Campaign!",
        `Active Campaign: "${campaign?.title}"\nCampaign ends: ${endDate}\n\nYou can only have one active campaign at a time. Please wait for your current campaign to end before creating a new one.`,
        6000
      );
      return;
    }

    // Check if slots are full before allowing payment
    if (slotsInfo?.isFull) {
      const nextDate = slotsInfo.nextAvailableDate 
        ? new Date(slotsInfo.nextAvailableDate).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : 'Unknown';

      toast.error(
        "All Campaign Slots Are Full!",
        `Current Status: ${slotsInfo.activeCount}/5 slots occupied\nNext available slot: ${nextDate}\n\nPlease wait for an active campaign to end before creating a new one.`,
        6000
      );
      return;
    }

    setShowPayModal(true);
  }
  function confirmPaymentPreview() {
    console.log("Payment preview confirmed, starting auto-publish...");
    setPaidPreview(true);
    if (typeof window !== "undefined") sessionStorage.setItem(PAID_FLAG, "1");
    setShowPayModal(false);

    toast.info(
      "Preview Payment Confirmed!",
      `Amount: ${fmtUSD(PRICE_USD)}\nDuration: ${DURATION_DAYS} days\n\nPublishing your campaign now...\nForm will be reset after success.`,
      5000
    );

    onPublishWithTx("preview" as `0x${string}`);
  }

  function handlePaidOnChain(tx: `0x${string}`) {
    console.log("On-chain payment successful, starting auto-publish...");
    setLocalTx(tx);
    onPaid?.(tx);

    toast.success(
      "Payment Successful!",
      `Transaction Hash: ${tx.slice(0, 10)}...${tx.slice(-8)}\nAmount: ${fmtUSD(PRICE_USD)}\n\nPublishing your campaign now...\nForm will be reset after success.`,
      6000
    );

    onPublishWithTx(tx);
  }

  async function onPublish() {
    console.log("onPublish called! canPublish:", canPublish, "saving:", saving);
    if (!canPublish) {
      console.log("Cannot publish - canPublish is false. isPaid:", isPaid, "formValid:", formValid);
      toast.error(
        "Cannot Publish",
        "Form not valid or payment not completed!",
        4000
      );
      return;
    }
    if (saving) return;

    // Route unified to server
    await onPublishWithTx((paidTx || localTx || "preview") as `0x${string}`);
  }

  // === Main change: send data to server API (service role) ===
  async function onPublishWithTx(txHash: `0x${string}`) {
    console.log("onPublishWithTx called with tx:", txHash, "formValid:", formValid);
    
    // Check if user already has an active campaign before publishing
    if (userActiveCampaign?.hasActiveCampaign) {
      const campaign = userActiveCampaign.activeCampaign;
      const endDate = campaign 
        ? new Date(campaign.end_date).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Unknown';

      toast.error(
        "Cannot Publish",
        `You already have an active campaign!\n\nActive Campaign: "${campaign?.title}"\nEnds: ${endDate}\n\nPlease wait for your current campaign to end.`,
        6000
      );
      setSaving(false);
      return;
    }
    
    // Double-check slots before publishing
    if (slotsInfo?.isFull) {
      toast.error(
        "Cannot Publish",
        "All campaign slots are full!\n\nPlease wait for an active campaign to end.",
        5000
      );
      setSaving(false);
      return;
    }

    if (!formValid) {
      toast.error(
        "Cannot Publish",
        "Form not valid!",
        3000
      );
      return;
    }
    if (saving) return;

    setSaving(true);
    try {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + DURATION_DAYS);

      const fd = new FormData();
      fd.append("campaignId", String(campaignId || ""));
      fd.append("creatorAddr", (creatorAddr || "").toLowerCase());
      fd.append("selectedVideoId", selectedVideoId);
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("ctaText", ctaText.trim());
      fd.append("ctaLink", `/video?id=${selectedVideoId}`);
      fd.append("durationDays", String(DURATION_DAYS));
      fd.append("creationFeeCents", String(PRICE_USD * 100));
      fd.append("txHash", txHash as string);
      fd.append("startIso", startDate.toISOString());
      fd.append("endIso", endDate.toISOString());
      if (media) fd.append("file", media, media.name);

      const res = await fetch("/api/campaigns/create", { method: "POST", body: fd });
      const json = await res.json();
      console.log("API response:", json);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to create campaign");
      }

      // Reset form first (clean state)
      resetForm();

      // Success toast with detailed information
      toast.success(
        "Campaign Created Successfully!",
        `Title: ${json.campaign?.title || title}\nDuration: ${DURATION_DAYS} ${daysLabel}\nInvestment: ${fmtUSD(PRICE_USD)}\nStatus: Active & Live\n\nYour ad is now displayed on the homepage!\nUsers can see and click your campaign\n\nThe form has been reset.\nYou can create another campaign right away!`,
        8000
      );
    } catch (err: any) {
      console.error("Publish error:", err);
      toast.error(
        "Failed to Publish Campaign",
        `Error: ${err?.message || err}\n\nPlease try again or contact support.`,
        6000
      );
      setSaving(false);
    }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-50 max-sm:text-xl md:text-xl">
          Create Advertisement
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-sm:text-xs max-sm:mt-0.5 md:text-sm md:mt-1">Promote your videos to a wider audience and boost engagement</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] max-sm:mt-4 max-sm:gap-4 md:mt-5 md:gap-5">
        <AdForm
          title={title}
          description={description}
          media={media}
          mediaURL={mediaURL}
          durationDays={DURATION_DAYS}
          priceUsd={PRICE_USD}
          onChangeTitle={setTitle}
          onChangeDesc={setDescription}
          onChooseMedia={onChooseMedia}
          myVideos={myVideos}
          selectedVideoId={selectedVideoId}
          onChangeVideoId={setSelectedVideoId}
          ctaText={ctaText}
          onChangeCtaText={setCtaText}
        />

        <aside className="space-y-6 max-sm:space-y-4 md:space-y-5">
          {/* Campaign Slots Status - At the Top */}
          {loadingSlots ? (
            <div className="rounded-3xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl max-sm:rounded-2xl max-sm:p-4 md:p-5 md:rounded-2xl">
              <div className="flex items-center gap-2 text-sm text-neutral-400 max-sm:gap-1.5 max-sm:text-xs md:gap-2 md:text-sm">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-purple-500 max-sm:h-3.5 max-sm:w-3.5 md:h-4 md:w-4"></div>
                <span>Checking slots...</span>
              </div>
            </div>
          ) : slotsInfo ? (
            <div className={`rounded-3xl border backdrop-blur-sm p-6 shadow-2xl max-sm:rounded-2xl max-sm:p-4 md:p-5 md:rounded-2xl ${
              slotsInfo.isFull 
                ? 'border-red-500/30 bg-gradient-to-br from-red-900/20 to-red-800/10' 
                : slotsInfo.availableSlots <= 2
                ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10'
                : 'border-green-500/30 bg-gradient-to-br from-green-900/20 to-green-800/10'
            }`}>
              <div className="flex items-center gap-3 mb-4 max-sm:gap-2.5 max-sm:mb-3 md:gap-2.5 md:mb-3.5">
                {slotsInfo.isFull ? (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center max-sm:w-7 max-sm:h-7 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                    <svg className="w-4 h-4 text-white max-sm:w-3.5 max-sm:h-3.5 md:w-3.5 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                ) : slotsInfo.availableSlots <= 2 ? (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center max-sm:w-7 max-sm:h-7 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                    <svg className="w-4 h-4 text-white max-sm:w-3.5 max-sm:h-3.5 md:w-3.5 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center max-sm:w-7 max-sm:h-7 max-sm:rounded-md md:w-7 md:h-7 md:rounded-md">
                    <svg className="w-4 h-4 text-white max-sm:w-3.5 max-sm:h-3.5 md:w-3.5 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <h3 className="text-lg font-bold text-white max-sm:text-base md:text-base">Campaign Slots Status</h3>
              </div>
              
              <p className={`text-sm mb-4 max-sm:text-xs max-sm:mb-3 md:text-sm md:mb-3 ${
                slotsInfo.isFull 
                  ? 'text-red-200' 
                  : slotsInfo.availableSlots <= 2
                  ? 'text-yellow-200'
                  : 'text-green-200'
              }`}>
                {slotsInfo.message}
              </p>

              <div className="space-y-3 max-sm:space-y-2.5 md:space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 max-sm:p-2.5 max-sm:rounded-lg md:p-2.5 md:rounded-lg">
                  <span className="text-neutral-300 text-sm max-sm:text-xs md:text-sm">Active Campaigns</span>
                  <span className={`font-bold max-sm:text-sm md:text-base ${
                    slotsInfo.isFull ? 'text-red-400' : 'text-neutral-100'
                  }`}>
                    {slotsInfo.activeCount}/{slotsInfo.maxSlots}
                  </span>
                </div>
                
                {!slotsInfo.isFull && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20 max-sm:p-2.5 max-sm:rounded-lg md:p-2.5 md:rounded-lg">
                    <span className="text-green-200 text-sm max-sm:text-xs md:text-sm">Available Slots</span>
                    <span className="font-bold text-green-100 text-lg max-sm:text-base md:text-base">{slotsInfo.availableSlots}</span>
                  </div>
                )}
              </div>

              {slotsInfo.isFull && slotsInfo.nextAvailableDate && (
                <div className="mt-4 pt-4 border-t border-red-500/20 max-sm:mt-3 max-sm:pt-3 md:mt-3.5 md:pt-3.5">
                  <p className="text-xs text-red-200 mb-2 font-medium flex items-center gap-1 max-sm:text-[11px] max-sm:mb-1.5 max-sm:gap-0.5 md:text-xs md:mb-2 md:gap-1">
                    <svg className="w-3 h-3 max-sm:w-2.5 max-sm:h-2.5 md:w-3 md:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Next Available Slot:
                  </p>
                  <p className="text-sm text-red-100 font-semibold mb-1 max-sm:text-xs max-sm:mb-0.5 md:text-sm md:mb-1">
                    {new Date(slotsInfo.nextAvailableDate).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                  <p className="text-xs text-red-300 max-sm:text-[11px] md:text-xs">
                    (In {Math.ceil((new Date(slotsInfo.nextAvailableDate).getTime() - Date.now()) / (1000 * 60 * 60))} hours)
                  </p>
                </div>
              )}
            </div>
          ) : null}

          <AdSummary
            paid={isPaid}
            canPublish={canPublish}
            priceUsd={PRICE_USD}
            durationDays={DURATION_DAYS}
            onOpenPayment={openPaymentPreview}
            onPublish={onPublish}
            campaignId={campaignId}
            onPaid={handlePaidOnChain}
            payDisabled={payDisabled}
            saving={saving}
            userActiveCampaign={userActiveCampaign}
          />
        </aside>
      </div>

      <PayPreviewModal
        open={showPayModal}
        totalUsd={totalUsdText}
        durationDays={DURATION_DAYS}
        onClose={() => setShowPayModal(false)}
        onConfirm={confirmPaymentPreview}
      />
    </>
  );
}
