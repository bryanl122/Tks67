import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";
import { updateProductAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = getProductById(parseInt(params.id, 10));
  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/admin/products" className="hover:text-brand-600">Produits</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Modifier</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Modifier « {product.name} »</h1>
      <ProductForm action={updateProductAction} product={product} submitLabel="Enregistrer" />
    </div>
  );
}
