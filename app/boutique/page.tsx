import type { Metadata } from "next";
import { products, FAMILIES } from "@/lib/products";
import { ShopClient } from "@/components/shop-client";

export const metadata: Metadata = {
  title: "Boutique — Toutes nos bougies artisanales",
  description:
    "Découvrez toutes les bougies artisanales ÉclaDeCire : florales, végétales, gourmandes. Filtrez par famille olfactive, intensité et prix.",
  alternates: { canonical: "/boutique" },
};

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ famille?: string; tri?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <section className="bg-cire-rose py-16 text-center">
        <span className="eyebrow">La boutique</span>
        <h1 className="text-4xl md:text-5xl mt-2.5">Toutes nos bougies</h1>
        <div className="divider-lux my-4" />
        <p className="text-muted max-w-[54ch] mx-auto">
          {products.length} créations coulées et sculptées à la main — trouvez l&apos;éclat qui vous ressemble.
        </p>
      </section>

      <div className="container-lux pb-24">
        <ShopClient
          products={products}
          families={FAMILIES}
          initialFamily={sp.famille}
          initialSort={sp.tri}
        />
      </div>
    </>
  );
}
