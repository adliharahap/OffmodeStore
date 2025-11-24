"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Abaikan jika dipanggil dari Server Component
          }
        },
      },
    }
  );

  // 1. Hapus Sesi di Supabase & Cookie Browser
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Server Logout Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}