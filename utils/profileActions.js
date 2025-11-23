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
          } catch { }
        },
      },
    }
  );
}

/**
 * Server Action untuk Upload Avatar, Update Profile, dan HAPUS FILE LAMA
 */
export async function uploadAvatarAction(formData) {
  console.log("Server Action Terpanggil!");
  const supabase = await createSupabaseServerActionClient();

  // 1. Ambil User yang sedang login (Auth Check)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "Unauthorized: Anda harus login." };
  }

  // --- [BARU] LANGKAH A: Ambil URL Foto Lama dari Database ---
  // Kita perlu tahu URL lama sebelum kita menimpanya
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single();

  const oldAvatarUrl = currentProfile?.avatar_url;

  // 2. Ambil File dari FormData
  const file = formData.get("file");

  if (!file || file.size === 0) {
    return { success: false, message: "File tidak ditemukan." };
  }

  // Validasi Ukuran
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, message: "Ukuran file terlalu besar (Maks 5MB)." };
  }

  try {
    // 3. Persiapkan Path Baru
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Path: user_id/timestamp.jpg

    // 4. Upload ke Storage Bucket 'profile'
    const { error: uploadError } = await supabase.storage
      .from('profile')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload Storage Error:", uploadError);
      return { success: false, message: "Gagal upload ke storage." };
    }

    // 5. Ambil Public URL Baru
    const { data: urlData } = supabase.storage
      .from('profile')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // 6. Update URL Baru ke Database
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (dbError) {
      console.error("Database Update Error:", dbError);
      return { success: false, message: "Gagal update data profil." };
    }

    // --- [BARU] LANGKAH B: Hapus Foto Lama (Cleanup) ---
    if (oldAvatarUrl) {
      // Cek apakah URL lama berasal dari bucket 'profile' kita (bukan dari Google/Github login)
      // URL biasanya format: .../storage/v1/object/public/profile/user_id/file.jpg
      const bucketName = 'profile';

      if (oldAvatarUrl.includes(`/${bucketName}/`)) {
        try {
          // Ambil path file setelah nama bucket
          const oldPath = oldAvatarUrl.split(`/${bucketName}/`).pop();

          if (oldPath) {
            const decodedPath = decodeURIComponent(oldPath);
            console.log("Mencoba menghapus file lama:", decodedPath);

            // Hapus file dan tangkap hasilnya
            const { error: removeError } = await supabase.storage
              .from(bucketName)
              .remove([decodedPath]);

            if (removeError) {
              console.error("⚠️ Gagal menghapus file lama:", removeError.message);
            } else {
              console.log("✅ Berhasil menghapus file lama:", decodedPath);
            }
          }
        } catch (err) {
          console.error("Error cleanup (Non-fatal):", err);
        }
      }
    }

    // 7. Revalidate Path
    revalidatePath('/profile');
    revalidatePath('/');

    return { success: true, message: "Foto berhasil diperbarui!", newUrl: publicUrl };

  } catch (error) {
    console.error("Unexpected Error:", error);
    return { success: false, message: "Terjadi kesalahan server." };
  }
}

// --- 1. GET PROFILE DATA ---
export async function getUserProfile() {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error("Error fetch profile:", error);
    return null;
  }

  if (!data.email) {
    data.email = user.email;
  }

  return data;
}

// --- 2. UPDATE PROFILE DATA (TEXT ONLY) ---
export async function updateProfile(formData) {
  const supabase = await createSupabaseServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.full_name,
      phone_number: formData.phone_number,
    })
    .eq('id', user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath('/profile');
  return { success: true };
}