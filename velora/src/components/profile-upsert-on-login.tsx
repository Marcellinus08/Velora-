"use client";
import { useCreateProfileOnLogin } from "@/hooks/use-create-profile-on-login";

export default function ProfileUpsertOnLogin() {
  useCreateProfileOnLogin();
  return null;
}
