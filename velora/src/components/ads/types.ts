// src/components/ads/types.ts
export type AdDraft = {
  title: string;
  description: string;
  media: File | null;
  mediaURL: string | null;
};

export type PayConfig = {
  durationDays: number;
  priceUsd: number;
};

export type SummaryProps = {
  paid: boolean;
  canPublish: boolean;
  priceUsd: number;
  durationDays: number;
  onOpenPayment: () => void;
  onPublish: () => void;
};

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
