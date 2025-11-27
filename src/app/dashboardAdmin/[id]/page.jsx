"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, ShoppingBag, Package, TrendingUp, 
  Zap, Tag, Layers, Banknote, Calculator, Filter, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { getAnalyticsData } from '../../../../utils/analyticsAction';

// Register Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// --- UTILS ---
const COLORS = {
  purple: '#a855f7', green: '#10b981', blue: '#3b82f6', 
  yellow: '#facc15', red: '#ef4444', cyan: '#06b6d4', 
  gray: '#9ca3af', lightGray: '#e5e7eb', darkGray: '#4b5563', white: '#ffffff',
  bca: '#1e3a8a', mandiri: '#f59e0b', gopay: '#10b981', qris: '#8b5cf6', other: '#64748b'
};

const formatRupiah = (number) => {
  if (number === undefined || number === null) return 'Rp0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(number);
};

const getGlobalOptions = (isDark, isCurrency = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: isDark ? COLORS.gray : COLORS.darkGray } },
    tooltip: {
      callbacks: {
        label: (context) => {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (isCurrency || context.parsed.y > 1000000) { // Heuristic for currency
             label += formatRupiah(context.parsed.y);
          } else {
             label += context.formattedValue;
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: { 
      ticks: { color: isDark ? COLORS.gray : COLORS.darkGray } 
    },
    y: { 
      // INI YANG MENGHILANGKAN GARIS HORIZONTAL
      grid: { 
        display: false, 
        drawBorder: false 
      }, 
      ticks: { color: isDark ? COLORS.gray : COLORS.darkGray } 
    }
  }
});

// --- SUB COMPONENTS ---

const KpiCard = ({ title, value, icon: Icon, color, isCurrency, loading }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex-1 min-w-[200px] bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
      ) : (
        <h3 className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
          {isCurrency ? formatRupiah(value) : value?.toLocaleString('id-ID')}
        </h3>
      )}
    </div>
  </motion.div>
);

const ChartBox = ({ title, children, icon: Icon, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-[450px]"
  >
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
      <Icon className="w-5 h-5 text-purple-600" /> {title}
    </h2>
    <div className="w-full h-[calc(100%-48px)] relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-10">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      ) : children}
    </div>
  </motion.div>
);

// --- MAIN DASHBOARD ---

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('YTD'); 
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpi: {},
    revenueTrend: [],
    statusDistribution: [],
    topProducts: [],
    stockStatus: [],
  });

  // Dark mode detection
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
    }
  }, []);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getAnalyticsData(selectedPeriod);
        if (!result.error) {
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  // --- CHART DATA PREPARATION ---

  const revenueChartData = {
    labels: data.revenueTrend.map(d => d.period_name),
    datasets: [
      {
        type: 'line',
        label: 'Pesanan',
        data: data.revenueTrend.map(d => d.orders),
        borderColor: COLORS.purple,
        backgroundColor: COLORS.purple,
        yAxisID: 'y1',
        tension: 0.5,
        borderWidth: 3, 
      },
      {
        type: 'line',
        label: 'Pendapatan',
        data: data.revenueTrend.map(d => d.revenue),
        borderColor: COLORS.green,
        backgroundColor: COLORS.green + '30',
        fill: 'start',
        yAxisID: 'y',
        tension: 0.3,
      },
    ],
  };

  const statusChartData = {
    labels: data.statusDistribution.map(d => d.status),
    datasets: [{
      data: data.statusDistribution.map(d => d.count),
      backgroundColor: [COLORS.green, COLORS.purple, COLORS.blue, COLORS.yellow, COLORS.red, COLORS.gray],
      borderWidth: 0,
    }],
  };

  const topProductChartData = {
    labels: data.topProducts.map(d => d.product_name),
    datasets: [{
      label: 'Qty Terjual',
      data: data.topProducts.map(d => d.total_sold),
      backgroundColor: COLORS.purple,
      borderRadius: 4,
    }],
  };

  const stockChartData = {
    labels: data.stockStatus.map(d => d.name),
    datasets: [
      {
        label: 'Stok Saat Ini',
        data: data.stockStatus.map(d => d.current_stock),
        backgroundColor: COLORS.purple,
      },
      {
        label: 'Safety Stock',
        data: data.stockStatus.map(d => d.safety_stock),
        backgroundColor: COLORS.yellow,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans pb-10 pt-20 md:pt-0 transition-colors duration-300">
      <main className="mx-auto p-4 md:p-8">
        
        {/* Header & Filter */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3 text-purple-800 dark:text-purple-400">
              <TrendingUp className="w-7 h-7" /> Admin Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Real-time data dari database Anda.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border dark:border-gray-700 shadow-sm">
            <Filter className="w-4 h-4 text-purple-600" />
            {['YTD', 'MTD', 'QTD'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                disabled={loading}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all
                  ${selectedPeriod === period 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {period === 'YTD' ? 'Tahun Ini' : period === 'MTD' ? 'Bulan Ini' : 'Kuartal Ini'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="flex flex-wrap gap-4 mb-8">
          <KpiCard title="Total Pendapatan" value={data.kpi.total_revenue} icon={DollarSign} color="text-green-500" isCurrency loading={loading} />
          <KpiCard title="Total Pesanan" value={data.kpi.total_orders} icon={ShoppingBag} color="text-purple-600" loading={loading} />
          <KpiCard title="Produk Terjual" value={data.kpi.total_products_sold} icon={Package} color="text-yellow-600" loading={loading} />
          <KpiCard title="Pelanggan Baru" value={data.kpi.new_customers} icon={Users} color="text-blue-500" loading={loading} />
          <KpiCard title="Avg. Order Value" value={data.kpi.avg_order_value} icon={Calculator} color="text-cyan-500" isCurrency loading={loading} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Trend */}
          <div className="lg:col-span-2">
            <ChartBox title={`Tren Pendapatan (${selectedPeriod})`} icon={Zap} loading={loading}>
              {data.revenueTrend.length > 0 ? (
                <Line 
                  options={{
                    ...getGlobalOptions(isDark, true),
                    scales: {
                      ...getGlobalOptions(isDark).scales,
                      y1: { position: 'right', grid: { display: false } }
                    }
                  }} 
                  data={revenueChartData} 
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">Tidak ada data untuk periode ini</div>
              )}
            </ChartBox>
          </div>

          {/* Order Status */}
          <div>
            <ChartBox title="Distribusi Status" icon={Layers} loading={loading}>
               {data.statusDistribution.length > 0 ? (
                  <Pie options={getGlobalOptions(isDark)} data={statusChartData} />
               ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">Tidak ada data</div>
               )}
            </ChartBox>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-2">
            <ChartBox title="Top 5 Produk Terlaris" icon={Tag} loading={loading}>
               {data.topProducts.length > 0 ? (
                 <Bar 
                   options={{ ...getGlobalOptions(isDark), indexAxis: 'y' }} 
                   data={topProductChartData} 
                 />
               ) : (
                 <div className="flex h-full items-center justify-center text-gray-400">Belum ada penjualan</div>
               )}
            </ChartBox>
          </div>

          {/* Stock Status */}
          <div>
            <ChartBox title="Monitoring Stok (Terendah)" icon={Package} loading={loading}>
               <Bar options={getGlobalOptions(isDark)} data={stockChartData} />
            </ChartBox>
          </div>

        </div>
      </main>
    </div>
  );
}