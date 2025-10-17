// src/components/ads/types.ts

/** Hash transaksi EVM */
export type TxHash = `0x${string}`;

/** ID yang kita terima dari UI / DB / UUID dan bisa dikonversi ke uint256 */
export type IdLike = string | number | bigint;

/** Draft data dari form iklan (client-side only) */
export type AdDraft = {
  title: string;
  description: string;
  media: File | null;
  mediaURL: string | null;
};

/** Konfigurasi pembayaran (display & kalkulasi) */
export type PayConfig = {
  durationDays: number;
  priceUsd: number;
};

/** Props untuk ringkasan + tombol bayar (sidebar) */
export type SummaryProps = {
  /** sudah dibayar? (on-chain tx sukses ATAU preview-paid) */
  paid: boolean;

  /** boleh publish? (biasanya: form valid && paid) */
  canPublish: boolean;

  /** total harga dalam USD (angka bulat/decimal) */
  priceUsd: number;

  /** durasi kampanye (untuk display) */
  durationDays: number;

  /** fallback: buka modal preview payment (dipakai kalau treasury tidak dikonfigurasi) */
  onOpenPayment: () => void;

  /** aksi publish (aktif kalau canPublish = true) */
  onPublish: () => void;

  /** dipanggil saat pembayaran on-chain sukses dari PayAdsButton */
  onPaid?: (tx: TxHash) => void;

  /** id unik campaign untuk on-chain payment;
   *  boleh string (uuid), number (auto-increment), atau bigint */
  campaignId?: IdLike;

  /** kunci tombol Pay sampai form valid (ditentukan di CreateAd) */
  payDisabled?: boolean;
};

/** Props untuk form input iklan */
export type FormProps = {
  title: string;
  description: string;
  media: File | null;
  mediaURL: string | null;

  durationDays: number;
  priceUsd: number;

  onChangeTitle: (v: string) => void;
  onChangeDesc: (v: string) => void;
  onChooseMedia: (file: File | null) => void;
};

/** Props untuk komponen CreateAd supaya wrapper client bisa oper state/handler on-chain */
export type CreateAdProps = {
  /** id kampanye yang dibuat sekali (mis. crypto.randomUUID atau id dari DB) */
  campaignId?: IdLike;

  /** tx hash ketika pembayaran on-chain sukses (dipakai untuk menandai paid) */
  paidTx?: TxHash | "";

  /** callback dari PayAdsButton saat tx sukses, untuk isi paidTx di parent */
  onPaid?: (tx: TxHash) => void;
};
