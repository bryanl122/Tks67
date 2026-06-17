import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getProducts } from "@/lib/db";
import { formatPrice, discountPercent } from "@/lib/format";
import { StarRating } from "@/components/StarRating";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: product.description.slice(0, 150),
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const discount = discountPercent(product.price, product.compareAtPrice);
  const related = getProducts({ category: product.category, limit: 5 }).filter(
    (p) => p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-600">Accueil</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-600">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.gallery} alt={product.name} />

        <div>
          <span className="text-sm font-medium uppercase tracking-wide text-brand-600">
            {product.category}
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={product.rating} reviews={product.reviews} size="md" />
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="badge bg-rose-100 text-rose-700">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-slate-600">{product.description}</p>

          <ul className="mt-5 space-y-2 text-sm text-slate-600">
            <li>✅ Livraison offerte dès 50 € d'achat</li>
            <li>↩️ Retour gratuit sous 30 jours</li>
            <li>🔒 Paiement 100% sécurisé</li>
          </ul>

          <ProductPurchase product={product} />

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Vendu et expédié par <span className="font-medium text-slate-700">{product.supplier}</span>.
            Référence&nbsp;: <span className="font-mono">{product.slug}</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900">Vous aimerez aussi</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
