"use client";

import HeaderUniversal from "../../../../components/Header";

export default function Loading() {
  return (
    <>
      <HeaderUniversal />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 md:py-20 mt-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Kolom Kiri: Gambar Skeleton */}
            <div className="w-full flex flex-col gap-4 animate-pulse">
              {/* Gambar Utama */}
              <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              {/* Thumbnail */}
              <div className="flex gap-3 justify-center mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Kolom Kanan: Info Skeleton */}
            <div className="w-full flex flex-col gap-4 animate-pulse">
              {/* Judul */}
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
              {/* Harga */}
              <div className="flex gap-3 mb-4">
                <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
              {/* Rating & Sold */}
              <div className="flex gap-4 mb-6">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
              {/* Deskripsi Singkat */}
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              
              {/* Warna */}
              <div className="mb-6">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="flex gap-3">
                  <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>

              {/* Ukuran */}
              <div className="mb-6">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-4 mt-4">
                <div className="h-14 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-14 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}