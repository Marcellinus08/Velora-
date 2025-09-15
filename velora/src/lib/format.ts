// src/lib/format.ts
export const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
export const n2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const fmtInt = (n: number) => nf.format(n);
export const fmtNum = (n: number) => n2.format(n);
export const fmtUsd = (n: number) => usd.format(n);
