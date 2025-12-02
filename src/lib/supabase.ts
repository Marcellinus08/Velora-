"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

// Singleton pattern - return same instance
export function createClient() {
  // If already created and still has valid connection, return it
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Supabase] Missing environment variables!");
    console.error("[Supabase] URL:", supabaseUrl ? "✓" : "✗");
    console.error("[Supabase] Key:", supabaseAnonKey ? "✓" : "✗");
    throw new Error("Supabase configuration is missing. Please check your environment variables.");
  }

  console.log("[Supabase] Initializing client with URL:", supabaseUrl);

  // Create new client only once
  supabaseClient = createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
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
      // Storage configuration with retry
      global: {
        fetch: async (input, init) => {
          const maxRetries = 3;
          let lastError: any;
          
          for (let i = 0; i < maxRetries; i++) {
            try {
              // Create timeout using AbortController for better compatibility
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
              
              const response = await fetch(input as RequestInfo, { 
                ...init, 
                cache: "no-store",
                signal: controller.signal,
              });
              
              clearTimeout(timeoutId);
              return response;
            } catch (error: any) {
              lastError = error;
              console.error(`[Supabase] Fetch attempt ${i + 1}/${maxRetries} failed:`, error);
              
              // If it's the last retry, throw
              if (i === maxRetries - 1) {
                throw error;
              }
              
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
          }
          
          throw lastError;
        },
      },
    }
  );

  console.log("[Supabase] Client initialized successfully");
  return supabaseClient;
}

// Browser singleton untuk komponen client (pakai public keys saja)
export const supabase = createClient();
