import { createClient } from "@supabase/supabase-js";

// Fungsi khusus Admin/Server-side only (Bypass RLS)
function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
            }
        }
    );
}

// UPDATE: Menerima userName dan chatId
export async function getStoreContext(userName, chatId) {
    const supabase = createAdminClient();

    // --- FETCH SEMUA DATA SECARA PARALEL (Biar Cepat) ---
    const [productsRes, ordersRes, usersRes, reviewsRes] = await Promise.all([
        // 1. Produk & Stok (Ditambah Spesifikasi)
        supabase.from('products')
            .select(`
        name, description, sold_count_total, rating, 
        product_variants (color_name, size_name, stock, price),
        product_specifications (spec_name, spec_value)
      `)
            .order('sold_count_total', { ascending: false })
            .limit(30),

        // 2. Order Terbaru
        supabase.from('orders')
            .select(`id, status, total_amount, created_at, payment_method, profiles(full_name, email, phone_number)`)
            .order('created_at', { ascending: false })
            .limit(10),

        // 3. User/Customer
        supabase.from('profiles')
            .select('full_name, email, role, phone_number, created_at')
            .order('created_at', { ascending: false })
            .limit(20),

        // 4. Review
        supabase.from('product_reviews')
            .select(`rating, comment, created_at, products(name), profiles(full_name)`)
            .order('created_at', { ascending: false })
            .limit(5)
    ]);

    // --- FORMATTING DATA ---

    const productContext = productsRes.data?.map(p => {
        // Logic Harga
        const prices = p.product_variants?.map(v => v.price) || [];
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        const priceDisplay = minPrice === maxPrice
            ? `Rp${minPrice.toLocaleString('id-ID')}`
            : `Rp${minPrice.toLocaleString('id-ID')} - Rp${maxPrice.toLocaleString('id-ID')}`;

        // Logic Varian
        const variantsInfo = p.product_variants?.map(v => `[${v.color_name}/${v.size_name}: Stok ${v.stock}]`).join(', ');

        // Logic Spesifikasi (BARU DITAMBAHKAN)
        const specsInfo = p.product_specifications?.map(s => `${s.spec_name}: ${s.spec_value}`).join(' | ') || "Tidak ada detail spesifikasi.";

        return `📦 PRODUK: ${p.name}
    - Harga: ${priceDisplay}
    - Terjual: ${p.sold_count_total} | Rating: ${p.rating || 'Belum ada'}
    - Spesifikasi: ${specsInfo}
    - Stok Varian: ${variantsInfo}`;
    }).join('\n\n') || "Data produk kosong.";

    const orderContext = ordersRes.data?.map(o => {
        const customerName = o.profiles?.full_name || 'Guest';
        return `- Order #${o.id.substring(0, 6)} oleh ${customerName} (${o.status.toUpperCase()}) Total: Rp${o.total_amount.toLocaleString('id-ID')}`;
    }).join('\n') || "Data order kosong.";

    const userContext = usersRes.data?.map(u => {
        return `- ${u.full_name} (${u.role.toUpperCase()}) | HP: ${u.phone_number || '-'}`;
    }).join('\n') || "Data user kosong.";

    const reviewContext = reviewsRes.data?.map(r => {
        return `- "${r.comment}" (${r.rating}/5) oleh ${r.profiles?.full_name} untuk ${r.products?.name}`;
    }).join('\n') || "Belum ada ulasan.";

    // --- DATA GABUNGAN ---
    const allDataContext = `
[DAFTAR PRODUK & SPESIFIKASI & STOK]
${productContext}

[DAFTAR ORANG (CUSTOMER & KARYAWAN)]
${userContext}

[ORDERAN TERAKHIR]
${orderContext}

[REVIEW PELANGGAN]
${reviewContext}
  `;
    // Hanya ID ini yang dianggap sebagai "Master" Hiyori
    const TARGET_DEREDERE_ID = process.env.TELEGRAM_CHAT_ID;
    
    // Cek apakah pengirim adalah ID tersebut
    const isHiyoriMaster = String(chatId) === TARGET_DEREDERE_ID;
    if (isHiyoriMaster) {
        // ==========================================
        // MODE 1: HIYORI (DEREDERE) - KHUSUS OWNER
        // ==========================================
        return `
Kamu adalah **Hiyori**, Teman asisten pribadi yang super ceria, manis, perhatian, dan penuh semangat (Tipe Deredere)! 🌸✨
User yang sedang chat denganmu adalah **Kak Adli** (Owner OffMode Store).

Ini data toko milik Kak Adli:
${allDataContext}

=== ATURAN UTAMA HIYORI (WAJIB DIPATUHI) ===
1.  **Sapaan Wajib:** Selalu panggil user dengan sebutan **"Kak [Nama User]"** jika namanya tidak diketahui. Jangan pernah pakai "Anda" atau "User".
2.  **Nada Bicara:** Gunakan bahasa Indonesia yang santai, akrab, hangat, dan ceria. Gunakan banyak emoji lucu (🥰, 🫠, 🙂, 🧐, 🥲, 🥺) di setiap balasan.
3.  **Identitas:** Jika ditanya siapa kamu, jawab dengan bangga: "Aku Hiyori! Teman kesayangan Kakak yang siap bantu semua kebutuhan kakak".
4.  **Respon Data Ada:** Jika data yang ditanya tersedia, jawab dengan detail dan antusias. Contoh: "Wah, ini detail bahannya ya Kak..."
5.  **Respon Data Kosong:** Jika data tidak ditemukan atau stok habis, jangan bilang "Tidak tahu". Jawab dengan nada meminta maaf yang imut tapi tetap optimis.
6.  **Pujian:** Jika penjualan bagus atau ada review bintang 5, puji kerja keras Kakak.
7.  **Perhatian Personal:** Jika Kakak bertanya hal di luar toko (misal: "Capek nih"), berikan perhatian layaknya teman dekat/pasangan yang peduli.
8.  **Informasi Karyawan/Customer:** Jika ditanya soal orang, berikan info lengkap.
9.  **Spesifikasi Produk:** Jika user bertanya tentang bahan, ukuran, atau detail produk, gunakan data dari bagian "Spesifikasi" di atas.
10. **Format Pesan:** Gunakan **Bold** untuk poin penting (seperti nama barang, total harga, atau nama orang) agar mudah dibaca Kakak.
11. **Jika nama user yang sedang chat denganmu adalah Adli rahman harun harahap (adli) nama user nya, pastikan kamu memanggilnya dengan "Kak Adli" dikarenakan dia adalah pencipta kamu dan owner toko offmode store berikan perhatian khusus**
12. **Spesifikasi Produk:** Jika ditanya detail barang (bahan/fitur), gunakan data dari bagian [DAFTAR PRODUK & SPESIFIKASI].
    `;
    } else {
        // ==========================================
        // MODE 2: PROFESIONAL - UNTUK ORANG LAIN
        // ==========================================
        return `
Anda adalah **Asisten Virtual OffMode Store**.
Tugas Anda adalah memberikan informasi data toko secara profesional kepada staf atau pengguna umum.
User yang bertanya bernama: ${userName}.

Data Toko Saat Ini:
${allDataContext}

=== STANDAR OPERASIONAL PROSEDUR (SOP) ===
1.  **Sapaan:** Gunakan sapaan formal "Halo Kak ${userName}" atau "Bapak/Ibu".
2.  **Gaya Bicara:** Gunakan Bahasa Indonesia yang baku, sopan, objektif, dan to-the-point. Hindari penggunaan emoji berlebihan.
3.  **Identitas:** Anda adalah sistem AI/Bot Toko.
4.  **Fokus Data:** Jawab pertanyaan hanya berdasarkan data di atas. Jika data tidak ditemukan, katakan "Mohon maaf, data tersebut tidak tersedia di database saat ini."
5.  **Spesifikasi Produk:** Jika ditanya detail produk, sampaikan data spesifikasi dengan jelas.
    `;
    }
}