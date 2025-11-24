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

export async function getUserAddresses() {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false }); 

  return data || [];
}

// --- BAGIAN YANG DIPERBAIKI ---
export async function addUserAddress(formData) {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Login required" };

  // Mapping data dari form (frontend) ke nama kolom database
  const addressData = {
    user_id: user.id,
    address_label: formData.address_label,
    recipient_name: formData.recipient_name, // Kolom baru
    phone_number: formData.phone,            // MAPPING: form.phone -> db.phone_number
    street: formData.street,
    city: formData.city,
    province: formData.province,
    postal_code: formData.postal_code,
    is_default: false // Default logic sederhana
  };

  const { error } = await supabase
    .from('user_addresses')
    .insert(addressData); // Insert data yang sudah di-mapping

  if (error) {
    console.error("Error add address:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath('/checkout');
  return { success: true };
}

export async function updateAddressAction(addressId, formData) {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  // Mapping data (sama seperti insert)
  const addressData = {
    address_label: formData.address_label,
    recipient_name: formData.recipient_name,
    phone_number: formData.phone, // Mapping 'phone' -> 'phone_number'
    street: formData.street,
    city: formData.city,
    province: formData.province,
    postal_code: formData.postal_code,
    // is_default bisa ditambahkan logic khusus jika perlu
  };

  const { error } = await supabase
    .from('user_addresses')
    .update(addressData)
    .eq('id', addressId)
    .eq('user_id', user.id); // Pastikan hanya update milik sendiri

  if (error) {
    console.error("Error update address:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath('/profile'); // Refresh halaman profile
  revalidatePath('/checkout'); // Refresh halaman checkout jika user sedang disana
  return { success: true };
}

// --- HAPUS ALAMAT ---
export async function deleteAddressAction(addressId) {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id); // Pastikan hanya hapus milik sendiri

  if (error) {
    console.error("Error delete address:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath('/profile');
  revalidatePath('/checkout');
  return { success: true };
}