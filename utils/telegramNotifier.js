// utils/telegramNotifier.js
import axios from 'axios';

export async function sendTelegramNotification(orderData) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID; // single default chat id
  const OWNER_IDS = process.env.TELEGRAM_OWNER_ID; // multiple ids separated by comma

  if (!BOT_TOKEN) {
    console.warn("Telegram bot token not found in ENV.");
    return;
  }

  // Gabungkan ID menjadi array
  const targets = [];

  if (CHAT_ID) targets.push(CHAT_ID);

  if (OWNER_IDS) {
    const ownerArray = OWNER_IDS.split(",").map(id => id.trim());
    targets.push(...ownerArray);
  }

  // Hilangkan ID duplikat
  const uniqueTargets = [...new Set(targets)];

  // Ambil data order
  const {
    orderId,
    totalAmount,
    customerName,
    address,
    paymentMethod,
    items,
    status
  } = orderData;

  const statusLabel = status === 'paid' ? 'LUNAS' : status.toUpperCase();
  const statusEmoji = status === 'paid' ? '🟢' : '🟡';
  const statusText = `${statusEmoji} *${statusLabel}*`;

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
    // Kirim ke semua ID
    for (const id of uniqueTargets) {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: id,
        text: message,
        parse_mode: 'Markdown'
      });
    }

    console.log("Telegram notification sent to all targets!");
  } catch (error) {
    console.error("Failed to send Telegram notification:", error.message);
  }
}
