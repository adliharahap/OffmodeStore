// utils.js
import { 
  History, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle
} from 'lucide-react';

export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

// Fungsi status dengan dukungan Dark Mode
export const getStatusDetails = (status) => {
  switch (status) {
    case 'pending':
      return { label: 'Menunggu Bayar', icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900', actionLabel: 'Lihat Detail' };
    case 'paid':
      return { label: 'Siap Kirim', icon: Package, color: 'text-purple-600 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900', actionLabel: 'Siap Dikirim' };
    case 'shipped':
      return { label: 'Dalam Pengiriman', icon: Truck, color: 'text-blue-600 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900', actionLabel: 'Tandai Selesai' };
    case 'delivered':
      return { label: 'Selesai', icon: CheckCircle, color: 'text-green-600 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900', actionLabel: 'Arsip' };
    case 'cancelled':
      return { label: 'Dibatalkan', icon: XCircle, color: 'text-red-600 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900', actionLabel: 'Arsip' };
    default:
      return { label: 'Status Lain', icon: History, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', actionLabel: 'Lihat' };
  }
};