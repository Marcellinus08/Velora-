"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useAbstractProfileByAddress } from "@/hooks/use-abstract-profile";
import { getTierColor } from "@/lib/tier-colors";
import { getDisplayName } from "@/lib/address-utils";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";

interface AbstractProfileProps {
  address?: `0x${string}`;
  fallback?: string;
  shineColor?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: ClassValue;
  hoverScale?: boolean;
  ring?: boolean;
  ringWidth?: number;
}

export function AbstractProfile({
  address: providedAddress,
  fallback: providedFallback,
  shineColor,
  size = "md",
  showTooltip = true,
  className,
  hoverScale = false,
  ring = true,
  ringWidth,
}: AbstractProfileProps) {
  const { address: connectedAddress, isConnecting, isReconnecting } = useAccount();
  const address = providedAddress || connectedAddress;
  const fallback = providedFallback || (address ? address.slice(2, 4).toUpperCase() : "??");

  const sizeClass =
    size === "xs" ? "h-7 w-7" :
    size === "sm" ? "h-9 w-9" :
    size === "lg" ? "h-12 w-12" :
    "h-10 w-10";

  const defaultRingPx =
    size === "xs" ? 1.5 :
    size === "lg" ? 2.5 :
    2;

  const { data: profile, isLoading } = useAbstractProfileByAddress(address);

  if (!address || isConnecting || isReconnecting || isLoading) {
    return (
      <div
        className={cn("relative rounded-full overflow-hidden", sizeClass, className)}
        style={{ border: ring ? `${(ringWidth ?? defaultRingPx)}px solid #C0C0C0` : "none" }}
      >
        <Avatar className="w-full h-full">
          <Skeleton className="w-full h-full rounded-full bg-muted/50" />
        </Avatar>
      </div>
    );
  }

  const avatarSrc =
    profile?.user?.overrideProfilePictureUrl ||
    "https://abstract-assets.abs.xyz/avatars/1-1-1.png";

  const displayName = getDisplayName(profile?.user?.name || "", address);
  const tierColor = profile?.user?.tier ? getTierColor(profile.user.tier) : getTierColor(1);
  const finalBorderColor = shineColor || tierColor;

  const core = (
    <div
      className={cn("relative rounded-full overflow-hidden", sizeClass, className)}
      style={{ border: ring ? `${(ringWidth ?? defaultRingPx)}px solid ${finalBorderColor}` : "none" }}
    >
      <Avatar className={cn("w-full h-full", hoverScale && "transition-transform duration-200 hover:scale-110")}>
        <AvatarImage src={avatarSrc} alt={`${displayName} avatar`} className="object-cover" />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </div>
  );

  if (!showTooltip) return core;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{core}</TooltipTrigger>
      <TooltipContent>
        <p>{displayName}</p>
      </TooltipContent>
    </Tooltip>
  );
}
