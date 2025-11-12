"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function ConfirmPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorExpired, setErrorExpired] = useState(false);
  const [email, setEmail] = useState(""); // untuk input email kirim ulang
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function run() {
      try {
        console.log("✨ Memproses URL lengkap:", window.location.href);

        const fullUrl = window.location.href;
        const hashIndex = fullUrl.indexOf("#");

        if (hashIndex === -1) {
          console.error("❌ Tidak ada hash token di URL!");
          setErrorExpired(true);
          return;
        }

        const hash = fullUrl.substring(hashIndex + 1);
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");

        if (!access_token) {
          console.error("❌ Token tidak ditemukan di hash!");
          setErrorExpired(true);
          return;
        }

        console.log("🔑 Access token ditemukan:", access_token);

        await supabase.auth.setSession({ access_token });
        console.log("🎉 Email terverifikasi & user login otomatis!");
        router.push("/auth/verified");
      } catch (err) {
        console.error("❌ Terjadi kesalahan:", err);
        setErrorExpired(true);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [router]);

  // Fungsi kirim ulang email verifikasi
  const resendEmail = async () => {
    if (!email) {
      setMessage("Masukkan email dulu ya 💖");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
        },
      });

      if (error) {
        setMessage("Gagal mengirim email: " + error.message);
      } else {
        setMessage("✨ Email verifikasi berhasil dikirim ulang!");
      }
    } catch (err) {
      setMessage("Terjadi kesalahan: " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2>Sedang memverifikasi akunmu... 🌸</h2>
      </div>
    );
  }

  if (errorExpired) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2>Link verifikasi sudah kadaluarsa atau tidak valid 😢</h2>
        <p>Masukkan email kamu untuk mengirim ulang link verifikasi:</p>
        <input
          type="email"
          placeholder="Email kamu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px", width: "250px", marginBottom: "10px" }}
        />
        <br />
        <button
          onClick={resendEmail}
          disabled={sending}
          style={{ padding: "8px 16px", cursor: sending ? "not-allowed" : "pointer" }}
        >
          {sending ? "Mengirim..." : "Kirim ulang email"}
        </button>
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    );
  }

  return null;
}
