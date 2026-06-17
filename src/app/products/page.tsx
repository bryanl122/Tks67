import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getProducts, getCategories, type ProductQuery } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter, SortSelect } from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Parcourez tous les produits DropFlow.",
};

type SearchParams = {
  category?: string;
  search?: string;
  sort?: string;
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sort = (["newest", "price-asc", "price-desc", "popular"].includes(
    searchParams.sort ?? ""
  )
    ? searchParams.sort
    : "newest") as ProductQuery["sort"];

  const products = getProducts({
    category: searchParams.category,
    search: searchParams.search,
    sort,
  });
  const categories = getCategories();

  const title = searchParams.search
    ? `Résultats pour « ${searchParams.search} »`
    : searchParams.category ?? "Tous les produits";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-600">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Boutique</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{products.length} produit(s)</p>
        </div>
        <Suspense fallback={null}>
          <SortSelect current={sort ?? "newest"} />
        </Suspense>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:block">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Catégories
          </h2>
          <Suspense fallback={null}>
            <CategoryFilter categories={categories} active={searchParams.category} />
          </Suspense>
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <span className="text-4xl">🔍</span>
              <p className="font-semibold text-slate-700">Aucun produit trouvé</p>
              <p className="text-sm text-slate-500">
                Essayez une autre recherche ou catégorie.
              </p>
              <Link href="/products" className="btn-primary mt-2">
                Voir tous les produits
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
