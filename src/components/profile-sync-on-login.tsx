// src/components/profile-sync-on-login.tsx
"use client";
import { useSyncProfileOnLogin } from "@/hooks/use-sync-profile-on-login";

/** Dipasang di layout/header. Tidak render UI, hanya efek. */
export default function ProfileSyncOnLogin() {
  useSyncProfileOnLogin();
  return null;
}
