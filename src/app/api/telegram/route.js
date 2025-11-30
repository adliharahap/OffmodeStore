import { NextResponse } from 'next/server';
import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import { getStoreContext } from '../../../../utils/aiContext';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Inisialisasi Client
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY 
});

export async function POST(req) {
  try {
    const body = await req.json();

    // Validasi pesan teks
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;
      // Ambil nama user (fallback ke 'Kakak' jika tidak ada nama)
      const userName = body.message.from.first_name || "Kakak"; 

      // --- 1. CEK ID OWNER (SATU-SATUNYA AKSES) ---
      // Ambil ID dari .env.local (bisa satu atau lebih dipisah koma)
      const ownerIds = (process.env.TELEGRAM_OWNER_ID || "").split(",").map(id => id.trim());
      const isOwner = ownerIds.includes(String(chatId));

      // JIKA BUKAN OWNER -> USIR!
      if (!isOwner) {
        console.log(`⛔ Orang asing mencoba akses: ${userName} (${chatId})`);
        await sendMessage(chatId, "Ehh~ kamu siapa yaa? 🧐");
        await sendMessage(chatId, "Kamu nggak punya akses, jadi minggir dulu yaa~ 🚫✨");
        return NextResponse.json({ status: 'forbidden' });
      }

      // A. Kirim status "Typing..." agar user tahu bot sedang berpikir
      await sendAction(chatId, 'typing');

      // B. Logic Command Start
      if (text === '/start') {
        // Kita biarkan AI yang menyapa nanti, atau gunakan sapaan default sederhana
        await sendMessage(chatId, `Halo ${userName}! Saya Hiyori, siap membantu cek stok dan orderan.`);
      }else if (text === '/about') {
        await sendMessage(chatId, `Halo ${userName}! Saya Hiyori, asisten AI dari OffMode Store. Saya di sini untuk membantu Kakak mengecek stok produk, status orderan, dan menjawab pertanyaan seputar toko. Silakan tanya apa saja yaa! 😊`);
      }else if (text === '/help') {
        await sendMessage(chatId, `Hai ${userName}, berikut beberapa perintah yang bisa Kakak gunakan:\n\n/start - Memulai percakapan dengan Hiyori\n/about - Info tentang Hiyori dan OffMode Store\n/help - Daftar perintah yang tersedia\n\nSilakan tanya tentang stok produk atau status orderan yaa! 🥰`);
      }else if (text === '/owner') {
        await sendMessage(chatId, `Owner saya adalah Kak Adli Rahman Harun Harahap. Jika ada pertanyaan khusus untuk Kak Adli, silakan tanyakan di sini yaa!`);
      }else {
        // C. LOGIC AI
        try {
          // 1. AMBIL KONTEKS DENGAN PARAMETER (USER & CHAT ID)
          // Ini akan memicu logika cek Owner di utils/aiContext.js
          const contextData = await getStoreContext(userName, chatId);

          // 2. SUSUN PROMPT FINAL
          // Tidak perlu menambah instruksi "Nama User..." lagi di sini 
          // karena sudah ada di dalam contextData yang dihasilkan getStoreContext
          const finalPrompt = `
            ${contextData}

            PERTANYAAN USER: "${text}"
          `;

          // 3. REQUEST KE GEMINI
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [
              {
                role: "user",
                parts: [
                  { text: finalPrompt }
                ]
              }
            ]
          });

          const aiAnswer = response.text || "Maaf, AI tidak memberikan jawaban.";
          await sendMessage(chatId, aiAnswer);

        } catch (aiError) {
          console.error("AI Error:", aiError);
          // Cek kuota habis
          if (aiError.message?.includes('429') || aiError.status === 429) {
             await sendErrorMessage(chatId, "⚠️ Maaf, Hiyori lagi pusing (Kuota AI Habis). Coba lagi nanti ya!");
          } else {
             await sendErrorMessage(chatId, `Maaf, ada kendala sistem: ${aiError.message}`);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- HELPER FUNCTIONS ---

// 1. Helper Kirim Pesan Biasa (Markdown Aktif)
async function sendMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown' 
    });
  } catch (e) {
    // Jika gagal kirim Markdown (biasanya karena format * atau _ salah dari AI), coba plain text
    console.error("Gagal kirim markdown, mencoba plain text...");
    await sendErrorMessage(chatId, text);
  }
}

// 2. Helper Kirim Pesan Error / Plain Text (Tanpa Markdown - LEBIH AMAN)
async function sendErrorMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      // parse_mode tidak diisi agar dikirim sebagai teks biasa
    });
  } catch (e) {
    console.error("Gagal kirim pesan error:", e.message);
  }
}

// 3. Helper Status Typing
async function sendAction(chatId, action) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
      chat_id: chatId,
      action: action
    });
  } catch (e) { /* ignore */ }
}