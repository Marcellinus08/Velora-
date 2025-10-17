// src/components/ads/create.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import AdForm from "./form";
import AdSummary from "./summary";
import PayPreviewModal from "./paymodal";
import { TREASURY_ADDRESS } from "@/config/abstract-contracts";
import type { CreateAdProps } from "./types";

const DURATION_DAYS = 1;   // 1 day
const PRICE_USD = 2;       // $5

// flag untuk mode PREVIEW (kalau treasury belum dikonfigurasi)
const PAID_FLAG = "vh_ad_paid_preview_fixed";

// ambang validasi yang lebih santai
const MIN_TITLE = 2;
const MIN_DESC  = 2;

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function CreateAd({ campaignId, paidTx = "", onPaid }: CreateAdProps) {
  // -------- Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaURL, setMediaURL] = useState<string | null>(null);

  // -------- Payment state
  const [paidPreview, setPaidPreview] = useState(false); // khusus fallback preview
  const [showPayModal, setShowPayModal] = useState(false);
  const [localTx, setLocalTx] = useState<`0x${string}` | "">(""); // tx lokal jika parent tidak mengirim paidTx

  // Apakah environment siap on-chain (jika TREASURY_ADDRESS ada & price > 0)
  const ONCHAIN_ENABLED = Boolean(TREASURY_ADDRESS) && PRICE_USD > 0;

  // Pulihkan status "paid" untuk mode preview saja
  useEffect(() => {
    if (!ONCHAIN_ENABLED) {
      setPaidPreview(
        typeof window !== "undefined" && sessionStorage.getItem(PAID_FLAG) === "1"
      );
    }
  }, [ONCHAIN_ENABLED]);

  // Preview object URL untuk media
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

  // ---- Validasi field agar tombol Pay aktif hanya jika form terisi
  const formValid =
    title.trim().length >= MIN_TITLE &&
    description.trim().length >= MIN_DESC &&
    media !== null;

  // Status “paid” global: on-chain (paidTx/localTx) ATAU preview-paid
  const paidOnChain = Boolean(paidTx || localTx);
  const isPaid = paidOnChain || paidPreview;

  // Tombol Pay dikunci bila form belum valid / sudah dibayar
  const payDisabled = !formValid || isPaid;

  // Publish hanya jika SUDAH DIBAYAR dan form valid
  const canPublish = formValid && isPaid;

  const totalUsdText = useMemo(() => fmtUSD(PRICE_USD), []);
  const daysLabel = DURATION_DAYS === 1 ? "day" : "days";

  // Handlers
  function onChooseMedia(file: File | null) { setMedia(file); }

  // === Fallback modal (dipakai hanya jika ONCHAIN_DISABLED) ===
  function openPaymentPreview() { setShowPayModal(true); }
  function confirmPaymentPreview() {
    setPaidPreview(true);
    if (typeof window !== "undefined") sessionStorage.setItem(PAID_FLAG, "1");
    setShowPayModal(false);
  }

  // Dipanggil saat on-chain sukses dari komponen PayAdsButton
  function handlePaidOnChain(tx: `0x${string}`) {
    setLocalTx(tx);     // tandai paid secara lokal
    onPaid?.(tx);       // teruskan ke parent bila ada
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
    // redirect ke studio (atau halaman list ads)
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
          onOpenPayment={openPaymentPreview} // hanya dipakai saat fallback preview
          onPublish={onPublish}
          campaignId={campaignId}
          onPaid={handlePaidOnChain}
          // ✅ tombol Pay non-aktif sampai form valid / sudah dibayar
          payDisabled={payDisabled}
        />
      </div>

      {/* Modal fallback – hanya akan dipakai saat ONCHAIN_DISABLED */}
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
