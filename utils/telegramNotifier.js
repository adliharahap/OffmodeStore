// utils/telegramNotifier.js
import axios from 'axios';

export async function sendTelegramNotification(orderData) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("Telegram credentials not found in ENV.");
    return;
  }

  const {
    orderId,
    totalAmount,
    customerName,
    address,
    paymentMethod,
    items,
    status
  } = orderData;

    // Mapping Status untuk tampilan lebih rapi
  const statusLabel = status === 'paid' ? 'LUNAS' : status.toUpperCase();
  const statusEmoji = status === 'paid' ? '🟢' : '🟡'; // Gunakan emoji yang berbeda jika statusnya bukan 'paid'
  const statusText = `${statusEmoji} *${statusLabel}*`; // <--- BARIS INI


  // Format Pesan yang Rapi
  const itemsList = items.map(item => 
    `📦 *${item.productName}* (${item.variantColor}, ${item.variantSize})\n   Qty: ${item.quantity} x Rp${item.price.toLocaleString('id-ID')}`
  ).join('\n');

  const message = `
🚨 *PESANAN BARU MASUK!* 🚨

Hallo Kak Adli~ Ada Orderan Baru Masuk!
Sistem menerima pesanan baru yang perlu diproses. Berikut detailnya:

📦 INFORMASI PESANAN
🆔 *Order ID:* #${orderId.substring(0, 8)}
👤 *Pembeli:* ${customerName}
💰 *Total:* Rp${totalAmount.toLocaleString('id-ID')}
💳 *Metode:* ${paymentMethod}
⁉️ *Status:* ${statusText} 

📍 Alamat:
${address}

🛒 Detail Barang:
${itemsList}

---------------------------------- 
Mohon segera proses pesanan ini melalui Dashboard Admin. Terima kasih.
  `.trim();

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown' // Agar teks bisa bold/italic
    });
    console.log("Telegram notification sent!");
  } catch (error) {
    console.error("Failed to send Telegram notification:", error.message);
  }
}