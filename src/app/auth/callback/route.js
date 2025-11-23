import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Ini adalah route handler, BUKAN page component
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // URL untuk redirect jika terjadi sesuatu
  const errorUrl = `${origin}/auth/confirm-error`
  const successUrl = `${origin}/auth/verified`

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          // 'get' dari request bersifat sinkron
          get: (name) => {
            return request.cookies.get(name)?.value
          },
          // 'set' dan 'remove' dari next/headers bersifat asinkron
          set: async (name, value, options) => {
            // --- PERBAIKAN ---
            // 1. 'await cookies()' untuk mendapatkan store-nya
            const cookieStore = await cookies()
            // 2. Panggil .set() di store
            cookieStore.set({ name, value, ...options })
          },
          remove: async (name, options) => {
            // --- PERBAIKAN ---
            // 1. 'await cookies()' untuk mendapatkan store-nya
            const cookieStore = await cookies()
            // 2. Panggil .delete(name) di store
            cookieStore.delete(name)
          },
        },
      }
    )
    
    // Tukar 'code' dengan 'session'
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Sukses! Arahkan ke halaman "verified"
      return NextResponse.redirect(successUrl)
    }

    // Jika GAGAL menukar code (cth: kadaluarsa)
    console.error("Error exchanging code:", error.message);
    return NextResponse.redirect(errorUrl)
  }

  // Gagal (tidak ada code di URL)
  // Arahkan ke halaman "error"
  return NextResponse.redirect(errorUrl)
}