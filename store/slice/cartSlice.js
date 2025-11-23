import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartCount: (state, action) => {
      state.count = action.payload;
    },
    // Helper untuk update optimistik (tambah/kurang tanpa fetch ulang)
    incrementCart: (state) => {
      state.count += 1;
    },
    decrementCart: (state) => {
      if (state.count > 0) state.count -= 1;
    },
  },
});

export const { setCartCount, incrementCart, decrementCart } = cartSlice.actions;
export default cartSlice.reducer;