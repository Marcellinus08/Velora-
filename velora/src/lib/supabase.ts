"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Factory function to create client
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      // opsional: cegah cache default fetch
      global: {
        fetch: (input, init) =>
          fetch(input as RequestInfo, { ...init, cache: "no-store" }),
      },
    }
  );
}

// Browser singleton untuk komponen client (pakai public keys saja)
export const supabase = createClient();

// Debug: Log supabase initialization
if (typeof window !== "undefined") {
  console.log("🔧 Supabase Client Initialized");
  console.log("📍 URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("🔑 Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing");
}
