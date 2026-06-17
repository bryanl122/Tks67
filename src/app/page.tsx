import Link from "next/link";
import { getProducts, getCategories } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const CATEGORY_EMOJI: Record<string, string> = {
  "Électronique": "🎧",
  Maison: "🏠",
  Mode: "👕",
  "Sport & Plein air": "🏕️",
  Beauté: "💄",
  Accessoires: "🎒",
};

export default function HomePage() {
  const featured = getProducts({ featured: true, limit: 8 });
  const newest = getProducts({ sort: "newest", limit: 4 });
  const categories = getCategories();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge bg-white/15 text-white">🚚 Livraison offerte dès 50 €</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Les tendances du moment, livrées chez vous.
            </h1>
            <p className="mt-4 max-w-md text-lg text-brand-50">
              Gadgets, maison, mode et bien plus. Des produits sélectionnés
              avec soin, à prix imbattables.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn bg-white text-brand-700 hover:bg-brand-50">
                Découvrir la boutique
              </Link>
              <Link href="/products?sort=popular" className="btn border border-white/40 text-white hover:bg-white/10">
                Meilleures ventes →
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className={`overflow-hidden rounded-2xl border-4 border-white/20 shadow-xl ${
                    i % 2 === 1 ? "mt-8" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-center md:grid-cols-4">
          {[
            ["🚚", "Livraison rapide", "Expédition sous 24-48h"],
            ["🔒", "Paiement sécurisé", "Vos données protégées"],
            ["↩️", "Retours 30 jours", "Satisfait ou remboursé"],
            ["💬", "Support 7j/7", "Une équipe à l'écoute"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-semibold text-slate-900">{title}</span>
              <span className="text-xs text-slate-500">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900">Parcourir par catégorie</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/products?category=${encodeURIComponent(c.category)}`}
              className="card flex flex-col items-center gap-2 p-5 text-center transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="text-3xl">{CATEGORY_EMOJI[c.category] ?? "🛍️"}</span>
              <span className="text-sm font-semibold text-slate-900">{c.category}</span>
              <span className="text-xs text-slate-500">{c.count} produits</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-900">⭐ Coups de cœur</h2>
          <Link href="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Tout voir →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="overflow-hidden rounded-3xl bg-slate-900 px-8 py-12 text-center text-white md:py-16">
          <h2 className="text-3xl font-extrabold md:text-4xl">Offres flash chaque semaine 🔥</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Jusqu'à -60% sur une sélection de produits. Les stocks partent vite,
            ne ratez pas les bonnes affaires.
          </p>
          <Link href="/products?sort=popular" className="btn mt-6 bg-brand-600 text-white hover:bg-brand-500">
            Voir les promotions
          </Link>
        </div>
      </section>

      {/* Newest */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="text-2xl font-bold text-slate-900">Nouveautés</h2>
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {newest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
