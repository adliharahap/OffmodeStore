"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slice/authslice";
import { supabase } from "../lib/supabaseClient";

export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Ambil session awal
    supabase.auth.getSession().then(({ data }) => {
      dispatch(setUser(data?.session?.user || null));
    });

    // Listen event login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("✨ Auth event:", event, session?.user);
      dispatch(setUser(session?.user || null));
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  return null; // gak render apa-apa
}
