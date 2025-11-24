// OrderTable.jsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStatusDetails, formatRupiah } from "../utils/utils";
import {
    User,
    ExternalLink,
    Send,
    Loader2,
    List,
    Smartphone,
    CheckCheck,
} from "lucide-react";

// IMPORT SERVER ACTION
import { usePathname } from 'next/navigation';
import { updateOrderStatusAction } from "../../../../../../utils/adminOrderAction";

export default function OrderTable({ orders, onUpdateStatus, onOpenDetail }) {
    const [loadingId, setLoadingId] = useState(null);
    const currentPath = usePathname();

    const handleUpdate = async (orderId, currentStatus) => {
        setLoadingId(orderId);

        // Logika transisi status (REAL)
        let nextStatus = currentStatus;
        if (currentStatus === "paid") {
            nextStatus = "shipped";
        } else if (currentStatus === "shipped") {
            nextStatus = "delivered";
        } else {
            setLoadingId(null);
            return; // Tidak ada aksi jika status lain
        }

        // Panggil Server Action Nyata
        const result = await updateOrderStatusAction(orderId, nextStatus, currentPath);

        if (result.success) {
            // Karena sukses, kita minta parent (page.jsx) untuk refresh data
            onUpdateStatus(orderId, nextStatus); // Panggil fungsi di parent
        } else {
            alert(`Gagal update status di database: ${result.message}`);
        }

        setLoadingId(null);
    };

    // 1. HELPER: FORMAT NOMOR HP (08 -> 628)
    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        // Hapus spasi atau karakter non-digit
        let cleanPhone = phone.replace(/\D/g, '');

        // Jika diawali 08, ganti 0 dengan 62
        if (cleanPhone.startsWith('08')) {
            cleanPhone = '62' + cleanPhone.substring(1);
        }
        // Jika diawali 8, tambahkan 62
        else if (cleanPhone.startsWith('8')) {
            cleanPhone = '62' + cleanPhone;
        }

        return cleanPhone;
    };

    // 2. HELPER: GENERATE PESAN WA (TEMPLATE PROFESIONAL + GAMBAR)
    const generateWaLink = (order) => {
        const phone = formatPhoneNumber(order.phone);
        if (!phone) return '#';

        // Ambil data item pertama
        const firstItem = order.items?.[0];
        const firstItemName = firstItem?.name || 'Pesanan Anda';

        // Ambil URL Gambar (Pastikan tidak null/undefined)
        const imageUrl = firstItem?.image_url || '';

        // Hitung sisa item
        const totalItems = order.itemsCount || 0;
        const otherItemsCount = totalItems > 1 ? `dan ${totalItems - 1} barang lainnya` : '';

        // Template Pesan
        const message = `
Halo Kak ${order.customer},

Kami dari *OffMode Store*.
Terkait pesanan Kakak dengan ID: *#${order.id.substring(0, 8)}*

Detail: ${firstItemName} ${otherItemsCount}
Lihat Produk: ${imageUrl}

[Tulis Info/Kendala Disini]

Mohon konfirmasinya ya Kak. Terima kasih 🙏
  `.trim();

        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                {/* ... (Kode <thead>) ... */}
                <thead className="bg-gray-50">
                    <tr>
                        {[
                            "ID Pesanan",
                            "Pelanggan",
                            "Tanggal",
                            "Metode Bayar",
                            "Jumlah Total",
                            "Status",
                            "Aksi Cepat",
                            "Aksi",
                        ].map((header) => (
                            <th
                                key={header}
                                className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    <AnimatePresence initial={false}>
                        {orders.map((order) => {
                            const statusDetail = getStatusDetails(order.status);
                            const isLoading = loadingId === order.id;

                            // Generate Link WA untuk order ini
                            const waLink = generateWaLink(order);

                            return (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                                        {order.id.length > 10
                                            ? `${order.id.substring(0, 10)}...`
                                            : order.id
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" /> {order.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.date).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                                        {order.payment_method}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {formatRupiah(order.total)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 text-xs font-bold rounded-full ${statusDetail.bg} ${statusDetail.color} flex items-center gap-1 w-fit`}
                                        >
                                            <statusDetail.icon className="w-3 h-3" />{" "}
                                            {statusDetail.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-y-1">
                                        <motion.button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenDetail(order);
                                            }}
                                            className="text-xs text-purple-600 hover:text-purple-700 transition flex items-center gap-1 hover:underline"
                                            whileHover={{ x: 3 }}
                                        >
                                            <ExternalLink className="w-3 h-3" /> Lihat Detail
                                        </motion.button>
                                        {order.phone ? (
                                            <a
                                                href={waLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >

                                                <Smartphone className="w-3 h-3" /> Chat Customer

                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No HP tidak ada</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        {["paid", "shipped"].includes(order.status) && (
                                            <motion.button
                                                onClick={() => handleUpdate(order.id, order.status)}
                                                disabled={isLoading}
                                                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1
${order.status === "paid"
                                                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30"
                                                        : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/30"
                                                    }
                             disabled:opacity-50 disabled:cursor-not-allowed w-36
                        `}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        {statusDetail.actionLabel}{" "}
                                                        <Send className="w-4 h-4" />
                                                    </>
                                                )}
                                            </motion.button>
                                        )}
                                        {order.status === "pending" && (
                                            <motion.button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenDetail(order);
                                                }}
                                                className="px-4 py-2 text-xs font-semibold rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition w-36"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Lihat Detail
                                            </motion.button>
                                        )}
                                        {order.status === "delivered" && (
                                            <div className="flex items-center gap-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl w-full max-w-[200px]">
                                                {/* Ikon Centang dalam Lingkaran */}
                                                <div className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full shrink-0 shadow-sm">
                                                    <CheckCheck className="h-4 w-4 text-green-600 dark:text-green-300" />
                                                </div>

                                                {/* Teks Keterangan */}
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-green-700 dark:text-green-300">
                                                        Selesai
                                                    </span>
                                                    <span className="text-[8px] font-medium text-green-600/80 dark:text-green-400/70 leading-tight">
                                                        Diterima Customer
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </tbody>
            </table>

            {orders.length === 0 && (
                <div className="text-center p-12 text-gray-500">
                    <List className="w-8 h-8 mx-auto mb-3" />
                    <p>Tidak ada pesanan di kategori ini.</p>
                </div>
            )}
        </div>
    );
}
