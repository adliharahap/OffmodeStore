import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Tentukan role apa saja yang boleh mengakses /dashboardAdmin
const adminRoles = ['admin', 'owner', 'pegawai']

// 1. GANTI NAMA FUNGSI INI DARI 'middleware' menjadi 'proxy'
export async function proxy(req) {
  console.log('--- PROXY BERJALAN DI RUTE:', req.nextUrl.pathname, '---');

  // Buat respons dasar. Ini akan kita gunakan jika user lolos semua cek.
  const res = NextResponse.next()

  // 🧩 Buat supabase client untuk edge runtime (middleware)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          res.cookies.delete({ name, ...options })
        },
      },
    }
  )

  // Cek apakah ada sesi login (dari cookie)
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  // Dapatkan path URL yang diminta, cth: '/login'
  const pathname = req.nextUrl.pathname

  // Siapkan URL untuk halaman 'not-found' (asumsi /app/not-found.js ada)
  const notFoundUrl = new URL('/not-found', req.url)

  // --- LOGIKA KHUSUS: Detail Product ---
  // Kita kirim status login lewat Header ke Server Component
  if (pathname.startsWith('/detailproduct')) {
    const requestHeaders = new Headers(req.headers)
    // Set header custom: 'true' atau 'false'
    requestHeaders.set('x-is-logged-in', user ? 'true' : 'false')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // --- ATURAN #1: Halaman /login ---
  if (pathname === '/login') {
    if (user) {
      // Jika SUDAH login, tendang ke halaman utama
      return NextResponse.redirect(new URL('/', req.url))
    }
    // Jika BELUM login, biarkan tampilkan halaman /login
    return res
  }

  if (pathname === '/myorders') {
    if (!user) {
      return NextResponse.redirect(notFoundUrl)
    }
    return res
  }

  if (pathname === '/mycart') {
    if (!user) {
      return NextResponse.redirect(notFoundUrl)
    }
    return res
  }

  if (pathname === '/profile') {
    if (!user) {
      return NextResponse.redirect(notFoundUrl)
    }
    return res
  }

  if (pathname === '/checkout') {
    if (!user) {
      return NextResponse.redirect(notFoundUrl)
    }
    return res
  }

  // --- ATURAN 2: Rute /dashboardAdmin (dan turunannya) ---
  // (Logika di bawah ini hanya berjalan untuk rute selain /login)

  // Jika tidak ada sesi (belum login), tampilkan not-found.
  if (!user) {
    return NextResponse.redirect(notFoundUrl)
  }

  // User sudah login, sekarang cek role-nya di database.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Jika role tidak valid (error/kosong/bukan admin), tampilkan not-found.
  if (error || !profile || !adminRoles.includes(profile.role)) {
    return NextResponse.redirect(notFoundUrl)
  }

  // User login & role-nya valid. Terakhir, cek ID di URL.
  const pathParts = pathname.split('/')
  const urlId = pathParts[2]  // Ambil ID dari URL, cth: /dashboardAdmin/[id_user]

  // Cek jika:
  // 1. Ada ID di URL (bukan hanya /dashboardAdmin)
  // 2. DAN ID itu TIDAK SAMA dengan ID user yang sedang login
  if (urlId && urlId !== user.id) {
    // ID URL tidak cocok dengan ID user -> not-found
    return NextResponse.redirect(notFoundUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/dashboardAdmin',
    '/dashboardAdmin/:path*',
    '/login',
    '/detailproduct/:path*',
    '/myorders/:path*',
    '/mycart/:path*',
    '/checkout/:path*',
    '/profile/:path*',
  ],
}