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
      cookies: { getAll() { return cookieStore.getAll() }, setAll() {} },
    }
  );
}

// 1. GET ALL
export async function getLookbooks() {
  const supabase = await createSupabaseServerActionClient();
  const { data, error } = await supabase
    .from('lookbooks')
    .select(`
      id, title, category, description, main_image_url, created_at,
      gallery: lookbook_gallery(id, image_url),
      items: lookbook_products(
        product: products(id, name, product_images(image_url))
      )
    `)
    .order('created_at', { ascending: false });

  if (error) return [];

  return data.map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description,
    mainImage: item.main_image_url,
    created_at: item.created_at,
    gallery: item.gallery.map(g => ({ id: g.id, url: g.image_url })), 
    relatedProducts: item.items
      .filter(i => i.product) 
      .map(i => ({
        id: i.product.id,
        name: i.product.name,
        image: i.product.product_images?.[0]?.image_url || 'https://placehold.co/100'
      }))
  }));
}

// 2. CREATE / UPDATE (REVISI)
export async function saveLookbookAction(formData) {
  const supabase = await createSupabaseServerActionClient();
  const { id, title, category, description, mainImageUrl, galleryUrls = [], productIds = [] } = formData;
  let lookbookId = id;

  try {
    // A. INSERT / UPDATE HEADER
    let lbError;
    let savedData;

    if (id) {
      // UPDATE
      const { data, error } = await supabase
        .from('lookbooks')
        .update({ title, category, description, main_image_url: mainImageUrl })
        .eq('id', id)
        .select()
        .single();
        
      lbError = error;
      savedData = data;
    } else {
      // INSERT (Buat Baru -> ID otomatis dari DB)
      const { data, error } = await supabase
        .from('lookbooks')
        .insert({ title, category, description, main_image_url: mainImageUrl })
        .select()
        .single();

      lbError = error;
      savedData = data;
    }

    if (lbError) throw new Error(lbError.message);
    lookbookId = savedData.id;

    // B. HANDLE GALLERY (Hapus lama, insert baru)
    // Hapus semua gallery lama milik ID ini
    await supabase.from('lookbook_gallery').delete().eq('lookbook_id', lookbookId);
    
    // Insert baru
    if (galleryUrls.length > 0) {
      const galleryInserts = galleryUrls.map(url => ({
        lookbook_id: lookbookId,
        image_url: url
      }));
      await supabase.from('lookbook_gallery').insert(galleryInserts);
    }

    // C. HANDLE PRODUCTS (Hapus lama, insert baru)
    await supabase.from('lookbook_products').delete().eq('lookbook_id', lookbookId);
    
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

  } catch (error) {
    console.error("Save Lookbook Error:", error);
    return { success: false, message: error.message };
  }
}

// 3. DELETE (REVISI - AMAN)
export async function deleteLookbookAction(id) {
  const supabase = await createSupabaseServerActionClient();

  try {
    // 1. Hapus Relasi Anak Dulu (Manual Cascade)
    await supabase.from('lookbook_gallery').delete().eq('lookbook_id', id);
    await supabase.from('lookbook_products').delete().eq('lookbook_id', id);

    // 2. Hapus Induk
    const { error } = await supabase.from('lookbooks').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/outlook');
    return { success: true };

  } catch (error) {
    return { success: false, message: error.message };
  }
}