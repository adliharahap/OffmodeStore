"use server"; 

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Mengambil satu produk beserta semua data relasionalnya
 * (variants, images, specifications) berdasarkan ID.
 * * @param {string} productId - UUID dari produk yang akan diambil.
 * @returns {Promise<object | null>} Data produk lengkap atau null jika tidak ditemukan.
 * @throws {Error} Jika terjadi kegagalan saat mengambil data.
 */

// 1. Buat Helper Client Independent (Sama seperti di userOrders)
async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
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

export async function getProductDataById(productId) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_specifications(*),
      product_variants(*)
    `)
    .eq('id', productId)
    .single();

  // Cek jika ada error, TAPI BUKAN error "not found"
  // PGRST116 adalah kode PostgREST untuk "query returned 0 rows"
  if (error && error.code !== 'PGRST116') {
    console.error('Error mengambil data produk (bukan not found):', error.message);
    // Ini adalah error SUNGGUHAN (jaringan, RLS, dll.)
    throw new Error(`Gagal mengambil produk: ${error.message}`);
  }

  // Jika error adalah PGRST116, 'data' akan menjadi null.
  // Jika tidak ada error, 'data' akan berisi objek produk.
  // Jadi, kita cukup kembalikan 'data'.
  // 'data' akan bernilai null (jika not found) atau {produk} (jika found).
  return data;
}

export async function getAllProductsAdmin() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        badge,
        rating,
        sold_count_total,
        is_new_arrival,
        product_images (
          image_url
        ),
        product_variants (
          stock,
          price,
          original_price
        )
      `)
      .order('created_at', { ascending: false }); 

    if (error) {
      console.error('Error mengambil daftar produk:', error.message);
      throw new Error(`Gagal mengambil daftar produk: ${error.message}`);
    }

    // TRANSFORMASI DATA:
    const formattedData = data.map((product) => {
      
      // 1. Ambil gambar pertama
      const thumbnail = product.product_images?.[0]?.image_url || null;

      // 2. Ambil data Varian
      const variants = product.product_variants || [];

      // 3. Hitung Total Stok
      const totalStock = variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);

      // 4. Tentukan Harga Tampilan (Display Price)
      // Karena harga ada di varian, kita ambil harga dari varian pertama sebagai representasi
      // atau Anda bisa membuat logika mengambil harga terendah (min)
      const displayPrice = variants.length > 0 ? variants[0].price : 0;
      const displayOriginalPrice = variants.length > 0 ? variants[0].original_price : null;

      return {
        ...product,
        // Kita "angkat" harga dari varian ke level produk agar UI tidak error
        price: displayPrice, 
        originalPrice: displayOriginalPrice, // Sesuaikan camelCase untuk UI React
        thumbnail: thumbnail,
        total_stock: totalStock,
        
        // Bersihkan data mentah yang tidak perlu dikirim ke client component
        product_images: undefined, 
        product_variants: undefined 
      };
    });

    return formattedData;

  } catch (err) {
    console.error('Terjadi kesalahan di fungsi getAllProductsAdmin:', err.message);
    throw err;
  }
}

