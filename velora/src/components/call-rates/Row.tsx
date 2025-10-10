// src/components/call-rates/Row.tsx

import React from "react";

const Row = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-300">{label}</span>
      <span className="font-medium text-neutral-100">{value}</span>
    </div>
  );
};

export default Row;  // Default export
