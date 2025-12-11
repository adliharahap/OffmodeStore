"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function createSupabaseServerActionClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      },
    }
  );
}

export async function getUserOrders() {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      total_amount,
      shipping_method,
      tracking_number,
      shipping_address,
      shipping_cost,
      admin_fee,
      order_items (
        id,
        quantity,
        price_at_purchase,
        variant: product_variants (
          color_name,
          size_name,
          product: products (
            id,
            name,
            product_images (
              image_url,
              linked_color_name
            )
          )
        )
      ),
      product_reviews (
        id,
        product_id
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetch orders:", error);
    return [];
  }

  // Format Data
  return data.map(order => {
    // Buat Set ID produk yang sudah di-review di order ini agar pencarian cepat
    const reviewedProductIds = new Set(order.product_reviews.map(r => r.product_id));

    const formattedItems = order.order_items.map(item => {
      const product = item.variant?.product;
      const productId = product?.id;

      // LOGIKA PENCARIAN GAMBAR SESUAI WARNA
      const variantColor = item.variant?.color_name;
      const allImages = product?.product_images || [];

      // Cari gambar yang linked_color_name-nya sama dengan warna varian yang dibeli
      const matchedImage = allImages.find(img => 
        img.linked_color_name && variantColor && 
        img.linked_color_name.toLowerCase() === variantColor.toLowerCase()
      );
      
      // Fallback: Jika tidak ketemu (atau varian tidak punya warna spesifik), pakai gambar pertama
      const finalImageUrl = matchedImage 
        ? matchedImage.image_url 
        : (allImages[0]?.image_url || 'https://placehold.co/200x200?text=No+Image');

      return {
        name: item.variant?.product?.name || "Produk Terhapus",
        price: item.price_at_purchase,
        quantity: item.quantity,
        variant: `${item.variant?.color_name || '-'}, ${item.variant?.size_name || '-'}`,
        image_url: finalImageUrl,
        productId: productId,
        // TAMBAHAN: Flag apakah item ini sudah direview
        isReviewed: productId ? reviewedProductIds.has(productId) : false
      };
    });

    return {
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      total_amount: order.total_amount,
      shipping_method: order.shipping_method,
      tracking_number: order.tracking_number,
      shipping_address: order.shipping_address,
      shipping_cost: order.shipping_cost || 0,
      admin_fee: order.admin_fee || 0,
      items: formattedItems,
      firstItemName: formattedItems[0]?.name,
      firstItemImage: formattedItems[0]?.image_url,
      firstItemProductId: formattedItems[0]?.productId,
      totalItems: formattedItems.length
    };
  });
}

export async function completeOrderAction(orderId) {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  // 1. Update Status ke 'completed'
  // RLS di database akan otomatis memastikan user hanya bisa update punya sendiri
  const { error } = await supabase
    .from('orders')
    .update({ status: 'delivered' }) 
    .eq('id', orderId)
    .eq('user_id', user.id); // Double check di query agar lebih aman

  if (error) {
    console.error("Error completing order:", error);
    return { success: false, message: error.message };
  }

  // 2. Refresh Halaman
  revalidatePath('/pesanan');
  return { success: true };
}