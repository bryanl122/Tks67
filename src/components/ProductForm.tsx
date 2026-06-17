import Link from "next/link";
import { CATEGORIES } from "@/lib/seed-data";
import type { Product } from "@/lib/types";

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  product?: Product;
  submitLabel: string;
}) {
  const euros = (cents: number | null | undefined) =>
    cents != null ? (cents / 100).toFixed(2) : "";

  return (
    <form action={action} className="card p-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">Nom du produit *</label>
          <input id="name" name="name" required defaultValue={product?.name} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="slug">Slug (URL)</label>
          <input id="slug" name="slug" defaultValue={product?.slug} placeholder="généré automatiquement" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={4} defaultValue={product?.description} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="price">Prix (€) *</label>
          <input id="price" name="price" required type="text" inputMode="decimal" defaultValue={euros(product?.price)} placeholder="49.90" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="compareAtPrice">Prix barré (€)</label>
          <input id="compareAtPrice" name="compareAtPrice" type="text" inputMode="decimal" defaultValue={euros(product?.compareAtPrice)} placeholder="89.90" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="category">Catégorie</label>
          <select id="category" name="category" defaultValue={product?.category ?? CATEGORIES[0]} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="stock">Stock</label>
          <input id="stock" name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="image">URL de l'image</label>
          <input id="image" name="image" defaultValue={product?.image} placeholder="https://… (généré si vide)" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="supplier">Fournisseur</label>
          <input id="supplier" name="supplier" defaultValue={product?.supplier} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="rating">Note</label>
            <input id="rating" name="rating" type="text" inputMode="decimal" defaultValue={product?.rating ?? 4.5} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="reviews">Avis</label>
            <input id="reviews" name="reviews" type="number" min={0} defaultValue={product?.reviews ?? 0} className="input" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={product?.featured === 1} className="h-4 w-4 accent-brand-600" />
            <span className="text-sm font-medium text-slate-700">Mettre en avant (coup de cœur)</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" className="btn-primary">{submitLabel}</button>
        <Link href="/admin/products" className="btn-secondary">Annuler</Link>
      </div>
    </form>
  );
}
