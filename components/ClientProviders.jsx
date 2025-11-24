"use client"; 

import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AuthListener from "./AuthListener";
import { store, persistor } from "../store";
import LogoutConfirmationModal from "./LogOutModal";
import ThemeManager from "./ThemeManager";

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Provider store={store}>
        {/* PersistGate menunda render anak-anaknya sampai data 
            dari localStorage selesai dimuat ke Redux.
            loading={null} bisa diganti dengan component <Loading /> jika mau.
        */}
        <ThemeManager />

        <PersistGate loading={null} persistor={persistor}>
          <AuthListener /> 
          {children}
          <LogoutConfirmationModal />
        </PersistGate>
        
      </Provider>
    </ThemeProvider>
  );
}