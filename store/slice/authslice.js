// store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

// Async thunk untuk ambil session awal
export const fetchUserSession = createAsyncThunk(
  "auth/fetchUserSession",
  async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.user || null;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      supabase.auth.signOut();
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserSession.rejected, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
