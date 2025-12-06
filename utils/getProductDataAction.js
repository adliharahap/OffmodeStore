"use server"; 

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * HELPER: Membuat Supabase Client untuk Server Action
 */
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
              // Ignore
            }
        },
      },
    }
  );
}

// ==========================================
// READ OPERATIONS (GET)
// ==========================================

/**
 * Mengambil detail satu produk berdasarkan ID
 */
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

  if (error && error.code !== 'PGRST116') {
    console.error('Error mengambil data produk:', error.message);
    throw new Error(`Gagal mengambil produk: ${error.message}`);
  }

  return data;
}

/**
 * Mengambil semua produk untuk halaman ADMIN (Table List)
 * Filter: Hanya produk yang belum dihapus (is_deleted = false)
 */
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
        is_deleted, 
        product_images (
          image_url
        ),
        product_variants (
          stock,
          price,
          original_price
        )
      `)
      .eq('is_deleted', false) // <--- HANYA AMBIL YANG AKTIF
      .order('created_at', { ascending: false }); 

    if (error) {
      console.error('Error mengambil daftar produk:', error.message);
      throw new Error(`Gagal mengambil daftar produk: ${error.message}`);
    }

    // TRANSFORMASI DATA ADMIN
    const formattedData = data.map((product) => {
      const thumbnail = product.product_images?.[0]?.image_url || null;
      const variants = product.product_variants || [];
      const totalStock = variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
      const displayPrice = variants.length > 0 ? variants[0].price : 0;
      const displayOriginalPrice = variants.length > 0 ? variants[0].original_price : null;

      return {
        ...product,
        price: displayPrice, 
        originalPrice: displayOriginalPrice,
        thumbnail: thumbnail,
        total_stock: totalStock,
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

/**
 * Mengambil semua produk untuk halaman CUSTOMER (Landing Page/Shop)
 * Filter: Hanya produk yang belum dihapus (is_deleted = false)
 */
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
        is_deleted,
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
      .eq('is_deleted', false) // <--- JANGAN TAMPILKAN PRODUK SAMPAH KE CUSTOMER
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // TRANSFORMASI DATA CUSTOMER
    const formattedData = data.map((product) => {
      const variants = product.product_variants || [];
      const images = product.product_images || [];

      // 1. Hitung Harga (Min Price)
      const prices = variants.map(v => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const matchingVariant = variants.find(v => v.price === minPrice);
      const displayOriginalPrice = matchingVariant ? matchingVariant.original_price : null;

      // 2. Format Images
      const formattedImages = images.map(img => ({
        src: img.image_url,
        linkedColorName: img.linked_color_name || null
      }));

      // 3. Format Sizes (Agregasi Stok)
      const sizeMap = new Map();
      variants.forEach(v => {
        const currentStock = sizeMap.get(v.size_name) || 0;
        sizeMap.set(v.size_name, currentStock + v.stock);
      });
      const formattedSizes = Array.from(sizeMap.entries()).map(([name, stock]) => ({ name, stock }));

      // 4. Format Colors
      const uniqueColors = [...new Set(variants.map(v => v.color_name))].map(name => ({ name }));

      // 5. Tebak Kategori dari Nama
      let category = 'Lainnya';
      const lowerName = product.name.toLowerCase();
      if (lowerName.includes('kemeja') || lowerName.includes('shirt') || lowerName.includes('flanel')) category = 'Kemeja';
      else if (lowerName.includes('celana') || lowerName.includes('chino') || lowerName.includes('jeans')) category = 'Celana';
      else if (lowerName.includes('jaket') || lowerName.includes('hoodie') || lowerName.includes('sweater')) category = 'Jaket';
      else if (lowerName.includes('kaos') || lowerName.includes('tee')) category = 'Kaos';

      return {
        id: product.id,
        name: product.name,
        category: category,
        description: product.description || '',
        images: formattedImages.length > 0 ? formattedImages : [{ src: 'https://placehold.co/600x800/f5f5f5/333?text=No+Image', linkedColorName: null }],
        badge: product.badge || (product.is_new_arrival ? 'New Arrival' : null),
        rating: product.rating || 0,
        sold: product.sold_count_total ? product.sold_count_total.toString() : '0',
        price: minPrice,
        originalPrice: displayOriginalPrice,
        sizes: formattedSizes,
        colors: uniqueColors,
        created_at: product.created_at
      };
    });

    return formattedData;

  } catch (err) {
    console.error("Gagal fetch customer products:", err);
    return [];
  }
}

// ==========================================
// WRITE OPERATIONS (DELETE & UPDATE)
// ==========================================

/**
 * SOFT DELETE PRODUK
 * Mengubah status is_deleted menjadi true.
 * Data tidak dihapus fisik agar riwayat order aman.
 */
export async function deleteProduct(productId) {
  const supabase = await createSupabaseServerClient();

  try {
    console.log(`🗑️ Memulai SOFT DELETE produk: ${productId}`);

    // Update status di database menjadi terhapus
    const { error: dbError } = await supabase
      .from('products')
      .update({ is_deleted: true }) 
      .eq('id', productId);

    if (dbError) throw new Error(`Gagal menghapus database: ${dbError.message}`);

    console.log("✅ Database: Produk berhasil diarsipkan (Soft Delete).");
    
    // Refresh cache
    revalidatePath('/admin/products');
    revalidatePath('/'); 
    return { success: true };

  } catch (error) {
    console.error("❌ Delete Product Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * UPDATE PRODUK (Full Data)
 * Termasuk Basic Info, Variant, dan Spesifikasi
 */
export async function updateProductFullData(productId, payload) {
  const supabase = await createSupabaseServerClient();

  try {
    console.log("🚀 Starting Update for Product:", productId);

    // 1. UPDATE TABEL PRODUCTS (Basic Info)
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: payload.name,
        description: payload.description,
        full_description: payload.full_description,
        badge: payload.badge,
        is_new_arrival: payload.is_new_arrival,
        is_featured: payload.is_featured,
      })
      .eq("id", productId);

    if (productError) throw new Error(`Gagal update Info Produk: ${productError.message}`);

    // 2. PROSES VARIANTS (PISAHKAN INSERT & UPDATE)
    if (payload.variants && payload.variants.length > 0) {
      const newVariants = [];
      const existingVariants = [];
      const existingVariantIds = [];

      payload.variants.forEach((v) => {
        const isNew = v.id.toString().startsWith('new') || v.id.toString().startsWith('temp');
        
        const variantData = {
          product_id: productId,
          price: v.price,
          original_price: v.original_price,
          stock: v.stock,
          color_name: v.color_name, 
          size_name: v.size_name
        };

        if (isNew) {
          newVariants.push(variantData); // Tanpa ID, biar auto-generate
        } else {
          existingVariants.push({ ...variantData, id: v.id }); // Dengan ID
          existingVariantIds.push(v.id);
        }
      });

      // A. Hapus varian lama yang dibuang user di UI
      if (existingVariantIds.length > 0) {
         await supabase.from('product_variants')
            .delete()
            .eq('product_id', productId)
            .not('id', 'in', `(${existingVariantIds.join(',')})`);
      } else if (existingVariants.length === 0 && newVariants.length > 0) {
         // Jika user menghapus semua varian lama dan mengganti baru semua
         await supabase.from('product_variants').delete().eq('product_id', productId);
      }

      // B. Update Existing (Upsert)
      if (existingVariants.length > 0) {
        const { error: updateError } = await supabase
            .from("product_variants")
            .upsert(existingVariants, { onConflict: 'id' });
        if (updateError) throw new Error(`Gagal update Varian Lama: ${updateError.message}`);
      }

      // C. Insert New (Insert Biasa tanpa ID)
      if (newVariants.length > 0) {
        const { error: insertError } = await supabase
            .from("product_variants")
            .insert(newVariants);
        if (insertError) throw new Error(`Gagal tambah Varian Baru: ${insertError.message}`);
      }
    }

    // 3. PROSES IMAGES (SYNC WARNA & INSERT BARU)
    if (payload.images && payload.images.length > 0) {
        const imagesToUpsert = payload.images.map(img => {
            const isNewImg = img.id.toString().startsWith('new-img');
            
            const imgData = {
                product_id: productId,
                image_url: img.image_url,
                linked_color_name: img.linked_color_name // Ini akan menimpa data lama dengan nama baru
            };

            // Jika bukan gambar baru, sertakan ID agar jadi UPDATE, bukan INSERT
            if (!isNewImg) {
                imgData.id = img.id;
            }
            
            return imgData;
        });

        // Lakukan Upsert Massal
        const { error: imgError } = await supabase
            .from("product_images")
            .upsert(imagesToUpsert, { onConflict: 'id' });
        
        if (imgError) throw new Error(`Gagal update Gambar: ${imgError.message}`);
    }

    // 4. UPDATE SPECIFICATIONS (Logic sama: Pisah Insert & Update)
    if (payload.specifications) {
      const newSpecs = [];
      const existingSpecs = [];
      const existingSpecIds = [];

      payload.specifications.forEach(s => {
        if (s.id.toString().startsWith("new-")) {
             newSpecs.push({ product_id: productId, spec_name: s.spec_name, spec_value: s.spec_value });
        } else {
             existingSpecs.push({ id: s.id, product_id: productId, spec_name: s.spec_name, spec_value: s.spec_value });
             existingSpecIds.push(s.id);
        }
      });
      
      // Hapus
      let deleteQuery = supabase.from("product_specifications").delete().eq("product_id", productId);
      if (existingSpecIds.length > 0) {
        deleteQuery = deleteQuery.not("id", "in", `(${existingSpecIds.join(",")})`);
      }
      await deleteQuery;

      // Upsert Existing
      if (existingSpecs.length > 0) {
        await supabase.from("product_specifications").upsert(existingSpecs);
      }

      // Insert New
      if (newSpecs.length > 0) {
        await supabase.from("product_specifications").insert(newSpecs);
      }
    }

    console.log("✅ Update Success");
    revalidatePath("/admin/products"); 
    revalidatePath(`/products/${productId}`); 

    return { success: true, message: "Produk berhasil diperbarui!" };

  } catch (error) {
    console.error("❌ Transaction Error:", error);
    return { success: false, message: error.message };
  }
}