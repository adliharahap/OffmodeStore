import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoading: true, 
  refreshSignal: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false; 
    },
    // ACTION BARU: Reset state ke awal
    clearAuth: (state) => {
      state.user = null;
      state.isLoading = false; // Stop loading karena sudah pasti logout
    },
    triggerAuthRefresh: (state) => {
      state.refreshSignal = Date.now(); // Update dengan timestamp sekarang
    }
  },
});

export const { setUser, clearAuth, triggerAuthRefresh } = authSlice.actions;
export default authSlice.reducer;