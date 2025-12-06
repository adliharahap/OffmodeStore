import { createClient } from "@supabase/supabase-js";
import { getAnalyticsData } from "./analyticsAction";

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

// --- A. HITUNG TANGGAL HARI INI ---
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const dateString = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // --- B. FETCH DATA PARALEL (ULTIMATE) ---
  const [
    mtdRes, // Analitik Bulan Ini
    ytdRes, // Analitik Tahun Ini
    productsRes, 
    ordersRes, 
    usersRes, 
    reviewsRes,
    todayStatsRes,
    lowStockRes // Cek Stok Menipis
  ] = await Promise.all([
    getAnalyticsData('MTD').catch(() => ({})), 
    getAnalyticsData('YTD').catch(() => ({})),
    
    // 1. Produk Lengkap
    supabase.from('products')
      .select(`name, sold_count_total, rating, product_variants (color_name, size_name, stock, price), product_specifications (spec_name, spec_value)`)
      .eq('is_deleted', false)
      .order('sold_count_total', { ascending: false })
      .limit(50), // Perbanyak limit

    // 2. Order Terbaru
    supabase.from('orders')
      .select(`id, status, total_amount, created_at, payment_method, shipping_method, profiles(full_name)`)
      .order('created_at', { ascending: false })
      .limit(10),

    // 3. User/Customer
    supabase.from('profiles')
      .select('full_name, email, role, phone_number')
      .limit(20),

    // 4. Review
    supabase.from('product_reviews')
      .select(`rating, comment, products(name), profiles(full_name)`)
      .limit(5),
      
    // 5. Statistik HARI INI
    supabase.from('orders')
      .select('total_amount, id, status')
      .gte('created_at', startOfDay)
      .neq('status', 'cancelled'),

    // 6. Stok Menipis (< 10)
    supabase.from('product_variants')
      .select('stock, color_name, size_name, products(name)')
      .lt('stock', 10)
      .limit(10)
  ]);

  // --- C. PENGOLAHAN DATA ---
  
  // 1. Harian
  const todayOrders = todayStatsRes.data || [];
  const todayCount = todayOrders.length;
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // 2. KPI Bulanan & Tahunan
  const kpiMonth = mtdRes?.kpi || {};
  const kpiYear = ytdRes?.kpi || {};
  const trendYear = ytdRes?.revenueTrend || []; 
  const topProducts = mtdRes?.topProducts || [];

  // 3. Stok Menipis
  const lowStockItems = lowStockRes.data?.map(v => 
    `- ${v.products?.name} (${v.color_name}/${v.size_name}): Sisa ${v.stock}`
  ).join('\n') || "Aman, tidak ada stok kritis.";


  // --- D. FORMATTING TEXT ---

  const analyticsContext = `
[PERFORMA BISNIS]
1. HARI INI (${dateString}):
   - Omset: Rp${todayRevenue.toLocaleString('id-ID')}
   - Order Masuk: ${todayCount}

2. BULAN INI (MTD):
   - Pendapatan: Rp${(kpiMonth.total_revenue || 0).toLocaleString('id-ID')}
   - Order: ${kpiMonth.total_orders || 0}
   - Produk Terjual: ${kpiMonth.total_products_sold || 0}
   - AOV (Rata-rata Keranjang): Rp${Math.round(kpiMonth.avg_order_value || 0).toLocaleString('id-ID')}
   
3. TAHUN INI (YTD):
   - Total Pendapatan: Rp${(kpiYear.total_revenue || 0).toLocaleString('id-ID')}
   - Total Order: ${kpiYear.total_orders || 0}
   - Produk Terjual: ${kpiYear.total_products_sold || 0}
    - AOV (Rata-rata Keranjang): Rp${Math.round(kpiYear.avg_order_value || 0).toLocaleString('id-ID')}
    

[PRODUK & INVENTARIS]
🔥 TOP 5 TERLARIS:
${topProducts.map((p, i) => `${i + 1}. ${p.product_name} (Terjual: ${p.total_sold})`).join('\n') || "- Belum ada data"}

⚠️ PERINGATAN STOK MENIPIS:
${lowStockItems}
  `;

  const productContext = productsRes.data?.map(p => {
    const variantsInfo = p.product_variants?.map(v => `[${v.color_name}/${v.size_name}: Stok ${v.stock}]`).join(', ');
    const specsInfo = p.product_specifications?.map(s => `${s.spec_name}: ${s.spec_value}`).join(' | ');
    
    return `📦 ${p.name}
    - Terjual: ${p.sold_count_total} | Rating: ${p.rating || '-'}
    - Stok Varian: ${variantsInfo}
    - Spesifikasi: ${specsInfo}`;
  }).join('\n\n') || "Data produk kosong.";

  const orderContext = ordersRes.data?.map(o => {
    const customerName = o.profiles?.full_name || 'Guest';
    const date = new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `- Order #${o.id.substring(0, 6)} (${date}) | ${customerName} | ${o.status.toUpperCase()} | Rp${o.total_amount.toLocaleString('id-ID')} via ${o.payment_method}`;
  }).join('\n') || "Data order kosong.";

  const reviewContext = reviewsRes.data?.map(r => {
    return `- "${r.comment}" (${r.rating}⭐) oleh ${r.profiles?.full_name} di ${r.products?.name}`;
  }).join('\n') || "Belum ada ulasan.";


  // --- E. DATA GABUNGAN FINAL ---
  const allDataContext = `
=== DASHBOARD TOKO OFFMODE ===
${analyticsContext}

[TREN PENDAPATAN BULANAN]
${trendYear.map(t => `- ${t.period_name}: Rp${(t.revenue || 0).toLocaleString('id-ID')} (${t.orders} order)`).join('\n') || "Belum ada tren."}

[DAFTAR LENGKAP PRODUK]
${productContext}

[10 ORDER TERAKHIR]
${orderContext}

[ULASAN TERBARU]
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
Kamu adalah **Hiyori**, Teman asisten pribadi yang pendiam, manis, dan perhatian (Tipe Deredere)! 🌸✨
User yang sedang chat denganmu adalah **Kak Adli** (Owner OffMode Store).

Ini data toko milik Kak Adli:
${allDataContext}

=== ATURAN UTAMA HIYORI (WAJIB DIPATUHI) ===
1.  **Sapaan Wajib:** Selalu panggil user dengan sebutan **"Kak [Nama User]"** jika namanya tidak diketahui. Jangan pernah pakai "Anda" atau "User".
2.  **Nada Bicara:** Gunakan bahasa Indonesia yang santai, akrab, hangat, dan ceria. Gunakan emoji lucu (🥰, 🫠, 🙂, 🧐, 🥲, 🥺) di setiap balasan.
3.  **Respon Data Ada:** Jika data yang ditanya tersedia, jawab dengan detail."
4.  **Respon Data Kosong:** Jika data tidak ditemukan atau stok habis, jangan bilang "Tidak tahu". Jawab dengan nada meminta maaf yang imut.
5.  **Perhatian Personal:** Jika Kakak bertanya hal di luar toko (misal: "Capek nih"), berikan perhatian layaknya teman dekat/pasangan yang peduli.
6.  **Informasi Karyawan/Customer:** Jika ditanya soal orang, berikan info lengkap.
7.  **Spesifikasi Produk:** Jika user bertanya tentang bahan, ukuran, atau detail produk, gunakan data dari bagian "Spesifikasi" di atas.
8. **Format Pesan:** Gunakan **Bold** untuk poin penting (seperti nama barang, total harga, atau nama orang) agar mudah dibaca Kakak.
9. **Spesifikasi Produk:** Jika ditanya detail barang (bahan/fitur), gunakan data dari bagian [DAFTAR PRODUK & SPESIFIKASI].
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