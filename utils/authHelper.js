import { store, persistor } from '../store'; 
import { clearAuth } from '../store/slice/authslice';
import { setCartCount } from '../store/slice/cartSlice';
import { logoutAction } from './authServerAction'; // Import Server Action yang baru dibuat

export const performLogout = async () => {
  try {
    // 1. Panggil Server Action (Wajib untuk hapus HttpOnly Cookie)
    const result = await logoutAction();
    
    if (!result.success) {
      console.warn("Server logout issue:", result.error);
      // Kita tetap lanjut bersihkan client side walaupun server error
    }
    console.log("berhasil log out");
    

    // 2. Bersihkan Redux State
    store.dispatch(clearAuth());
    store.dispatch(setCartCount(0));

    // 3. Bersihkan Cache Redux Persist (LocalStorage)
    await persistor.purge();
    // await persistor.flush(); // Opsional, kadang bikin hang

    // 4. Hapus Key LocalStorage secara manual (Double kill)
    if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:root');
        
        // Opsional: Hapus sisa-sisa token supabase jika ada di localstorage
        const projectKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.split('.')[1]; // Cuma contoh pattern
        // Lebih aman hapus semua yang berbau supabase jika anda tau key-nya
        // localStorage.removeItem('sb-<your-project-id>-auth-token');
    }

    return { success: true };
  } catch (error) {
    console.error("Client Logout Error:", error);
    return { error };
  }
};