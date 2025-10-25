"use client";

import { useEffect, useMemo, useState } from "react";
import AdForm from "./form";
import AdSummary from "./summary";
import PayPreviewModal from "./paymodal";
import { TREASURY_ADDRESS } from "@/config/abstract-contracts";
import type { CreateAdProps } from "./types";

const DURATION_DAYS = 3;
const PRICE_USD = 2;

const PAID_FLAG = "vh_ad_paid_preview_fixed";
const MIN_TITLE = 2;
const MIN_DESC = 2;

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function CreateAd({ campaignId, paidTx = "", onPaid }: CreateAdProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaURL, setMediaURL] = useState<string | null>(null);

  const [paidPreview, setPaidPreview] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [localTx, setLocalTx] = useState<`0x${string}` | "">("");

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
    media !== null;

  const paidOnChain = Boolean(paidTx || localTx);
  const isPaid = paidOnChain || paidPreview;

  const payDisabled = !formValid || isPaid;
  const canPublish = formValid && isPaid;

  const totalUsdText = useMemo(() => fmtUSD(PRICE_USD), []);
  const daysLabel = DURATION_DAYS === 1 ? "day" : "days";

  function onChooseMedia(file: File | null) {
    setMedia(file);
  }

  function openPaymentPreview() {
    setShowPayModal(true);
  }
  function confirmPaymentPreview() {
    setPaidPreview(true);
    if (typeof window !== "undefined") sessionStorage.setItem(PAID_FLAG, "1");
    setShowPayModal(false);
  }

  function handlePaidOnChain(tx: `0x${string}`) {
    setLocalTx(tx);
    onPaid?.(tx);
  }

  function onPublish() {
    if (!canPublish) return;
    const lines = [
      "Ad created!",
      `Title: ${title}`,
      `Description: ${description}`,
      `Duration: ${DURATION_DAYS} ${daysLabel}`,
      `Price: ${fmtUSD(PRICE_USD)}`,
      `Media: ${media?.name ?? "-"}`,
    ];
    const txHash = (paidTx || localTx) as string;
    if (txHash) lines.push(`Tx: ${txHash}`);
    alert(lines.join("\n"));
    window.location.href = "/studio";
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-50">
        Create Advertisement
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        {ONCHAIN_ENABLED ? (
          <>Fill in your campaign details. Payment is <span className="font-semibold">on-chain</span> via Abstract Global Wallet.</>
        ) : (
          <>Fill in your campaign details. Payment is <span className="font-semibold">preview only</span> for now—no charges will be made.</>
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
