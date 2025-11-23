import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Fungsi ini KHUSUS untuk Server Component
export async function getProductDataByIdServer(productId) {
  // 1. Setup Supabase Client untuk Server (Read-Only context)
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
          // Server Components biasanya read-only, tidak perlu set cookies di sini
          // kecuali di Server Actions atau Middleware.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Abaikan error set cookie di Server Component
          }
        },
      },
    }
  );

  // 2. Fetch Data (Query sama persis dengan yang lama)
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_specifications(*),
      product_variants(*),
      product_reviews (
        id,
        rating,
        comment,
        created_at,
        user_id,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('id', productId)
    .single();

  if (error) {
    console.error("Server Fetch Error:", error.message);
    return null;
  }

  return data;
}