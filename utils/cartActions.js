"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Fungsi Helper Private untuk membuat Supabase Client khusus Server Action
 */
async function createSupabaseServerActionClient() {
  const cookieStore = await cookies(); // Next.js 15 butuh await

  return createServerClient(
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Menambahkan item ke keranjang belanja.
 */
export async function addToCartAction(variantId, quantity) {
  // 1. Panggil Client yang Benar
  const supabase = await createSupabaseServerActionClient();

  try {
    // 2. Cek User Auth (Gunakan getUser, bukan getSession untuk keamanan server)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // Pesan ini yang ditangkap oleh Frontend untuk memunculkan Modal Login
      return { success: false, message: "Silakan login terlebih dahulu." };
    }

    // 3. Cek Stok Varian di Database
    const { data: variantData, error: variantError } = await supabase
      .from('product_variants')
      .select('stock, id') 
      .eq('id', variantId)
      .single();

    if (variantError || !variantData) {
      return { success: false, message: "Varian produk tidak ditemukan." };
    }

    if (variantData.stock < quantity) {
      return { success: false, message: `Stok tidak mencukupi. Sisa stok: ${variantData.stock}` };
    }

    // 4. Cek apakah item ini sudah ada di keranjang user?
    const { data: existingCartItem, error: cartCheckError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('variant_id', variantId)
      .maybeSingle(); 

    let errorOp = null;

    if (existingCartItem) {
      // SKENARIO A: Item sudah ada -> Update Quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > variantData.stock) {
        return { success: false, message: `Total di keranjang melebihi stok tersedia.` };
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingCartItem.id);
        
      errorOp = error;

    } else {
      // SKENARIO B: Item belum ada -> Insert Baru
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          variant_id: variantId,
          quantity: quantity
        });

      errorOp = error;
    }

    if (errorOp) {
      console.error("Database Error:", errorOp.message);
      throw new Error("Gagal menyimpan ke keranjang.");
    }

    // 5. Revalidate Path
    revalidatePath('/', 'layout'); 
    
    return { success: true, message: "Produk berhasil masuk keranjang!" };

  } catch (err) {
    console.error("Add to Cart Error:", err);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

// --- 1. GET CART ITEMS (FETCH) ---
export async function getCartItemsAction() {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Query Nested: Cart -> Variant -> Product -> Images
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      variant: product_variants (
        id,
        price,
        stock,
        color_name,
        size_name,
        product: products (
          id,
          name,
          product_images (
            image_url
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching cart:", error);
    return [];
  }

  // Flatten Data agar mudah dipakai di Frontend
  return data.map(item => ({
    id: item.id, // ID Keranjang
    variantId: item.variant.id,
    name: item.variant.product.name,
    productId: item.variant.product.id,
    // Ambil gambar pertama
    image: item.variant.product.product_images?.[0]?.image_url || 'https://placehold.co/800x800?text=No+Image',
    price: item.variant.price,
    quantity: item.quantity,
    color: item.variant.color_name,
    size: item.variant.size_name,
    stock: item.variant.stock
  }));
}

// --- 2. UPDATE QUANTITY ---
export async function updateCartQuantityAction(cartId, newQuantity) {
  const supabase = await createSupabaseServerActionClient();
  
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity: newQuantity })
    .eq('id', cartId);

  if (error) return { success: false, message: error.message };
  
  revalidatePath('/cart'); // Refresh halaman
  return { success: true };
}

// --- 3. DELETE ITEM ---
export async function deleteCartItemAction(cartId) {
  const supabase = await createSupabaseServerActionClient();

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartId);

  if (error) return { success: false, message: error.message };

  revalidatePath('/cart');
  return { success: true };
}

export async function getCartCount() {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  // Gunakan count: 'exact', head: true agar ringan (tidak download data row)
  const { count, error } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    console.error("Error count cart:", error.message);
    return 0;
  }

  return count || 0;
}

// ... kode lainnya ...

export async function getCheckoutItemsAction(cartItemIds) {
  const supabase = await createSupabaseServerActionClient();
  
  // Filter ID yang valid (mencegah error jika array kosong/invalid)
  if (!cartItemIds || cartItemIds.length === 0) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id, quantity,
      variant: product_variants (
        id, price, color_name, size_name,
        product: products (name, product_images(image_url))
      )
    `)
    .in('id', cartItemIds); 

  if (error) {
    console.error("Fetch checkout items error:", error);
    return [];
  }

  return data.map(item => ({
    cartId: item.id,
    variantId: item.variant.id,
    name: item.variant.product.name,
    image: item.variant.product.product_images?.[0]?.image_url,
    price: item.variant.price,
    quantity: item.quantity,
    color: item.variant.color_name,
    size: item.variant.size_name,
  }));
}


/**
 * Action Khusus untuk "Pesan Sekarang" (Direct Buy).
 * Mengambil data varian langsung tanpa melalui tabel cart_items.
 */
export async function getDirectCheckoutItemAction(variantId, quantity) {
  const supabase = await createSupabaseServerActionClient();

  // 1. Ambil data varian dan produknya
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id, price, stock, color_name, size_name,
      product: products (
        id, name, 
        product_images (image_url)
      )
    `)
    .eq('id', variantId)
    .single();

  if (error || !data) {
    console.error("Direct checkout fetch error:", error);
    return null; // Atau return []
  }

  // 2. Format datanya agar SAMA PERSIS dengan output getCheckoutItemsAction
  // Kita buat array berisi 1 objek saja
  return [{
    cartId: 'direct', // Penanda bahwa ini bukan dari cart DB
    variantId: data.id,
    productId: data.product.id, // Tambahan info product ID
    name: data.product.name,
    image: data.product.product_images?.[0]?.image_url || 'https://placehold.co/600x600?text=No+Image',
    price: data.price,
    quantity: parseInt(quantity),
    color: data.color_name,
    size: data.size_name,
    stock: data.stock // Info stok untuk validasi di frontend jika perlu
  }];
}