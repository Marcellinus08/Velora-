import React from "react";

/** Section wrapper */
export function SubscriptionSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <h2 className="text-xl font-semibold text-neutral-50">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
