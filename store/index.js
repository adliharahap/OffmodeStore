import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER } from "redux-persist";
// HAPUS baris ini: import storage from "redux-persist/lib/storage"; 
// GANTI dengan import ini:
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import authReducer from "./slice/authslice";
import cartReducer from "./slice/cartSlice";
import uiReducer from "./slice/uiSlice";

// --- START: FIX STORAGE UNTUK NEXT.JS ---
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Cek apakah kode berjalan di browser (window ada) atau server
const storage = typeof window !== "undefined" 
  ? createWebStorage("local") 
  : createNoopStorage();
// --- END: FIX STORAGE UNTUK NEXT.JS ---

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: "root",
  storage, // Gunakan variable storage yang sudah kita kondisikan di atas
  whitelist: ["auth", "cart"], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;