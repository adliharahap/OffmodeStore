"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    History,
    Package,
    Truck,
    CheckCircle,
    Clock,
    DollarSign,
    TrendingUp,
    Banknote
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// --- IMPORT KOMPONEN MODULAR ---
import SummaryCards from './_components/SumaryCard';
import OrderTable from './_components/OrderTable';
import OrderDetailModal from './_components/OrderDetailModal';
import OrderFilterBar from './_components/OrderFilterBar';
import StatusTabs from './_components/StatusTabs';
import { getAdminOrders } from '../../../../../utils/adminOrderAction';

// IMPORT SERVER ACTION

export default function AdminOrderDashboard() {
    // --- STATE ---
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const [activeTab, setActiveTab] = useState('all'); // Default tab 'all' lebih umum
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortMethod, setSortMethod] = useState('newest');
    const [revenueData, setRevenueData] = useState({ today: 0, month: 0, year: 0 });

    // --- 1. FETCH DATA ---
    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const data = await getAdminOrders();
            
            if (Array.isArray(data)) {
                setOrders(data);
                
                // Hitung Revenue Sederhana dari data yang ada
                // (Idealnya ini dihitung di backend agar performa lebih baik jika data ribuan)
                const today = new Date().toDateString();
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                let todayRev = 0, monthRev = 0, yearRev = 0;

                data.forEach(order => {
                    // Asumsi hanya menghitung order yang sudah dibayar ('paid', 'shipped', 'delivered')
                    if (['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(order.status)) {
                         const orderDate = new Date(order.date);
                         const amount = order.total || 0;
                         
                         if (orderDate.toDateString() === today) todayRev += amount;
                         if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) monthRev += amount;
                         if (orderDate.getFullYear() === currentYear) yearRev += amount;
                    }
                });

                setRevenueData({ today: todayRev, month: monthRev, year: yearRev });

            } else {
                console.error("Failed to fetch orders:", data.message);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);


    // --- 2. SUMMARY COUNT ---
    // Hitung jumlah order berdasarkan status untuk badge di Tab & Summary Card
    const countPending = orders.filter(o => o.status === 'pending').length;
    const countProcessing = orders.filter(o => o.status === 'paid' || o.status === 'processing').length; // Handle kedua kemungkinan
    const countShipped = orders.filter(o => o.status === 'shipped').length;
    const countCompleted = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;


    // --- 3. FILTER & SORT LOGIC ---
    const filteredAndSortedOrders = useMemo(() => {
        let result = [...orders]; // Copy array agar state asli aman

        // A. Filter Status (Tab)
        if (activeTab !== 'all') {
            // Mapping khusus jika tab 'paid' harus mencakup 'processing' juga
            if (activeTab === 'paid') {
                 result = result.filter(order => order.status === 'paid' || order.status === 'processing');
            } else if (activeTab === 'completed') {
                 result = result.filter(order => order.status === 'completed' || order.status === 'delivered');
            } else {
                 result = result.filter(order => order.status === activeTab);
            }
        }

        // B. Filter Pencarian
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(order =>
                order.id?.toLowerCase().includes(lowerTerm) ||
                order.customer?.toLowerCase().includes(lowerTerm) ||
                order.tracking?.toLowerCase().includes(lowerTerm) ||
                order.payment_method?.toLowerCase().includes(lowerTerm) ||
                order.phone?.toLowerCase().includes(lowerTerm)
            );
        }

        // C. Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortMethod === 'oldest' ? dateA - dateB : dateB - dateA; // Default newest
        });

        return result;
    }, [orders, activeTab, searchTerm, sortMethod]);


    // --- DATA PROPS ---
    const tabs = [
        { key: 'all', label: 'Semua', count: orders.length },
        { key: 'pending', label: 'Belum Bayar', count: countPending },
        { key: 'paid', label: 'Siap Kirim', count: countProcessing },
        { key: 'shipped', label: 'Dalam Pengiriman', count: countShipped },
        { key: 'completed', label: 'Selesai', count: countCompleted },
    ];

    const sortOptions = [
        { key: 'newest', label: 'Terbaru ke Terlama' },
        { key: 'oldest', label: 'Terlama ke Terbaru' },
    ];

    const SummaryData = [
        { title: 'Pesanan Belum Bayar', count: countPending, icon: Clock, colorClass: 'text-yellow-600', isRevenue: false },
        { title: 'Siap Dikirim', count: countProcessing, icon: Package, colorClass: 'text-purple-600', isRevenue: false },
        { title: 'Sedang Dikirim', count: countShipped, icon: Truck, colorClass: 'text-blue-600', isRevenue: false },
        { title: 'Selesai', count: countCompleted, icon: CheckCircle, colorClass: 'text-green-600', isRevenue: false },
        { title: 'Pendapatan Hari Ini', count: revenueData.today, icon: DollarSign, colorClass: 'text-yellow-600', isRevenue: true },
        { title: 'Pendapatan Bulan Ini', count: revenueData.month, icon: TrendingUp, colorClass: 'text-red-600', isRevenue: true },
        { title: 'Pendapatan Tahun Ini', count: revenueData.year, icon: Banknote, colorClass: 'text-cyan-600', isRevenue: true },
    ];


    // --- HANDLERS ---
    
    // Fungsi update status yang dipanggil oleh Child Component
    const handleUpdateStatus = async (orderId, newStatus) => {
        // Panggil Server Action (Imported)
        // Catatan: Anda bisa memanggil action ini di sini atau di dalam child component OrderTable.
        // Jika child component sudah memanggilnya, di sini kita cukup refresh data.
        
        // Refresh data agar tampilan sinkron dengan database
        await fetchOrders();
    };

    const handleOpenDetail = (order) => setSelectedOrder(order);
    const handleCloseDetail = () => setSelectedOrder(null);


    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
            <main className="mx-auto p-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-purple-800">
                        <History className="w-7 h-7" /> Dashboard Pesanan
                    </h1>
                    <p className="text-gray-500 mt-1">Pantau pesanan masuk dan kelola status pengiriman.</p>
                </div>

                {/* 1. Summary Cards */}
                <SummaryCards summaryData={SummaryData} />

                {/* 2. Filter Bar */}
                <OrderFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortMethod={sortMethod}
                    setSortMethod={setSortMethod}
                    sortOptions={sortOptions}
                />

                {/* 3. Tabs */}
                <StatusTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* 4. Table Content */}
                {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20 text-purple-600">
                        <svg className="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.415, 31.415" strokeLinecap="round" fill="none"></circle></svg>
                        <p className="font-medium">Memuat data pesanan...</p>
                    </div>
                ) : (
                    <OrderTable
                        orders={filteredAndSortedOrders}
                        onUpdateStatus={handleUpdateStatus}
                        onOpenDetail={handleOpenDetail}
                    />
                )}

            </main>

            {/* Modal Detail */}
            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailModal order={selectedOrder} onClose={handleCloseDetail} />
                )}
            </AnimatePresence>

        </div>
    );
}