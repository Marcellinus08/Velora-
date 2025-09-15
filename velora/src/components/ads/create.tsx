"use client";

import { useEffect, useMemo, useState } from "react";
import AdForm from "./form";
import AdSummary from "./summary";
import PayPreviewModal from "./paymodal";

const DURATION_DAYS = 7;
const PRICE_USD = 10;
const PAID_FLAG = "vh_ad_paid_preview_fixed";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function CreateAd() {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaURL, setMediaURL] = useState<string | null>(null);

  // Payment state
  const [paid, setPaid] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const canPublish = paid && title.trim() !== "" && description.trim() !== "" && media !== null;

  // restore paid preview flag (client only)
  useEffect(() => {
    setPaid(typeof window !== "undefined" && sessionStorage.getItem(PAID_FLAG) === "1");
  }, []);

  // preview object URL
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

  const totalUsdText = useMemo(() => fmtUSD(PRICE_USD), []);

  function onChooseMedia(file: File | null) {
    setMedia(file);
  }

  function openPaymentPreview() {
    setShowPayModal(true);
  }
  function confirmPaymentPreview() {
    setPaid(true);
    if (typeof window !== "undefined") sessionStorage.setItem(PAID_FLAG, "1");
    setShowPayModal(false);
  }

  function onPublish() {
    if (!canPublish) return;
    alert(
      [
        "Ad created (preview)!",
        `Title: ${title}`,
        `Description: ${description}`,
        `Duration: ${DURATION_DAYS} days`,
        `Price: ${fmtUSD(PRICE_USD)}`,
        `Media: ${media?.name ?? "-"}`,
      ].join("\n")
    );
    // redirect to studio
    window.location.href = "/studio";
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-50">Create Advertisement</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Fill in your campaign details. Payment is <span className="font-semibold">preview only</span> for now—no charges
        will be made.
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
        />

        <AdSummary
          paid={paid}
          canPublish={canPublish}
          priceUsd={PRICE_USD}
          durationDays={DURATION_DAYS}
          onOpenPayment={openPaymentPreview}
          onPublish={onPublish}
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
