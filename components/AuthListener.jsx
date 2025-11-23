"use client";

import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { clearAuth, setUser } from "../store/slice/authslice";
import { getCartCount } from "../utils/cartActions";
import { setCartCount } from "../store/slice/cartSlice";
import { supabase } from "../lib/supabaseClient";

export default function AuthListener() {
  const dispatch = useDispatch();

  /**
   * Helper: Sinkronisasi data User dari Auth + Database
   */
  const fetchAndDispatchUser = useCallback(async (userAuth) => {
    try {
      if (!userAuth) {
        dispatch(clearAuth());
        dispatch(setCartCount(0));
        return;
      }

      // 1. Fetch Data Profil Terbaru dari Database
      // Gunakan .maybeSingle() agar tidak error jika data belum ada (misal user baru)
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userAuth.id)
        .maybeSingle();

      if (error) {
        console.error("AuthListener DB Error:", error.message);
      }

      // 2. PENTING: PRIORITAS PENGGABUNGAN DATA
      // Urutan ini menjamin Role di Database menimpa Role di Metadata JWT lama
      const mergedUser = {
        ...userAuth,              // 1. Data dasar (id, email, dll)
        ...userAuth.user_metadata,// 2. Metadata lama (dari cookie/JWT)
        ...profileData,           // 3. Data Database TERBARU (Ini yang menang/menimpa)
      };

      // 3. Update Redux
      // console.log("User Synced. Role:", mergedUser.role); // Debugging
      dispatch(setUser(mergedUser));

      // 4. Update Keranjang
      const count = await getCartCount();
      dispatch(setCartCount(count));

    } catch (err) {
      console.error("AuthListener Critical Error:", err);
      dispatch(clearAuth());
    }
  }, [dispatch, supabase]);


  useEffect(() => {
    // --- LANGKAH 1: CEK SESSION KE SERVER SAAT MOUNT (Initial Load) ---
    const initializeAuth = async () => {
      // Gunakan getUser() bukan getSession(). 
      // getUser() memvalidasi token ke server Supabase, memastikan data tidak stale.
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // JIKA SERVER BILANG GAK ADA USER (LOGOUT), TAPI REDUX MASIH NYIMPAN DATA
      if (error || !user) {
        console.log("Session Invalid/Expired. Cleaning up...");
        dispatch(clearAuth());
        dispatch(setCartCount(0));
        
        // HAPUS LOCAL STORAGE MANUAL (Jaga-jaga redux-persist bandel)
        if (typeof window !== 'undefined') {
            localStorage.removeItem('persist:root'); 
        }
        return;
      }

      await fetchAndDispatchUser(user);
    };

    initializeAuth();

    // --- LANGKAH 2: DENGARKAN PERUBAHAN (Login/Logout/Refresh) ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log("Auth Event:", event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
           // Pastikan kita kirim session.user
           await fetchAndDispatchUser(session?.user);
        } else if (event === 'SIGNED_OUT') {
           dispatch(clearAuth());
           dispatch(setCartCount(0));
           
           // Opsional: Hapus storage manual jika perlu, tapi clearAuth sudah cukup untuk UI
           // localStorage.clear(); 
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, supabase, fetchAndDispatchUser]);

  return null;
}