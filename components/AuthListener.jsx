"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux"; // Tambah useSelector
import { clearAuth, setUser } from "../store/slice/authslice";
import { getCartCount } from "../utils/cartActions";
import { setCartCount } from "../store/slice/cartSlice";
import { supabase } from "../lib/supabaseClient";

export default function AuthListener() {
  const dispatch = useDispatch();
  
  // Ambil sinyal refresh dari Redux
  const { refreshSignal } = useSelector((state) => state.auth);

  // Ref untuk mencegah double fetch di React Strict Mode (Development)
  const isFetching = useRef(false);

  /**
   * CORE LOGIC: Fetch Data User & Profil & Cart
   */
  const syncUserData = useCallback(async () => {
    // Prevent race conditions
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      // console.log("🔄 AuthListener: Syncing data...");

      // 1. Cek Session ke Server Supabase (Wajib pakai getUser biar fresh)
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // console.log("AuthListener: No active session / Token expired.");
        dispatch(clearAuth());
        dispatch(setCartCount(0));
        return;
      }

      // 2. Ambil Data Profil Terbaru dari Database
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("AuthListener DB Error:", profileError.message);
      }

      const finalEmail = profileData?.email || user.user_metadata?.email || user.email;

      // 3. Gabungkan Data (Database menimpa Metadata lama)
      const mergedUser = {
        ...user,
        ...user.user_metadata,
        ...profileData, 
        email: finalEmail,
      };

      // 4. Update Redux User
      dispatch(setUser(mergedUser));

      // 5. Update Cart
      const count = await getCartCount();
      dispatch(setCartCount(count));

      // console.log("✅ AuthListener: Data Synced. Role:", mergedUser.role);

    } catch (err) {
      console.error("AuthListener Critical Error:", err);
      dispatch(clearAuth());
    } finally {
      isFetching.current = false;
    }
  }, [dispatch, supabase]);


  // --- EFFECT 1: Jalankan saat Component Mount (Reload Browser) & Saat Sinyal Berubah ---
  useEffect(() => {
    syncUserData();
  }, [syncUserData, refreshSignal]); // Dependency ke refreshSignal memicu fetch ulang


  // --- EFFECT 2: Supabase Event Listener (Login/Logout) ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
           // Jangan fetch langsung disini, panggil syncUserData agar logic terpusat
           syncUserData();
        } else if (event === 'SIGNED_OUT') {
           dispatch(clearAuth());
           dispatch(setCartCount(0));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, supabase, syncUserData]);

  return null;
}