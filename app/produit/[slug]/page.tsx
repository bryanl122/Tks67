import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Flame, Droplets, Wind, Clock } from "lucide-react";
import { products, getProduct, getRelated } from "@/lib/products";
import { ProductInteractive } from "@/components/product-interactive";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: `${product.name} — Bougie artisanale ${product.family}`,
    description: product.description,
    alternates: { canonical: `/produit/${product.slug}` },
    openGraph: {
      title: `${product.name} | ÉclaDeCire`,
      description: product.description,
      images: [{ url: product.image, width: 1080, height: 1080, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(slug);

  const specs = [
    { icon: Clock, value: product.burnTime, label: "Combustion" },
    { icon: Droplets, value: product.weight, label: "Cire végétale" },
    { icon: Wind, value: "Coton", label: "Mèche naturelle" },
    { icon: Flame, value: product.format, label: "Format" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image],
    description: product.description,
    brand: { "@type": "Brand", name: "ÉclaDeCire" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-lux pt-10">
        <nav className="text-xs tracking-[0.1em] uppercase text-muted mb-6">
          <Link href="/" className="hover:text-eclat-dark">
            Accueil
          </Link>{" "}
          /{" "}
          <Link href="/boutique" className="hover:text-eclat-dark">
            Boutique
          </Link>{" "}
          / <span className="text-cacao">{product.name}</span>
        </nav>

        <ProductInteractive product={product} />
      </div>

      {/* PYRAMIDE */}
      <section className="container-lux py-24">
        <Reveal className="text-center mb-12">
          <span className="eyebrow block mb-3">Pyramide olfactive</span>
          <h2 className="text-3xl md:text-4xl">Un voyage en trois temps</h2>
          <div className="divider-lux my-4" />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {product.pyramid.map((p) => (
            <div key={p.step} className="text-center p-8 bg-cire border border-line rounded-[var(--radius-lg)]">
              <span className="eyebrow text-sauge">Notes de {p.step.toLowerCase()}</span>
              <b className="block font-serif text-xl text-cacao mt-2.5 mb-1.5">{p.notes}</b>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
          {specs.map((s) => (
            <div key={s.label} className="text-center p-6 border border-line rounded-[var(--radius)]">
              <s.icon size={28} className="text-eclat-dark mx-auto mb-3" strokeWidth={1.5} />
              <b className="block font-serif text-cacao text-[17px]">{s.value}</b>
              <small className="text-xs text-muted">{s.label}</small>
            </div>
          ))}
        </div>
      </section>

      {/* AVIS */}
      <section className="bg-cacao text-cire py-24">
        <div className="container-lux">
          <Reveal className="text-center mb-12">
            <span className="eyebrow text-eclat-light block mb-3">Avis clients · {product.name}</span>
            <h2 className="text-cire text-3xl md:text-4xl">
              {product.rating}/5 · {product.reviewsCount} avis vérifiés
            </h2>
            <div className="divider-lux my-4" />
          </Reveal>
          <div className="grid md:grid-cols-3 gap-7">
            {[
              "Mon péché mignon. Le parfum est juste, jamais écœurant. La maison sent divinement bon.",
              "Combustion parfaitement régulière, aucune trace sur le verre. On sent le travail bien fait.",
              "Très belle bougie, packaging soigné et finition impeccable. Je recommande les yeux fermés.",
            ].map((t, i) => (
              <div key={i} className="bg-cacao-soft border border-eclat/25 rounded-[var(--radius-lg)] p-8">
                <div className="stars mb-3.5">★★★★★</div>
                <p className="font-serif italic text-lg text-cire leading-snug">« {t} »</p>
                <div className="flex items-center gap-3 mt-4.5 mt-[18px]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eclat-light to-eclat-dark" />
                  <div>
                    <b className="font-sans text-[13px] font-medium">Client·e vérifié·e</b>
                    <small className="block text-[11px] text-cire/55">Achat vérifié</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CROSS-SELL */}
      <section className="container-lux py-24">
        <Reveal className="text-center mb-12">
          <span className="eyebrow block mb-3">On vous suggère</span>
          <h2 className="text-3xl md:text-4xl">Complétez votre rituel</h2>
          <div className="divider-lux my-4" />
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
