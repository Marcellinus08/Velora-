import React from "react";

export const Header = () => {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-neutral-50">Meet</h2>
      <a
        href="/call-rates"  /* <-- path halaman call rates milikmu */
        className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
      >
        Set call rates
      </a>
    </div>
  );
};
