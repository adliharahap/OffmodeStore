import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HeaderUniversal from "../../../../components/Header";
// GANTI IMPORT DI BAWAH INI:
import { getProductDataByIdServer } from "../../../../utils/fetchProductServer"; 
import DetailProduct from "./DetailProductPage"; 

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  // Fetch data produk di server
  const product = await getProductDataByIdServer(id);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan",
    };
  }

  // Ambil gambar pertama
  const imageUrl = product.product_images?.[0]?.image_url || 'https://placehold.co/600x600.png';

  return {
    title: product.name,
    description: product.description || "Cek detail produk ini di OffMode Store!",
    openGraph: {
      title: product.name,
      description: product.description,
      // INI KUNCINYA: Masukkan URL gambar Supabase di sini
      images: [
        {
          url: imageUrl, 
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
    },
  };
}

export default async function DetailProductPage({ params }) {
  // 1. Await params (Next.js 15)
  const { id } = await params;

  // 2. Await headers
  const headersList = await headers();
  const isLoggedIn = headersList.get('x-is-logged-in') === 'true';

  // 3. Validasi UUID
  const isUuid = (str) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
  
  if (!id || !isUuid(id)) {
    redirect("/not-found");
  }

  // 4. FETCH DATA MENGGUNAKAN FUNGSI SERVER BARU
  let data = null;
  try {
    // Panggil fungsi server yang baru kita buat
    data = await getProductDataByIdServer(id);
  } catch (error) {
    console.error("Page Error:", error);
  }

  // 5. Redirect jika data null
  if (!data) {
    redirect("/not-found");
  }

  // 6. Format Data (Logic tetap sama)
  const formattedProduct = {
    id: data.id,
    name: data.name,
    price: data.product_variants?.[0]?.price ?? 0,
    originalPrice: data.product_variants?.[0]?.original_price ?? 0,
    rating: data.rating ?? null,
    sold: data.sold_count_total ?? 0,
    description: data.description ?? "",
    fullDescription: data.full_description ?? "",
    variants: data.product_variants ?? [],

    images: data.product_images?.map((img) => ({
        src: img?.image_url ?? "",
        linkedColorName: img?.linked_color_name ?? null,
    })) ?? [],

    colors: [
      ...new Map(
        (data.product_images ?? [])
          .filter((img) => img?.linked_color_name)
          .map((img) => [
            img.linked_color_name,
            {
              name: img.linked_color_name,
              thumbnail: img.image_url,
              mainImageIndex: (data.product_images ?? []).indexOf(img),
            },
          ])
      ).values(),
    ],

    sizes: (() => {
      const variants = data.product_variants ?? [];
      const sizeNames = [...new Set(variants.map((v) => v?.size_name))];
      return sizeNames.map((size) => ({
        name: size,
        stock: variants
          .filter((v) => v?.size_name === size)
          .reduce((acc, v) => acc + (v?.stock ?? 0), 0),
      }));
    })(),

    specifications: data.product_specifications?.map((spec) => ({
        name: spec?.spec_name ?? "",
        value: spec?.spec_value ?? "",
    })) ?? [],
    reviews: data.product_reviews?.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        date: review.created_at,
        user: {
            name: review.profiles?.full_name || 'Anonim',
            avatar: review.profiles?.avatar_url || 'https://placehold.co/100x100?text=U'
        }
    })) || [] // Default array kosong jika tidak ada review
  };

  return (
    <>
      <HeaderUniversal />
      <DetailProduct product={formattedProduct} isLoggedIn={isLoggedIn} />
    </>
  );
}