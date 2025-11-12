// File: components/ClientProviders.js (VERSI PERBAIKAN)

"use client"; // Ini adalah kuncinya!

import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import AuthListener from "./AuthListener";
import store from "../store";

export default function ClientProviders({ children }) {
  return (
    // Bungkus semua provider di sini, di dalam satu Client Component
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Provider store={store}>
        <AuthListener /> {/* AuthListener sudah benar di sini */}
        {children}
      </Provider>
    </ThemeProvider>
  );
}