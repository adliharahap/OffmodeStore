"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "./telegramNotifier"; // Pastikan path import ini benar

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

export async function processCheckoutAction({
  addressId,
  paymentMethod,
  items // Array of { variantId, quantity, price }
}) {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Anda harus login." };

  // --- 1. VALIDASI ALAMAT ---
  const { data: addressData, error: addrError } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('id', addressId)
    .single();

  if (addrError || !addressData) return { success: false, message: "Alamat tidak valid." };
  const fullAddressSnapshot = `${addressData.recipient_name} (${addressData.phone_number}) - ${addressData.street}, ${addressData.city}, ${addressData.province}, ${addressData.postal_code}`;

  // --- 2. MAPPING PAYMENT ---
  const paymentLabelMap = {
    'qris': 'QRIS', 'gopay': 'GoPay', 'ovo': 'OVO', 'dana': 'DANA',
    'shopeepay': 'ShopeePay', 'bca': 'BCA Virtual Account',
    'mandiri': 'Mandiri Virtual Account', 'bni': 'BNI Virtual Account',
    'bri': 'BRI Virtual Account', 'shopee_paylater': 'Shopee PayLater',
    'gopay_later': 'GoPay Later'
  };
  const paymentMethodLabel = paymentLabelMap[paymentMethod] || paymentMethod || 'Unknown';

  // --- 3. VALIDASI STOK & HITUNG TOTAL ---
  let itemsTotal = 0;
  const shippingCost = 15000; 
  const adminFee = 1000;
  const validatedItems = [];
  const telegramItems = [];

  for (const item of items) {
    // FIX: Tambahkan 'product_id' di dalam select agar tidak undefined
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('id, product_id, stock, price, color_name, size_name, sold_count, products(name)') 
      .eq('id', item.variantId)
      .single();

    if (error || !variant) {
      return { success: false, message: `Varian produk tidak ditemukan (ID: ${item.variantId}).` };
    }

    if (variant.stock < item.quantity) {
      return { success: false, message: `Stok habis untuk produk: ${variant.products?.name} (${variant.color_name}).` };
    }

    itemsTotal += variant.price * item.quantity;
    
    validatedItems.push({
      variantId: item.variantId,
      productId: variant.product_id, // Sekarang ini aman karena sudah di-select
      quantity: item.quantity,
      price: variant.price,
      currentStock: variant.stock,
      currentVariantSold: variant.sold_count || 0 
    });

    // Data untuk Telegram
    telegramItems.push({
      productName: variant.products?.name || 'Unknown Product',
      variantColor: variant.color_name,
      variantSize: variant.size_name,
      quantity: item.quantity,
      price: variant.price
    });
  }

  const grandTotal = itemsTotal + shippingCost + adminFee;

  // --- 4. TRANSACTION BLOCK (Manual Logic) ---
  
  // A. Buat Order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'paid', 
      total_amount: grandTotal,
      shipping_cost: shippingCost,
      admin_fee: adminFee,
      shipping_address: fullAddressSnapshot,
      shipping_method: 'JNE Reguler',
      payment_method: paymentMethodLabel,
      tracking_number: `TRX-${Date.now()}`,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order Error:", orderError);
    return { success: false, message: "Gagal membuat pesanan." };
  }

  // B. Proses Setiap Item
  try {
    for (const item of validatedItems) {
      // 1. Insert ke Order Items (User biasa boleh insert ini jika RLS order_items benar)
      const { error: itemError } = await supabase.from('order_items').insert({
        order_id: newOrder.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        price_at_purchase: item.price
      });
      if (itemError) throw new Error(`Gagal simpan item: ${itemError.message}`);

      // 2. UPDATE STOK & SOLD (PAKAI RPC BIAR AMAN DARI RLS)
      // Kita panggil fungsi database yang sudah kita buat tadi
      const { error: rpcError } = await supabase.rpc('process_order_item', {
        p_variant_id: item.variantId,
        p_product_id: item.productId,
        p_quantity: item.quantity
      });

      if (rpcError) throw new Error(`Gagal update stok (RPC): ${rpcError.message}`);
      
      // 3. Hapus dari Keranjang
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('variant_id', item.variantId);
    }

  } catch (err) {
    console.error("Transaction Error (Partial):", err);
    // Note: Karena Supabase HTTP API tidak support transaction rollback penuh secara natif di client library,
    // jika error di tengah loop, sebagian data mungkin sudah tersimpan. 
    // Untuk MVP ini sudah cukup baik.
    return { success: false, message: "Terjadi kesalahan saat memproses item pesanan." };
  }

  // --- 5. REVALIDASI & NOTIFIKASI ---
  revalidatePath('/mycart');
  revalidatePath('/products');
  revalidatePath('/pesanan'); // Refresh halaman order history user

  // Kirim Notif ke Telegram
  const customerName = user.user_metadata?.full_name || addressData.recipient_name || "Pelanggan";
  
  // Kita jalankan tanpa await agar return ke user lebih cepat (Fire and Forget)
  // atau pakai await jika ingin memastikan notif terkirim sebelum sukses.
  // Disini saya pakai await biar aman.
  await sendTelegramNotification({
    orderId: newOrder.id,
    totalAmount: grandTotal,
    customerName: customerName,
    address: fullAddressSnapshot,
    paymentMethod: paymentMethodLabel,
    items: telegramItems,
    status: newOrder.status
  });

  return { success: true, orderId: newOrder.id, total: grandTotal };
}