"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function createSupabaseServerActionClient() {
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

// --- 1. GET PUBLIC LOOKBOOKS ---
export async function getLookbooks() {
  const supabase = await createSupabaseServerActionClient();

  const { data, error } = await supabase
    .from('lookbooks')
    .select(`
      id, title, category, description, main_image_url, created_at,
      gallery: lookbook_gallery(image_url),
      items: lookbook_products(
        product: products(id, name, product_images(image_url))
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching lookbooks:", error.message);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description,
    mainImage: item.main_image_url,
    created_at: item.created_at, // ✅ WAJIB ADA agar tanggal muncul
    gallery: item.gallery.map(g => g.image_url),
    relatedProducts: item.items
      .filter(i => i.product) // Hapus item jika produknya sudah dihapus dari DB
      .map(i => ({
        id: i.product.id,
        name: i.product.name,
        url: `/detailproduct/${i.product.id}`,
        image: i.product.product_images?.[0]?.image_url || 'https://placehold.co/100'
      }))
  }));
}

// --- 2. CREATE LOOKBOOK ---
export async function createLookbookAction(formData) {
  const supabase = await createSupabaseServerActionClient();

  const { title, category, description, mainImageUrl, galleryUrls = [], productIds = [] } = formData;

  // A. Insert Header
  const { data: newLookbook, error: lbError } = await supabase
    .from('lookbooks')
    .insert({
      title, category, description, 
      main_image_url: mainImageUrl
    })
    .select()
    .single();

  if (lbError) return { success: false, message: "Gagal simpan Header: " + lbError.message };

  const lookbookId = newLookbook.id;

  // B. Insert Gallery (Batch)
  if (galleryUrls.length > 0) {
    const galleryInserts = galleryUrls.map(url => ({
      lookbook_id: lookbookId,
      image_url: url
    }));
    await supabase.from('lookbook_gallery').insert(galleryInserts);
  }

  // C. Insert Products (Batch)
  if (productIds.length > 0) {
    const productInserts = productIds.map(pid => ({
      lookbook_id: lookbookId,
      product_id: pid
    }));
    await supabase.from('lookbook_products').insert(productInserts);
  }

  revalidatePath('/'); 
  revalidatePath('/admin/outlook'); 

  return { success: true };
}