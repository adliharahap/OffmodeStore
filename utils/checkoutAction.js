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

  for (const item of items) {
    // UPDATE 1: Ambil kolom 'sold_count' juga
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('id, product_id, stock, price, sold_count') 
      .eq('id', item.variantId)
      .single();

    if (error || !variant) {
      return { success: false, message: `Varian produk tidak ditemukan (ID: ${item.variantId}).` };
    }

    if (variant.stock < item.quantity) {
      return { success: false, message: `Stok habis untuk salah satu produk.` };
    }

    itemsTotal += variant.price * item.quantity;
    
    validatedItems.push({
      variantId: item.variantId,
      productId: variant.product_id, 
      quantity: item.quantity,
      price: variant.price,
      currentStock: variant.stock,
      // UPDATE 2: Simpan data sold_count saat ini (default 0 jika null)
      currentVariantSold: variant.sold_count || 0 
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

  // B. Proses Setiap Item (Insert OrderItem -> Update Stok & Sold Varian -> Update Sold Produk)
  try {
    for (const item of validatedItems) {
      // 1. Insert ke Order Items
      const { error: itemError } = await supabase.from('order_items').insert({
        order_id: newOrder.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        price_at_purchase: item.price
      });
      if (itemError) throw new Error(`Gagal simpan item: ${itemError.message}`);

      // 2. UPDATE VARIANT (Kurangi Stock & Tambah Sold Count Varian)
      const newStock = item.currentStock - item.quantity;
      const newVariantSold = item.currentVariantSold + item.quantity; // Hitung sold count baru

      const { error: stockError } = await supabase
        .from('product_variants')
        .update({ 
            stock: newStock,
            sold_count: newVariantSold // <--- UPDATE KOLOM INI DI VARIANT
        })
        .eq('id', item.variantId);
      
      if (stockError) throw new Error(`Gagal update varian: ${stockError.message}`);

      // 3. UPDATE PRODUCT (Tambah Sold Count Total di Induk Produk)
      // Logic: Ambil sold_count produk saat ini -> Tambah quantity -> Update
      
      const { data: productData, error: prodFetchError } = await supabase
        .from('products')
        .select('sold_count_total')
        .eq('id', item.productId)
        .single();
      
      if (!prodFetchError && productData) {
        const currentProductSold = productData.sold_count_total || 0;
        const newProductSold = currentProductSold + item.quantity;

        await supabase
          .from('products')
          .update({ sold_count_total: newProductSold })
          .eq('id', item.productId);
      }
      
      // 4. Hapus dari Keranjang
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('variant_id', item.variantId);
    }

  } catch (err) {
    console.error("Transaction Error (Partial):", err);
    return { success: false, message: "Terjadi kesalahan saat memproses item pesanan." };
  }

  revalidatePath('/mycart');
  revalidatePath('/products');
  // Opsional: Revalidate halaman detail produk agar sold count terupdate real-time
  revalidatePath(`/products/[slug]`); 

  return { success: true, orderId: newOrder.id, total: grandTotal };
}