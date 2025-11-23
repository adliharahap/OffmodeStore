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

export async function getAllUsers() {
  const supabase = await createSupabaseServerActionClient();

  // 1. CEK APAKAH USER TERDETEKSI
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) console.error("Auth Error:", authError.message);
  if (!user) return []; 

  // 2. FETCH DATA PROFILES
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase Query Error:", error.message);
    return [];
  }

  // Format Data
  return data.map(profile => ({
    id: profile.id,
    name: profile.full_name || 'Tanpa Nama',
    email: profile.email || '-', 
    phone: profile.phone_number || '-',
    role: profile.role || 'customer',
    avatar_url: profile.avatar_url,
    last_active: profile.created_at 
  }));
}
/**
 * Mengupdate Role User.
 * @param {string} userId 
 * @param {string} newRole 
 */
export async function updateUserRoleAction(userId, newRole) {
  const supabase = await createSupabaseServerActionClient();
  
  // Cek Permission Admin di sini (Security Layer)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };
  
  // Cek apakah user target adalah owner (Proteksi)
  // (Logic ini sebaiknya ada di RLS juga)

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) return { success: false, message: error.message };

  revalidatePath('/dashboardAdmin/users'); // Sesuaikan path halaman admin user Anda
  return { success: true };
}

/**
 * Menghapus User (Hanya menghapus data profile, bukan akun Auth sebenarnya).
 * Untuk hapus akun Auth butuh Supabase Admin API (Service Role Key) yang lebih kompleks.
 * Di sini kita hanya 'soft delete' atau hapus dari tabel profiles.
 */
export async function deleteUserAction(userId) {
  const supabase = await createSupabaseServerActionClient();

  // Validasi Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  // Hapus dari profiles
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) return { success: false, message: error.message };

  revalidatePath('/dashboardAdmin/users');
  return { success: true };
}