"use client";

import { useEffect, useMemo, useState } from "react";
import AdForm from "./form";
import AdSummary from "./summary";
import PayPreviewModal from "./paymodal";
import { TREASURY_ADDRESS } from "@/config/abstract-contracts";
import type { CreateAdProps } from "./types";

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

  const payDisabled = !formValid;
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
  const daysLabel = DURATION_DAYS === 1 ? "day" : "days";

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
    
    console.log("✅ Form reset completed - ready for new campaign!");
  }

  function onChooseMedia(file: File | null) {
    setMedia(file);
  }

  function openPaymentPreview() {
    setShowPayModal(true);
  }
  function confirmPaymentPreview() {
    console.log("Payment preview confirmed, starting auto-publish...");
    setPaidPreview(true);
    if (typeof window !== "undefined") sessionStorage.setItem(PAID_FLAG, "1");
    setShowPayModal(false);

    alert(
      `✅ Preview Payment Confirmed!\n\n` +
        `💰 Amount: ${fmtUSD(PRICE_USD)}\n` +
        `⏰ Duration: ${DURATION_DAYS} days\n\n` +
        `🚀 Publishing your campaign now...\n` +
        `📝 Form will be reset after success.`
    );

    onPublishWithTx("preview" as `0x${string}`);
  }

  function handlePaidOnChain(tx: `0x${string}`) {
    console.log("On-chain payment successful, starting auto-publish...");
    setLocalTx(tx);
    onPaid?.(tx);

    alert(
      `✅ Payment Successful!\n\n` +
        `🔗 Transaction Hash: ${tx.slice(0, 10)}...${tx.slice(-8)}\n` +
        `💰 Amount: ${fmtUSD(PRICE_USD)}\n\n` +
        `🚀 Publishing your campaign now...\n` +
        `📝 Form will be reset after success.`
    );

    onPublishWithTx(tx);
  }

  async function onPublish() {
    console.log("onPublish called! canPublish:", canPublish, "saving:", saving);
    if (!canPublish) {
      console.log("Cannot publish - canPublish is false. isPaid:", isPaid, "formValid:", formValid);
      alert("❌ Cannot publish: Form not valid or payment not completed!");
      return;
    }
    if (saving) return;

    // Route unified to server
    await onPublishWithTx((paidTx || localTx || "preview") as `0x${string}`);
  }

  // === Main change: send data to server API (service role) ===
  async function onPublishWithTx(txHash: `0x${string}`) {
    console.log("onPublishWithTx called with tx:", txHash, "formValid:", formValid);
    if (!formValid) {
      alert("❌ Cannot publish: Form not valid!");
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
      fd.append("ctaLink", `/task?id=${selectedVideoId}`);
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

      // Success alert with detailed information
      alert(
        `🎉 Campaign Created Successfully! 🎉\n\n` +
          `📋 Title: ${json.campaign?.title || title}\n` +
          `⏰ Duration: ${DURATION_DAYS} ${daysLabel}\n` +
          `💰 Investment: ${fmtUSD(PRICE_USD)}\n` +
          `🎯 Status: Active & Live\n` +
          `📊 Campaign ID: ${json.campaign?.id || campaignId}\n\n` +
          `🚀 Your ad is now displayed on the homepage!\n` +
          `� Users can see and click your campaign\n\n` +
          `📝 The form has been reset.\n` +
          `✨ You can create another campaign right away!`
      );
    } catch (err: any) {
      console.error("Publish error:", err);
      alert(
        `❌ Failed to publish campaign!\n\n` +
        `Error: ${err?.message || err}\n\n` +
        `Please try again or contact support.`
      );
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-50">
        Create Advertisement
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        {ONCHAIN_ENABLED ? (
          <>
            Fill in your campaign details. Payment is{" "}
            <span className="font-semibold">on-chain</span> via Abstract Global
            Wallet.
          </>
        ) : (
          <>
            Fill in your campaign details. Payment is{" "}
            <span className="font-semibold">preview only</span> for now—no
            charges will be made.
          </>
        )}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
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
        />
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
