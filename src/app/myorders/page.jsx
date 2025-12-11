"use client";

import React, { useState, useEffect } from 'react';
import {
  History,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  TruckIcon,
  Receipt,
  ReceiptCent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { completeOrderAction, getUserOrders } from '../../../utils/orderAction';
import Footer from '../../../components/Footer';
import ReviewModal from './_components/ReviewModal';
import Header from '../../../components/Header';
import Link from 'next/link';


const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

const getStatusDetails = (status) => {
  switch (status) {
    case 'pending':
      return { label: 'Menunggu Pembayaran', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900', border: 'border-yellow-300 dark:border-yellow-700' };
    case 'paid':
      return { label: 'Diproses Penjual', icon: Package, color: 'text-purple-600 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900', border: 'border-purple-300 dark:border-purple-700' };
    case 'shipped':
      return { label: 'Dalam Pengiriman', icon: Truck, color: 'text-blue-600 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900', border: 'border-blue-300 dark:border-blue-700' };
    case 'delivered':
      return { label: 'Telah Diterima', icon: CheckCircle, color: 'text-green-600 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900', border: 'border-green-300 dark:border-green-700' };
    case 'cancelled':
      return { label: 'Dibatalkan', icon: XCircle, color: 'text-red-600 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900', border: 'border-red-300 dark:border-red-700' };
    default:
      return { label: status, icon: History, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-700' };
  }
};

// --- SUB-COMPONENTS ---

const OrderTimeline = ({ currentStatus }) => {
  const trackableStatuses = ['paid', 'shipped', 'delivered'];
  const statusLabels = {
    paid: 'Pesanan Diproses',
    shipped: 'Sedang Dikirim',
    delivered: 'Telah Diterima',
  };

  // Jika status pending atau cancelled, timeline tidak relevan ditampilkan penuh
  if (!trackableStatuses.includes(currentStatus)) return null;

  return (
    <div className="flex relative justify-center h-full min-h-[150px] w-full py-4">

      <div className="space-y-8 w-full relative overflow-hidden">
        <div className="absolute left-1/2 w-0.5 bg-gray-200 dark:bg-gray-700 h-full -translate-x-1/2 rounded-full"></div>
        {trackableStatuses.map((status, index) => {
          const isActive = trackableStatuses.indexOf(currentStatus) >= index;
          const Icon = getStatusDetails(status).icon;

          return (
            <motion.div
              key={status}
              className="flex items-center relative min-h-10"
              initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
            >
              <div className="absolute left-1/2 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900 z-10 -translate-x-1/2 flex items-center justify-center">
                <motion.div
                  className={`w-full h-full rounded-full shadow-md transition-colors duration-500 flex items-center justify-center`}
                  animate={{
                    backgroundColor: isActive ? '#8b5cf6' : '#f3f4f6',
                    scale: isActive ? 1.2 : 1
                  }}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                </motion.div>
              </div>

              <motion.div
                className={`flex-1 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}
              >
                <p className={`text-sm font-bold ${isActive ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {statusLabels[status]}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const OrderCard = ({ order, onRefresh, onReview }) => {
  const statusDetail = getStatusDetails(order.status);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false); // State loading tombol

  // Handle case jika items kosong (walaupun seharusnya tidak)
  const firstItem = order.items?.[0];
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalItemString = totalItems > 1 ? `+${totalItems - 1} barang lainnya` : '1 barang';

  const firstItemProductId = order.firstItemProductId;

  if (!firstItem) return null;

  const handleCompleteOrder = async () => {
    if (!confirm("Apakah Anda yakin pesanan sudah diterima dengan baik?")) return;

    setIsCompleting(true);
    try {
      const res = await completeOrderAction(order.id);
      if (res.success) {
        if (onRefresh) onRefresh();
      } else {
        alert("Gagal update status: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-purple-200 dark:hover:border-white/20"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="p-5 border-b bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 text-xs font-bold rounded-full border ${statusDetail.border} ${statusDetail.bg} ${statusDetail.color} flex items-center gap-1`}>
            <statusDetail.icon className="w-4 h-4" />
            {statusDetail.label}
          </div>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 hidden sm:flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
          </span>
        </div>
        {/* Menampilkan ID Pesanan yang dipotong agar rapi */}
        <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">#{order.id.substring(0, 8)}...</h3>
      </div>

      {/* Summary Content */}
      <div className="p-5 flex items-start gap-4">
        <Link href={firstItemProductId ? `/detailproduct/${firstItemProductId}` : '#'} onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 relative group">
            <img
              src={firstItem.image_url}
              alt={firstItem.name}
              className="w-full h-full object-cover"
              onError={(e) => e.currentTarget.src = `https://placehold.co/600x400/93c5fd/000000?text=No+Img`}
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-purple-600 transition-colors">
            {firstItem.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{totalItemString}</p>
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Tagihan</p>
            <p className="font-bold text-xl text-purple-600 dark:text-purple-400">{formatRupiah(order.total_amount)}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

              {/* List Barang */}
              <div className="md:col-span-1">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">Detail Barang</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="w-10 h-10 shrink-0 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => e.currentTarget.src = `https://placehold.co/600x400/93c5fd/000000?text=Item`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1 text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.variant} | Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-purple-700 dark:text-purple-400 shrink-0">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Pengiriman */}
              <div className="md:col-span-1">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">Info Pengiriman</h4>
                <div className="space-y-2">
                  <DetailRow icon={MapPin} label="Alamat" value={order.shipping_address} className="line-clamp-2 text-right max-w-[60%]" />
                  <DetailRow icon={Truck} label="Ekspedisi" value={order.shipping_method || "-"} />
                  {order.tracking_number && (
                    <DetailRow icon={ExternalLink} label="No. Resi" value={order.tracking_number} isTrack={true} />
                  )}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                    <DetailRow icon={DollarSign} label="Total Bayar" value={formatRupiah(order.total_amount)} className="font-bold text-purple-600 dark:text-purple-400" />
                    <DetailRow icon={TruckIcon} label="Fee Pengiriman" value={formatRupiah(order.shipping_cost)} className="font-bold text-purple-600 dark:text-purple-400" />
                    <DetailRow icon={ReceiptCent} label="Biaya Admin" value={formatRupiah(order.admin_fee)} className="font-bold text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {['paid', 'shipped', 'delivered'].includes(order.status) && (
                <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 pl-0 md:pl-4">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">Lacak Status</h4>
                  <OrderTimeline currentStatus={order.status} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-end items-center gap-3">
              {order.status === 'pending' && (
                <ActionButton color="yellow">Bayar Sekarang</ActionButton>
              )}
              {order.status === 'shipped' && (
                <ActionButton
                  color="default"
                  onClick={handleCompleteOrder}
                  disabled={isCompleting}
                >
                  {isCompleting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Memproses...</> : "Pesanan Diterima"}
                </ActionButton>
              )}
              {order.status === 'delivered' && (
                <ActionButton
                  color={order.items[0].isReviewed ? "gray" : "green"} // Ubah warna jadi abu jika sudah
                  onClick={() => !order.items[0].isReviewed && onReview(order.items[0], order.id)}
                  disabled={order.items[0].isReviewed} // Matikan tombol
                >
                  {order.items[0].isReviewed ? "Sudah Diulas" : "Beri Ulasan"}
                </ActionButton>
              )}
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setIsExpanded(false)}
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DetailRow = ({ icon: Icon, label, value, isTrack = false, className = '' }) => (
  <div className="flex justify-between items-start text-gray-600 dark:text-gray-400 text-sm">
    <span className="flex items-center gap-2 font-medium shrink-0">
      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" /> {label}
    </span>
    {isTrack ? (
      <span className="font-semibold text-blue-600 cursor-pointer hover:underline text-right flex items-center gap-1 ml-2">
        {value} <ExternalLink className="w-3 h-3" />
      </span>
    ) : (
      <span className={`ml-2 ${className}`}>
        {value}
      </span>
    )}
  </div>
);

const ActionButton = ({ children, color, outline = false, onClick, disabled }) => {
  const baseClass = "px-4 py-2 text-sm font-semibold rounded-lg transition transform active:scale-95 flex items-center justify-center gap-2";
  const colors = {
    yellow: "bg-yellow-600 text-white hover:bg-yellow-700",
    blue: "bg-blue-600 text-white hover:bg-blue-700",
    green: "bg-green-600 text-white hover:bg-green-700",
    red: outline
      ? "bg-transparent border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      : "bg-red-600 text-white hover:bg-red-700",
    default: "bg-gray-900 dark:bg-purple-600 text-white hover:opacity-90"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClass} ${colors[color] || colors.default} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

const ChevronDown = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="flex gap-4">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function MyOrder() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Modal Review
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ orderItem: null, orderId: null });

  // Function Fetch Data
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getUserOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function Refresh (tanpa loading spinner full page)
  const refreshOrders = async () => {
    try {
      const data = await getUserOrders();
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handler buka modal review
  const handleOpenReview = (orderItem, orderId) => {
    setReviewData({ orderItem, orderId });
    setShowReviewModal(true);
  };

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  // Dynamic Tabs count based on real data
  const tabs = [
    { key: 'all', label: 'Semua', count: orders.length },
    { key: 'pending', label: 'Belum Bayar', count: orders.filter(o => o.status === 'pending').length },
    { key: 'paid', label: 'Diproses', count: orders.filter(o => o.status === 'paid').length },
    { key: 'shipped', label: 'Dikirim', count: orders.filter(o => o.status === 'shipped').length },
    { key: 'delivered', label: 'Selesai', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Dibatalkan', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 font-sans">
      <Header />

      {reviewData.orderItem && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          orderItem={reviewData.orderItem} // Item pertama yg diulas
          orderId={reviewData.orderId}
          onReviewSubmitted={refreshOrders} // Refresh data setelah submit
        />
      )}

      {/* Background Noise */}
      <div className="inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-0 fixed mix-blend-multiply dark:mix-blend-normal"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      <main className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto">

          <div className="mb-10 px-6 lg:px-0">
            <span className="text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-2 block">My Account</span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white">Order History</h1>
          </div>

          {/* Tabs */}
          <div className="px-6 lg:px-0 flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-gray-200 dark:border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.key
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
              >
                <p>{tab.label}{' '}<span className='pr-2'>{tab.count}</span></p>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="px-4 lg:px-0 space-y-6 min-h-[400px]">
            {loading ? (
              <>
                <SkeletonCard />
              </>
            ) : filteredOrders.length > 0 ? (
              <AnimatePresence mode='wait'>
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onRefresh={refreshOrders} // Pass refresh function            
                    onReview={handleOpenReview}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-24 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Package size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No orders found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">You haven't placed any orders with this status yet.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}