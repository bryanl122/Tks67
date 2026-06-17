import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";
import { createProductAction } from "../../actions";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/admin/products" className="hover:text-brand-600">Produits</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Nouveau</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Ajouter un produit</h1>
      <ProductForm action={createProductAction} submitLabel="Créer le produit" />
    </div>
  );
}
