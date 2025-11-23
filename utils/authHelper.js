import { supabase } from '../lib/supabaseClient';
import { store, persistor } from '../store'; 
import { clearAuth } from '../store/slice/authslice';
import { setCartCount } from '../store/slice/cartSlice';

export const performLogout = async () => {
  
  try {
    // 1. Logout Supabase
    await supabase.auth.signOut();

    // 2. Bersihkan Redux
    store.dispatch(clearAuth());
    store.dispatch(setCartCount(0));

    // 3. Bersihkan Persist Storage
    await persistor.purge();
    await persistor.flush(); // Pastikan penulisan ke disk selesai

    // 4. Hapus Manual (Jaga-jaga)
    if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:root');
    }

    return { success: true };
  } catch (error) {y
    console.error("Logout Error:", error);
    return { error };
  }
};