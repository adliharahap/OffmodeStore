import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLogoutModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openLogoutModal: (state) => {
      state.isLogoutModalOpen = true;
    },
    closeLogoutModal: (state) => {
      state.isLogoutModalOpen = false;
    },
  },
});

export const { openLogoutModal, closeLogoutModal } = uiSlice.actions;
export default uiSlice.reducer;