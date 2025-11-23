"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createSupabaseServerActionClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      },
    }
  );
}

export async function getAnalyticsData(period = 'YTD') {
  const supabase = await createSupabaseServerActionClient();
  
  // 1. Cek Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Hitung Rentang Tanggal (Date Logic)
  const now = new Date();
  let startDate = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString(); // Hari ini akhir hari

  if (period === 'YTD') {
    // Year to Date: 1 Januari tahun ini
    startDate = new Date(now.getFullYear(), 0, 1);
  } else if (period === 'MTD') {
    // Month to Date: Tanggal 1 bulan ini
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'QTD') {
    // Quarter to Date: Awal kuartal saat ini
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    startDate = new Date(now.getFullYear(), quarterMonth, 1);
  }

  const startDateISO = startDate.toISOString();

  try {
    // 3. Panggil RPC Paralel dengan parameter tanggal
    const [
      kpiRes,
      revenueRes,
      statusRes,
      topProductsRes,
      stockRes
    ] = await Promise.all([
      supabase.rpc('get_dashboard_kpi', { start_date: startDateISO, end_date: endDate }),
      supabase.rpc('get_revenue_trend', { start_date: startDateISO, end_date: endDate }),
      supabase.rpc('get_order_status_distribution', { start_date: startDateISO, end_date: endDate }),
      supabase.rpc('get_top_products', { start_date: startDateISO, end_date: endDate }),
      supabase.rpc('get_product_stock_status') // Tidak butuh tanggal
    ]);

    // Error Log (Optional)
    if (kpiRes.error) console.error("KPI Error:", kpiRes.error);

    return {
      kpi: kpiRes.data || {
        total_revenue: 0,
        total_orders: 0,
        total_products_sold: 0,
        new_customers: 0,
        avg_order_value: 0
      },
      revenueTrend: revenueRes.data || [],
      statusDistribution: statusRes.data || [],
      topProducts: topProductsRes.data || [],
      stockStatus: stockRes.data || [],
    };

  } catch (error) {
    console.error("Analytics Fetch Error:", error);
    return { error: error.message };
  }
}