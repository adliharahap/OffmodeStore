// Impor 'notFound' dari Next.js untuk menangani 404
import { notFound } from "next/navigation";
import DetailProduct from "./DetailProductPage";
import HeaderUniversal from "../../../../components/HeaderUniversal";

// 2. DATA PRODUK DIPINDAHKAN KE LUAR KOMPONEN
const productData = {
  id: 1,
  name: 'Kemeja Linen Oversized',
  price: 450000,
  originalPrice: 600000,
  rating: 4.9,
  sold: '1.2k',
  description: 'Kemeja esensial yang ringan dan sejuk, dibuat dari 100% linen premium. Potongan oversized memberikan tampilan santai namun tetap elegan.', // Deskripsi singkat
  images: [
    { src: 'https://placehold.co/800x800/f0f0f0/333?text=Kemeja+Linen+Style+1', linkedColorName: null }, // index 0 (Umum)
    { src: 'https://placehold.co/800x800/e8e8e8/333?text=Kemeja+Linen+Detail', linkedColorName: null }, // index 1 (Umum)
    { src: 'https://placehold.co/800x800/e8e8e8/333?text=Kemeja+Linen+Detail', linkedColorName: null }, // index 1 (Umum)
    { src: 'https://placehold.co/800x800/f5f5f5/333?text=Kemeja+Putih', linkedColorName: 'Putih Gading' }, // index 2 (Warna)
    { src: 'https://placehold.co/800x800/000080/eee?text=Kemeja+Navy', linkedColorName: 'Biru Navy' },    // index 3 (Warna)
    { src: 'https://placehold.co/800x800/000000/eee?text=Kemeja+Hitam', linkedColorName: 'Hitam' },        // index 4 (Warna)
    { src: 'https://placehold.co/800x800/C3B091/333?text=Kemeja+Khaki', linkedColorName: 'Khaki' },        // index 5 (Warna)
  ],
  
  // DIPERBARUI: Index disesuaikan dengan array 'images' yang baru
  colors: [
    { name: 'Putih Gading', thumbnail: 'https://placehold.co/100x100/f5f5f5/333?text=Putih', mainImageIndex: 3 },
    { name: 'Biru Navy', thumbnail: 'https://placehold.co/100x100/000080/eee?text=Navy', mainImageIndex: 4 },
    { name: 'Hitam', thumbnail: 'https://placehold.co/100x100/000000/eee?text=Hitam', mainImageIndex: 5 },
    { name: 'Khaki', thumbnail: 'https://placehold.co/100x100/C3B091/333?text=Khaki', mainImageIndex: 6 },
  ],
  
  sizes: [
    { name: 'S', stock: 0 }, // Stok Habis
    { name: 'M', stock: 12 },
    { name: 'L', stock: 30 },
    { name: 'XL', stock: 5 },
  ],
  fullDescription: 'Kemeja esensial yang ringan dan sejuk, dibuat dari 100% linen premium. Potongan oversized memberikan tampilan santai namun tetap elegan. Sempurna untuk cuaca hangat, bisa dipakai sebagai atasan atau outer ringan. Didesain dengan kerah klasik, kancing depan penuh, dan satu saku di dada. Lengan panjang dengan manset berkancing yang bisa digulung untuk gaya yang lebih kasual. Bahan linen dikenal karena daya tahannya dan kemampuannya menyerap keringat, membuatnya ideal untuk iklim tropis.',
  specifications: [
    { name: 'Bahan', value: '100% Linen Premium' },
    { name: 'Fit', value: 'Oversized' },
    { name: 'Kerah', value: 'Klasik (Spread Collar)' },
    { name: 'Saku', value: '1 Saku Dada' },
    { name: 'Negara Asal', value: 'Indonesia' },
    { name: 'Petunjuk Cuci', value: 'Mesin cuci suhu rendah, jangan gunakan pemutih, setrika suhu sedang.' },
  ]
};

export default async function DetailProductPage({ params }) {
    const { id } = await params;

    // Untuk data statis, kita cek ID-nya
    // (Dalam aplikasi nyata, Anda akan fetch(.../api/products/${id}))
    const product = productData;

    // Cek apakah ID produk dari data cocok dengan ID dari URL
    if (String(product.id) !== String(id)) {
        // Jika tidak, panggil 'notFound()' dari Next.js
        // Ini akan otomatis merender file 'not-found.jsx' terdekat
        notFound();
    }
    console.log("produk id :",product.id);
    console.log("params id : ", String(id));
    
    

    // Jika produk ditemukan, render komponen UI dengan data produk
    return (
        <>
        <HeaderUniversal />
        <DetailProduct product={product} />
        </>
    );
}