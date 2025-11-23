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
                                        <a
                                            href={`https://wa.me/${order.phone}?text=Halo%20${order.customer},%20kami%20ingin%20mengkonfirmasi%20pesanan%20${order.id}.%20Apakah%20sudah%20sesuai?`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Smartphone className="w-3 h-3" /> Chat Customer
                                        </a>
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
                                        {order.status === "completed" && (
                                            <div className="h-full w-full flex justify-center items-center gap-2">
                                                <CheckCheck className="h-5 w-5 text-green-900" />
                                                <p className="text-black">Selesai</p>
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
