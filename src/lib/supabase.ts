"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

// Singleton pattern - return same instance
export function createClient() {
  // If already created and still has valid connection, return it
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new client only once
  supabaseClient = createSupabaseClient(
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

  return supabaseClient;
}

// Browser singleton untuk komponen client (pakai public keys saja)
export const supabase = createClient();