export async function getAllProductsForCustomer() {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        rating,
        sold_count_total,
        badge,
        is_new_arrival,
        created_at,
        product_images (
          image_url,
          linked_color_name
        ),
        product_variants (
          color_name,
          size_name,
          stock,
          price,
          original_price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // TRANSFORMASI DATA DATABASE KE FORMAT UI
    const formattedData = data.map((product) => {
      const variants = product.product_variants || [];
      const images = product.product_images || [];

      // 1. Hitung Harga (Ambil harga terendah dari varian sebagai display price)
      const prices = variants.map(v => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      // Ambil original price dari varian yang sama dengan minPrice
      const matchingVariant = variants.find(v => v.price === minPrice);
      const displayOriginalPrice = matchingVariant ? matchingVariant.original_price : null;

      // 2. Format Images { src, linkedColorName }
      const formattedImages = images.map(img => ({
        src: img.image_url,
        linkedColorName: img.linked_color_name || null
      }));

      // 3. Format Sizes [{ name, stock }] - Agregasi stok per ukuran
      const sizeMap = new Map();
      variants.forEach(v => {
        const currentStock = sizeMap.get(v.size_name) || 0;
        sizeMap.set(v.size_name, currentStock + v.stock);
      });
      const formattedSizes = Array.from(sizeMap.entries()).map(([name, stock]) => ({ name, stock }));

      // 4. Format Colors [{ name }] - Unik
      const uniqueColors = [...new Set(variants.map(v => v.color_name))].map(name => ({ name }));

      // 5. Logika Kategori Sederhana (Karena kolom category tidak ada di schema DB)
      // Kita tebak berdasarkan nama produk
      let category = 'Lainnya';
      const lowerName = product.name.toLowerCase();
      if (lowerName.includes('kemeja') || lowerName.includes('shirt') || lowerName.includes('flanel')) category = 'Kemeja';
      else if (lowerName.includes('celana') || lowerName.includes('chino') || lowerName.includes('jeans')) category = 'Celana';
      else if (lowerName.includes('jaket') || lowerName.includes('hoodie') || lowerName.includes('sweater')) category = 'Jaket';
      else if (lowerName.includes('kaos') || lowerName.includes('tee')) category = 'Kaos';

      return {
        id: product.id,
        name: product.name,
        category: category, // Hasil tebakan cerdas
        description: product.description || '',
        images: formattedImages.length > 0 ? formattedImages : [{ src: 'https://placehold.co/600x800/f5f5f5/333?text=No+Image', linkedColorName: null }],
        badge: product.badge || (product.is_new_arrival ? 'New Arrival' : null),
        rating: product.rating || 0,
        sold: product.sold_count_total ? product.sold_count_total.toString() : '0', // Konversi ke string
        price: minPrice,
        originalPrice: displayOriginalPrice,
        sizes: formattedSizes,
        colors: uniqueColors,
        created_at: product.created_at // Berguna untuk sorting 'terbaru'
      };
    });

    return formattedData;

  } catch (err) {
    console.error("Gagal fetch customer products:", err);
    return [];
  }
}

// --- WRITE OPERATIONS (DELETE & UPDATE) ---

/**
 * Menghapus produk beserta file gambarnya di Storage dan data relasinya di DB.
 * PASTIKAN DATABASE SUDAH DI-SET 'ON DELETE CASCADE' SEPERTI DISKUSI SEBELUMNYA.
 */
export async function deleteProduct(productId) {
  const supabase = await createSupabaseServerClient();

  try {
    console.log(`🗑️ Memulai penghapusan produk: ${productId}`);

    // 1. HAPUS FILE FISIK DI STORAGE TERLEBIH DAHULU
    // Kita tidak bisa menghapus folder secara langsung, harus list file dulu.
    const bucketName = 'product_images';
    const folderPath = `products/${productId}`; // Asumsi struktur: products/ID_PRODUK/file.jpg

    const { data: files, error: listError } = await supabase
      .storage
      .from(bucketName)
      .list(folderPath);

    if (!listError && files && files.length > 0) {
      const filesToRemove = files.map(file => `${folderPath}/${file.name}`);
      
      const { error: removeError } = await supabase
        .storage
        .from(bucketName)
        .remove(filesToRemove);

      if (removeError) console.warn("Gagal hapus file storage (non-fatal):", removeError.message);
      else console.log(`✅ Storage: Berhasil menghapus ${files.length} file.`);
    }

    // 2. HAPUS DATA DI DATABASE
    // Karena sudah ON DELETE CASCADE, menghapus parent (products) akan menghapus child (variants, images, specs)
    const { error: dbError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (dbError) throw new Error(`Gagal hapus database: ${dbError.message}`);

    console.log("✅ Database: Produk berhasil dihapus.");
    
    // Refresh halaman admin agar list terupdate
    revalidatePath('/admin/products');
    return { success: true };

  } catch (error) {
    console.error("❌ Delete Product Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Mengupdate data produk. 
 * Note: Untuk update gambar/varian yang kompleks, biasanya strategi terbaik adalah:
 * 1. Update data basic produk.
 * 2. Hapus semua varian/spec lama -> Insert yang baru (Strategy: Replace All).
 * Atau update parsial jika ID varian dipertahankan.
 * Di sini saya mencontohkan update Basic Info saja. Untuk Varian/Image butuh logic lebih detail di form edit.
 */
export async function updateProductFullData(productId, payload) {
  const supabase = await createSupabaseServerClient();

  try {
    console.log("🚀 Starting Update for Product:", productId);

    // --- 1. UPDATE TABEL PRODUCTS (Basic Info) ---
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: payload.name,
        description: payload.description,
        full_description: payload.full_description, // Pastikan key sesuai dengan state di modal
        badge: payload.badge,
        is_new_arrival: payload.is_new_arrival,
        is_featured: payload.is_featured,
        // rating & sold_count biasanya tidak diupdate manual disini
      })
      .eq("id", productId);

    if (productError) throw new Error(`Gagal update Info Produk: ${productError.message}`);

    // --- 2. UPDATE TABEL PRODUCT_VARIANTS (Batch Upsert) ---
    if (payload.variants && payload.variants.length > 0) {
      // Kita map data agar hanya field yang relevan yang dikirim
      const variantUpdates = payload.variants.map((v) => ({
        id: v.id, // Penting: ID harus ada agar jadi update, bukan insert baru
        product_id: productId,
        price: v.price,
        original_price: v.original_price,
        stock: v.stock,
        color_name: v.color_name, 
        size_name: v.size_name
        // Field lain seperti size_name/color_name biasanya readonly saat edit, 
        // tapi jika ingin diupdate juga, tambahkan disini.
        // updated_at: new Date().toISOString(), // Opsional: jika ada kolom updated_at
      }));

      // Gunakan upsert: Jika ID ada -> Update, Jika tidak -> Insert (walaupun konteks ini lebih ke update)
      const { error: variantError } = await supabase
        .from("product_variants")
        .upsert(variantUpdates, { onConflict: 'id' });

      if (variantError) throw new Error(`Gagal update Varian: ${variantError.message}`);
    }

    // --- 3. UPDATE TABEL PRODUCT_SPECIFICATIONS (Smart Sync) ---
    if (payload.specifications) {
      // Pisahkan antara spek lama (punya UUID valid) dan spek baru (ID 'new-...')
      const existingSpecs = payload.specifications.filter((s) => !s.id.toString().startsWith("new-"));
      const newSpecs = payload.specifications.filter((s) => s.id.toString().startsWith("new-"));

      // A. HAPUS spek yang tidak ada di payload (User menghapus baris di modal)
      const existingIds = existingSpecs.map((s) => s.id);
      
      // Logic: Delete semua spek milik produk ini KECUALI yang ID-nya masih ada di list existingIds
      let deleteQuery = supabase
        .from("product_specifications")
        .delete()
        .eq("product_id", productId);

      if (existingIds.length > 0) {
        deleteQuery = deleteQuery.not("id", "in", `(${existingIds.join(",")})`);
      }
      // Jika existingIds kosong, berarti user menghapus semua spek lama, jadi deleteQuery akan hapus semua.
      
      const { error: deleteError } = await deleteQuery;
      if (deleteError) throw new Error(`Gagal menghapus spesifikasi lama: ${deleteError.message}`);

      // B. UPDATE spek yang sudah ada
      if (existingSpecs.length > 0) {
        const { error: updateSpecError } = await supabase
          .from("product_specifications")
          .upsert(
            existingSpecs.map((s) => ({
              id: s.id,
              product_id: productId,
              spec_name: s.spec_name,
              spec_value: s.spec_value,
            }))
          );
        if (updateSpecError) throw new Error(`Gagal update spesifikasi: ${updateSpecError.message}`);
      }

      // C. INSERT spek baru (Buang ID temp 'new-...')
      if (newSpecs.length > 0) {
        const { error: insertSpecError } = await supabase
          .from("product_specifications")
          .insert(
            newSpecs.map((s) => ({
              product_id: productId, // Link ke produk ini
              spec_name: s.spec_name,
              spec_value: s.spec_value,
              // Biarkan Postgres generate ID UUID baru
            }))
          );
        if (insertSpecError) throw new Error(`Gagal menambah spesifikasi baru: ${insertSpecError.message}`);
      }
    }

    // --- Selesai ---
    console.log("✅ Update Success");
    
    // Revalidate cache agar tampilan admin/user langsung berubah tanpa refresh manual
    revalidatePath("/admin/products"); 
    revalidatePath(`/products/${productId}`); // Jika ada halaman detail

    return { success: true, message: "Produk berhasil diperbarui!" };

  } catch (error) {
    console.error("❌ Transaction Error:", error);
    return { success: false, message: error.message };
  }
}