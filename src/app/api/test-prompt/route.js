import { NextResponse } from 'next/server';
import { getStoreContext } from '../../../../utils/aiContext';

// Force dynamic agar tidak di-cache next.js
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Simulasi Data Owner (Ambil ID pertama dari env biar jadi Hiyori)
    const ownerId = process.env.TELEGRAM_OWNER_ID?.split(',')[0] || "12345";
    const userName = "Adli";

    console.log("Testing Generate Prompt...");
    
    // Panggil fungsi context yang sudah kita buat
    const promptResult = await getStoreContext(userName, ownerId);

    // Return sebagai Text agar mudah dibaca di browser
    return new NextResponse(promptResult, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: "Gagal generate prompt", 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}