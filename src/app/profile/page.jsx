"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Building, Sun, Moon, ShoppingBag,
    Menu, X, Edit2, Plus, Check, LogOut, Camera,
    Home,
    History
} from 'lucide-react';
import { EditProfileModal } from './_components/EditProfileModal';
import { deleteAddressAction, getUserAddresses } from '../../../utils/addressAction';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { openLogoutModal } from '../../../store/slice/uiSlice';
import { AddressModal } from './_components/AddressModal';

// --- ANIMASI ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};


// --- Komponen Pembantu ---

const Card = motion.div;

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-white/5 last:border-0 group">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
        </div>
    </div>
);

const AddressCard = ({ address, onEdit, onDelete }) => (
    <Card
        className="p-5 bg-white dark:bg-[#111] border font-serif border-gray-200 dark:border-white/10 rounded-2xl hover:border-purple-300 dark:hover:border-white/30 transition-all duration-300 hover:shadow-lg"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
    >
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                {address.address_label}
            </h3>
            {address.is_default && (
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 rounded-full">
                    Default
                </span>
            )}
        </div>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
                <User className="w-4 h-4 inline mr-2 text-gray-400" />
                <span className="font-semibold">{address.recipient_name}</span>
            </p>
            <p>
                <Phone className="w-4 h-4 inline mr-2 text-gray-400" />
                {address.phone_number}
            </p>
            <p className="leading-relaxed">
                <Home className="w-4 h-4 inline mr-2 text-gray-400" />
                {address.street}, {address.city}, {address.province}, {address.postal_code}
            </p>
        </div>

        <div className="mt-4 flex space-x-3">
            <button
                onClick={() => onEdit(address)}
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
                Ubah
            </button>
            <button
                onClick={() => onDelete(address.id)}
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
            >
                Hapus
            </button>
        </div>
    </Card>
);

// --- Komponen Utama Aplikasi ---

const Profile = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [isAddressLoading, setIsAddressLoading] = useState(true);

    // State untuk Address Modal
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null); // Data alamat yg mau diedit

    const userProfile = useSelector((state) => state.auth.user);
    const isAuthLoading = useSelector((state) => state.auth.isLoading);
    const dispatch = useDispatch();

    const fetchAddresses = async () => {
        setIsAddressLoading(true);
        try {
            // Kita tidak perlu fetch userProfile lagi di sini
            const addressData = await getUserAddresses();
            setAddresses(addressData || []);
        } catch (e) {
            console.error("Gagal ambil alamat:", e);
        } finally {
            setIsAddressLoading(false);
        }
    };

    useEffect(() => {
        // Fetch alamat hanya jika user sudah terdeteksi (login)
        if (userProfile) {
            fetchAddresses();
        }
    }, [userProfile]);

    // Handler: Hapus Alamat
    const handleDeleteAddress = async (addressId) => {
        if (confirm("Yakin ingin menghapus alamat ini?")) {
            const res = await deleteAddressAction(addressId);
            if (res.success) {
                fetchAddresses(); // Refresh
            } else {
                alert("Gagal hapus: " + res.message);
            }
        }
    };

    // Handler: Buka Modal Tambah
    const handleAddAddress = () => {
        setEditingAddress(null); // Mode Tambah
        setIsAddressModalOpen(true);
    };

    // Handler: Buka Modal Edit
    const handleEditAddress = (address) => {
        setEditingAddress(address); // Mode Edit
        setIsAddressModalOpen(true);
    };

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
                <p>Data profil tidak ditemukan.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-emerald-600 hover:underline">
                    Muat Ulang
                </button>
            </div>
        );
    }

    //   if (!userProfile) return <div className="text-center py-20">Gagal memuat profil. Silakan login ulang.</div>;
    const dateCreated = new Date(userProfile.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans">
            <Header />
            {/* Background Noise */}
            <div className="inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-0 fixed mix-blend-multiply dark:mix-blend-normal"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
            </div>

            <main className="relative z-10 pt-32 pb-20">
                <div className="container mx-auto px-6 md:px-10 max-w-7xl">

                    {/* Header Title */}
                    <div className="mb-10">
                        <span className="text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-2 block">Account Settings</span>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white">My Profile</h1>
                    </div>

                    {/* SPLIT LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                        {/* --- LEFT: STICKY PROFILE CARD --- */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                                className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden relative"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent opacity-50"></div>

                                <div className="relative flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <div className="relative mb-6 group cursor-pointer">
                                        <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-xl">
                                            <img
                                                src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${userProfile?.full_name || 'User'}&background=random&color=ffffff`}
                                                alt={userProfile.full_name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-1">
                                        {userProfile.full_name}
                                    </h2>
                                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-8">
                                        {userProfile.role}
                                    </p>

                                    <div className="w-full text-left space-y-1 mb-8">
                                        <InfoRow icon={Mail} label="Email Address" value={userProfile.email} />
                                        <InfoRow icon={Phone} label="Phone Number" value={userProfile.phone_number} />
                                        <InfoRow icon={History} label="Member Since" value={dateCreated} />
                                    </div>

                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-3 rounded-xl border border-gray-200 dark:border-white/20 font-bold text-gray-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-2 mb-3"
                                    >
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                    <button onClick={() => dispatch(openLogoutModal())} className="w-full py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* --- RIGHT: ADDRESS BOOK & CONTENT --- */}
                        <div className="lg:col-span-8">

                            {/* Section Header */}
                            <div className="flex justify-between items-end mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                                <div>
                                    <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">Address Book</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your shipping destinations.</p>
                                </div>
                                <button onClick={handleAddAddress} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                                    <Plus size={16} /> Add New
                                </button>
                            </div>

                            {/* Address Grid */}
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {isAddressLoading ? (
                                    // Skeleton
                                    [1, 2].map(i => (
                                        <div key={i} className="h-48 rounded-2xl bg-gray-200 dark:bg-white/5 animate-pulse"></div>
                                    ))
                                ) : (
                                    <>
                                        {addresses.map((addr) => (
                                            <AddressCard
                                                key={addr.id}
                                                address={addr}
                                                onEdit={handleEditAddress}     // Pass handler edit
                                                onDelete={handleDeleteAddress} // Pass handler delete
                                            />
                                        ))}

                                        {/* Add New Card (Dashed) */}
                                        <motion.button
                                            onClick={handleAddAddress}
                                            variants={itemVariants}
                                            className="min-h-[200px] border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                                <Plus size={24} />
                                            </div>
                                            <span className="font-bold text-sm">Add New Address</span>
                                        </motion.button>
                                    </>
                                )}
                            </motion.div>

                            {/* Mobile Add Button (Floating) */}
                            <button 
                                onClick={handleAddAddress}
                                className="sm:hidden fixed bottom-14 right-6 w-14 h-14 bg-purple-600 dark:bg-stone-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40">
                                <Plus size={28} />
                            </button>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <EditProfileModal
                isVisible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={userProfile}
            />

            {/* MODAL ALAMAT (Baru) */}
            <AddressModal
                isVisible={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                addressToEdit={editingAddress} // Kirim data alamat jika edit
                onSaveSuccess={fetchAddresses} // Refresh list alamat setelah simpan
            />
        </div>
    );
};

export default Profile;