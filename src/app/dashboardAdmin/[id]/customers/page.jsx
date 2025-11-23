"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Users,
  Briefcase,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Smartphone,
  Zap,
  HardHat,
  Crown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllUsers, updateUserRoleAction, deleteUserAction } from '../../../../../utils/userAction';

// --- CONFIG ---
const ALL_ROLES = [
  { value: 'owner', label: 'Owner', icon: Crown, color: 'text-yellow-500' },
  { value: 'admin', label: 'Admin', icon: Zap, color: 'text-red-500' },
  { value: 'pegawai', label: 'Pegawai', icon: Briefcase, color: 'text-blue-500' },
  { value: 'customer', label: 'Customer', icon: User, color: 'text-purple-500' },
];

const getRoleDetail = (role) => ALL_ROLES.find(r => r.value === role) || ALL_ROLES[3];

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};
// --- COMPONENTS ---

const RoleEditModal = ({ user, onClose, onSave, onDelete }) => {
  const [newRole, setNewRole] = useState(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const roleDetail = getRoleDetail(newRole);

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(user.id, newRole);
    setIsLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Yakin ingin menghapus akun ${user.name}? Data profil akan hilang.`)) {
      setIsLoading(true);
      await onDelete(user.id);
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
          <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">Kelola Akun</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className=" flex justify-center items-center">
            {user.avatar_url ? (
              <img
                src={user?.avatar_url}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-gray-100 dark:border-gray-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-700 shadow-md">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm border border-gray-200">
              {/* Indikator Role di dekat Avatar */}
              <roleDetail.icon className={`w-4 h-4 ${roleDetail.color.split(' ')[0]}`} />
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl space-y-1">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 line-clamp-1">
                <User className="w-4 h-4 text-purple-500" /> {user.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" /> {user.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-400" /> {user.phone}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ubah Peran (Role)</label>
            <div className="relative">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="appearance-none w-full p-3 rounded-xl border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition cursor-pointer"
              >
                {ALL_ROLES.map(role => (
                  <option key={role.value} value={role.value} disabled={role.value === 'owner'}>
                    {role.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <motion.div
              key={newRole}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mt-3 text-sm font-semibold p-2 rounded-lg ${roleDetail.color} bg-opacity-10 dark:bg-opacity-20 flex items-center gap-2`}
            >
              <roleDetail.icon className="w-4 h-4" /> Peran baru: {roleDetail.label}
            </motion.div>
          </div>
        </div>

        <div className="p-6 border-t dark:border-gray-700 flex justify-between gap-3">
          <motion.button
            onClick={handleDelete}
            disabled={isLoading || user.role === 'owner'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition disabled:opacity-50"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Hapus
          </motion.button>

          <motion.button
            onClick={handleSave}
            disabled={isLoading || newRole === user.role}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30 transition disabled:opacity-50"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Simpan
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const UserTable = ({ title, users, onEdit, onSort, currentSort, onSearch, currentSearch }) => {
  const sortedAndFilteredUsers = useMemo(() => {
    let result = users;
    if (currentSearch) {
      const lower = currentSearch.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower));
    }
    result = result.sort((a, b) => {
      const dateA = new Date(a.last_active).getTime();
      const dateB = new Date(b.last_active).getTime();
      return currentSort === 'oldest' ? dateA - dateB : dateB - dateA;
    });
    return result;
  }, [users, currentSearch, currentSort]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b dark:border-gray-700 pb-3">
        {title === "Daftar Pegawai" ? <Briefcase className="w-6 h-6 text-purple-600" /> : <User className="w-6 h-6 text-purple-600" />}
        {title} ({users.length})
      </h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={currentSearch}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full p-3 pl-10 rounded-xl border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={currentSort}
            onChange={(e) => onSort(e.target.value)}
            className="appearance-none w-full p-3 pr-10 rounded-xl border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {['Nama', 'Email/ID', 'Role', 'Bergabung', 'Aksi'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence initial={false}>
              {sortedAndFilteredUsers.map((user) => {
                const roleDetail = getRoleDetail(user.role);
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        <span className="font-mono text-[10px] text-purple-400">{user.id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${roleDetail.color} bg-opacity-10 dark:bg-opacity-20 flex items-center gap-1 w-fit`}>
                        <roleDetail.icon className="w-3 h-3" /> {roleDetail.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(user.last_active).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium">
                      <motion.button
                        onClick={() => onEdit(user)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30 transition flex items-center gap-1"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      >
                        <Edit3 className="w-3 h-3" /> Kelola
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {sortedAndFilteredUsers.length === 0 && (
          <div className="text-center p-12 text-gray-500 dark:text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-3" />
            <p>Data tidak ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [staffSort, setStaffSort] = useState('newest');
  const [custSort, setCustSort] = useState('newest');
  const [staffSearch, setStaffSearch] = useState('');
  const [custSearch, setCustSearch] = useState('');

  // Fetch Data Real
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      if (data) {
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handler Update Role
  const handleUpdateRole = async (userId, newRole) => {
    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } else {
      alert("Gagal update role: " + res.message);
    }
  };

  // Handler Delete User
  const handleDeleteUser = async (userId) => {
    const res = await deleteUserAction(userId);
    if (res.success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      alert("Gagal hapus user: " + res.message);
    }
  };

  const handleOpenEdit = (user) => setSelectedUser(user);
  const handleCloseEdit = () => setSelectedUser(null);

  // Filter Users
  const staffUsers = users.filter(u => ['owner', 'admin', 'pegawai'].includes(u.role));
  const customerUsers = users.filter(u => u.role === 'customer' || !u.role);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans pb-10">
      <main className="mx-auto p-8 space-y-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-purple-800 dark:text-purple-400">
            <Users className="w-7 h-7" /> User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola akses peran dan data pengguna aplikasi.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <UserTable
            title="Daftar Pegawai"
            users={staffUsers}
            onEdit={handleOpenEdit}
            onSort={setStaffSort} currentSort={staffSort}
            onSearch={setStaffSearch} currentSearch={staffSearch}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <UserTable
            title="Daftar Pelanggan"
            users={customerUsers}
            onEdit={handleOpenEdit}
            onSort={setCustSort} currentSort={custSort}
            onSearch={setCustSearch} currentSearch={custSearch}
          />
        </motion.div>
      </main>

      <AnimatePresence>
        {selectedUser && (
          <RoleEditModal
            user={selectedUser}
            onClose={handleCloseEdit}
            onSave={handleUpdateRole}
            onDelete={handleDeleteUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}