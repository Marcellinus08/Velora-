// src/components/call-rates/ProductCard.tsx
import React from "react";

const ProductCard = ({
  icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) => {
  return (
    <div className="group relative h-full min-h-[220px] rounded-[22px] border border-neutral-800 bg-gradient-to-b from-neutral-800/40 to-neutral-800/10 p-6 transition-colors hover:border-neutral-700">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-neutral-700 bg-neutral-800/70 text-neutral-200">
        {icon}
      </div>

      <h4 className="text-[22px] font-semibold leading-tight text-neutral-50">{title}</h4>
      <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-neutral-300">{description}</p>

      <button
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-[var(--primary-500)] hover:opacity-90"
      >
        {cta}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default ProductCard;
