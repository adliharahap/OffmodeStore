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
            cookies: { getAll() { return cookieStore.getAll() }, setAll() { } },
        }
    );
}

/**
 * Mengambil semua data pesanan yang relevan untuk dashboard admin.
 * REVISI: Mengambil gambar dari tabel product_images (via products) bukan dari thumbnail_url varian.
 */
export async function getAdminOrders() {
    const supabase = await createSupabaseServerActionClient();

    try {
        const { data: ordersData, error } = await supabase
            .from('orders')
            .select(`
                id, 
                created_at, 
                status, 
                total_amount, 
                tracking_number, 
                user_id, 
                shipping_address,
                payment_method,
                shipping_cost,
                admin_fee,
                profiles!user_id(full_name, phone_number), 
                order_items(
                    quantity, 
                    price_at_purchase, 
                    variant_id, 
                    product_variants(
                        product_id, 
                        products(
                            name,
                            product_images(image_url)
                        )
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase fetch error:", error);
            return { success: false, message: error.message };
        }

        if (!ordersData) {
            return [];
        }

        // Formatting data
        const formattedOrders = ordersData.map(order => {
            // Hitung total item count
            const itemsCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);

            const itemsDetail = order.order_items.map(item => {
                // Ambil produk induk
                const product = item.product_variants?.products;

                // Ambil gambar pertama dari array product_images
                // Jika array kosong atau undefined, gunakan placeholder
                const firstImage = product?.product_images?.[0]?.image_url;

                return {
                    name: product?.name || "Produk Terhapus",
                    qty: item.quantity,
                    price: item.price_at_purchase,
                    // Gunakan gambar dari tabel images, fallback ke placeholder
                    image_url: firstImage || `https://placehold.co/100x100/94a3b8/000000?text=IMG`
                };
            });

            return {
                id: order.id,
                date: order.created_at,
                status: order.status,
                total: order.total_amount,
                customer: order.profiles ? order.profiles.full_name : 'Unknown User',
                itemsCount: itemsCount,
                tracking: order.tracking_number,
                phone: order.profiles ? order.profiles.phone_number : '',
                address: order.shipping_address || 'Alamat tidak tersedia',
                payment_method: order.payment_method || 'Unknown',
                shipping_cost: order.shipping_cost || 0,
                admin_fee: order.admin_fee || 0,
                items: itemsDetail
            };
        });

        return formattedOrders;

    } catch (e) {
        console.error("General error in getAdminOrders:", e);
        return { success: false, message: e.message };
    }
}

/**
 * Fungsi untuk update status.
 */
export async function updateOrderStatusAction(orderId, newStatus, pathToRevalidate) {
    const supabase = await createSupabaseServerActionClient();

    // 1. Cek Auth & Role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'owner', 'pegawai'].includes(profile.role)) return { success: false, message: "Forbidden" };

    // 2. Update Status
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error("Error updating status:", error);
        return { success: false, message: error.message };
    }

    // Revalidate path yang dikirim dari frontend (misal: /dashboardAdmin/...)
    if (pathToRevalidate) {
        revalidatePath(pathToRevalidate);
    } else {
        revalidatePath('/dashboardAdmin');
    }

    return { success: true };
}