import { createClient } from "@supabase/supabase-js";

// ⚠️ Hanya dipakai di API routes / server actions (bukan komponen client)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client dengan SERVICE ROLE: untuk operasi write/administratif via server
export const sbService = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// (opsional) Anonymous client di server: berguna untuk SELECT yang tunduk RLS
export const sbAnonServer = createClient(url, anonKey, {
  auth: { persistSession: false },
});
