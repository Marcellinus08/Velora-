"use client";

export default function PayPreviewModal({
  open,
  totalUsd,
  durationDays,
  onClose,
  onConfirm,
}: {
  open: boolean;
  totalUsd: string;
  durationDays: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pay-preview-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="border-b border-neutral-800 px-5 py-4">
          <h4 id="pay-preview-title" className="text-sm font-semibold text-neutral-100">
            Payment Preview
          </h4>
        </div>

        <div className="px-5 py-4 text-sm">
          <p className="text-neutral-300">This is a mock payment step for UI only.</p>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Total</span>
              <span className="font-semibold text-neutral-100">{totalUsd}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Duration</span>
              <span className="text-neutral-100">{durationDays} days</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-[var(--primary-500)] px-3 py-2 text-sm font-semibold text-white hover:bg-opacity-90 cursor-pointer"
          >
            Mark as Paid (Preview)
          </button>
        </div>
      </div>
    </div>
  );
}
