"use client";

import FeaturedProducts from "../../components/Home/FeaturedProducts";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import HeroSection from "../../components/Home/HeroSection";
import Introduction from "../../components/Home/Introduction";

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <Introduction />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
}
