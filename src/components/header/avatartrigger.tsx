"use client";

import { AbstractProfile } from "@/components/abstract-profile";
import { useState } from "react";

export default function AvatarTrigger({
  avatarUrl,
  avatarLoading = false,
  className = "",
  address,
}: {
  avatarUrl?: string | null;
  avatarLoading?: boolean;
  className?: string;
  address?: `0x${string}`;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`rounded-full ring-2 ring-transparent hover:ring-[rgba(124,58,237,0.45)] ${className}`}>
      {avatarLoading ? (
        // ✅ Loading: show skeleton
        <div className="skel block cursor-pointer rounded-full h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
      ) : avatarUrl && !imgError ? (
        // Dari DB - with error handling
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="Avatar"
          className="block cursor-pointer rounded-full object-cover h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          onError={() => {
            console.warn(`Failed to load avatar: ${avatarUrl}`);
            setImgError(true);
          }}
        />
      ) : (
        // Fallback: AbstractProfile (jika tidak ada di DB atau error loading)
        <AbstractProfile address={address} size="sm" showTooltip={false} className="!h-8 !w-8 sm:!h-9 sm:!w-9 md:!h-10 md:!w-10" />
      )}
    </div>
  );
}
