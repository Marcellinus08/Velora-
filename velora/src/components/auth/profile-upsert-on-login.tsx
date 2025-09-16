// src/components/auth/profile-upsert-on-login.tsx
"use client";
import { useCreateProfileOnLogin } from "@/hooks/use-create-profile-on-login";

/** Komponen tanpa UI – cukup dipasang agar hook jalan */
export default function ProfileUpsertOnLogin() {
  useCreateProfileOnLogin();
  return null;
}
