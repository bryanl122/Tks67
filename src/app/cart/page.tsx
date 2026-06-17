"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const {
    items,
    subtotal,
    shipping,
    total,
    count,
    freeShippingThreshold,
    setQuantity,
    removeItem,
    ready,
  } = useCart();

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">Chargement…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="text-5xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Votre panier est vide</h1>
        <p className="mt-2 text-slate-500">
          Parcourez notre boutique et trouvez votre bonheur.
        </p>
        <Link href="/products" className="btn-primary mt-6">
          Découvrir les produits
        </Link>
      </div>
    );
  }

  const remaining = freeShippingThreshold - subtotal;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Votre panier <span className="text-slate-400">({count})</span>
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {remaining > 0 ? (
            <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
              Plus que <strong>{formatPrice(remaining)}</strong> pour bénéficier de la
              <strong> livraison offerte</strong> ! 🚚
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              🎉 Vous bénéficiez de la livraison gratuite&nbsp;!
            </div>
          )}

          {items.map((item) => (
            <div key={item.productId} className="card flex gap-4 p-4">
              <Link
                href={`/products/${item.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link href={`/products/${item.slug}`} className="font-semibold text-slate-900 hover:text-brand-600">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-slate-400 hover:text-rose-600"
                    aria-label="Supprimer"
                  >
                    ✕
                  </button>
                </div>
                <span className="text-sm text-slate-500">{formatPrice(item.price)} / unité</span>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-slate-300">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">Récapitulatif</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Sous-total</dt>
                <dd className="font-medium text-slate-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Livraison</dt>
                <dd className="font-medium text-slate-900">
                  {shipping === 0 ? <span className="text-emerald-600">Offerte</span> : formatPrice(shipping)}
                </dd>
              </div>
              <div className="my-3 border-t border-slate-200" />
              <div className="flex justify-between text-base">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="font-bold text-slate-900">{formatPrice(total)}</dd>
              </div>
            </dl>
            <Link href="/checkout" className="btn-primary mt-5 w-full text-base">
              Passer la commande →
            </Link>
            <Link href="/products" className="btn-secondary mt-2 w-full">
              Continuer mes achats
            </Link>
            <p className="mt-4 text-center text-xs text-slate-400">
              🔒 Paiement sécurisé · Démo sans transaction réelle
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
