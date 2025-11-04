"use client";

import { AbstractProfile } from "@/components/abstract-profile";

export default function AvatarTrigger({
  avatarUrl,
  avatarLoading = false,
  className = "",
}: {
  avatarUrl?: string | null;
  avatarLoading?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-full ring-2 ring-transparent hover:ring-[rgba(124,58,237,0.45)] ${className}`}>
      {avatarLoading ? (
        // ✅ Loading: show skeleton
        <div className="skel block cursor-pointer rounded-full h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
      ) : avatarUrl ? (
        // Dari DB
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="Avatar"
          className="block cursor-pointer rounded-full object-cover h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        // Fallback: AbstractProfile (jika tidak ada di DB)
        <AbstractProfile size="sm" showTooltip={false} className="!h-8 !w-8 sm:!h-9 sm:!w-9 md:!h-10 md:!w-10" />
      )}
    </div>
  );
}
