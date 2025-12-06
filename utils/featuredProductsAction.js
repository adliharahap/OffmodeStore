"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper untuk koneksi Supabase (Private di file ini)
async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  );
}

/**
 * Mengambil 6 Produk Unggulan (Terlaris & Rating Tertinggi)
 */
export async function getFeaturedProducts() {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        rating,
        sold_count_total,
        badge,
        created_at,
        product_images (
          image_url,
          linked_color_name
        ),
        product_variants (
          color_name,
          size_name,
          stock,
          price,
          original_price
        )
      `)
      .eq('is_deleted', false)
      // LOGIKA UTAMA: 
      // 1. Urutkan berdasarkan penjualan terbanyak
      .order('sold_count_total', { ascending: false })
      // 2. Jika penjualan sama, urutkan berdasarkan rating
      .order('rating', { ascending: false })
      // 3. Ambil hanya 6 data
      .limit(6);

    if (error) throw new Error(error.message);

    // TRANSFORMASI DATA (Mapping ke format UI Component)
    const formattedData = data.map((product) => {
      const variants = product.product_variants || [];
      const images = product.product_images || [];

      // A. Hitung Harga (Ambil harga terendah dari varian)
      const prices = variants.map(v => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      const matchingVariant = variants.find(v => v.price === minPrice);
      const displayOriginalPrice = matchingVariant ? matchingVariant.original_price : null;

      // B. Format Images
      const formattedImages = images.map(img => ({
        src: img.image_url,
        linkedColorName: img.linked_color_name || null
      }));

      // C. Format Sizes (Agregasi stok per ukuran)
      const sizeMap = new Map();
      variants.forEach(v => {
        const currentStock = sizeMap.get(v.size_name) || 0;
        sizeMap.set(v.size_name, currentStock + v.stock);
      });
      const formattedSizes = Array.from(sizeMap.entries()).map(([name, stock]) => ({ name, stock }));

      // D. Format Colors (Unique)
      const uniqueColors = [...new Set(variants.map(v => v.color_name))].map(name => ({ name }));

      // E. Tebak Kategori (Opsional, bisa dihapus jika tidak dipakai di card)
      let category = 'Fashion';
      const lowerName = product.name.toLowerCase();
      if (lowerName.includes('kaos')) category = 'Kaos';
      else if (lowerName.includes('celana')) category = 'Celana';
      else if (lowerName.includes('jaket')) category = 'Jaket';

      return {
        id: product.id,
        name: product.name,
        category: category,
        description: product.description || '',
        images: formattedImages.length > 0 ? formattedImages : [{ src: 'https://placehold.co/600x800?text=No+Image', linkedColorName: null }],
        badge: product.badge || (product.sold_count_total > 10 ? 'Popular' : null),
        rating: product.rating || 0,
        sold: product.sold_count_total ? product.sold_count_total.toString() : '0',
        price: minPrice,
        originalPrice: displayOriginalPrice,
        sizes: formattedSizes,
        colors: uniqueColors,
        created_at: product.created_at
      };
    });

    return formattedData;

  } catch (err) {
    console.error("Gagal fetch featured products:", err);
    return [];
  }
}