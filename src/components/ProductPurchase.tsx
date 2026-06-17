"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function add() {
    if (soldOut) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-6">
      {!soldOut ? (
        <p className="text-sm font-medium text-emerald-600">
          ● En stock — {product.stock} disponible(s)
        </p>
      ) : (
        <p className="text-sm font-medium text-rose-600">● Rupture de stock</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-slate-300">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={soldOut}
            className="px-4 py-2.5 text-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Diminuer"
          >
            −
          </button>
          <span className="w-12 text-center font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={soldOut}
            className="px-4 py-2.5 text-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Augmenter"
          >
            +
          </button>
        </div>

        <button
          onClick={add}
          disabled={soldOut}
          className={`btn-primary flex-1 text-base ${
            added ? "bg-emerald-600 hover:bg-emerald-600" : ""
          }`}
        >
          {soldOut ? "Indisponible" : added ? "✓ Ajouté au panier" : "Ajouter au panier"}
        </button>
      </div>

      {added && (
        <Link
          href="/cart"
          className="btn-secondary mt-3 w-full"
        >
          Voir le panier →
        </Link>
      )}
    </div>
  );
}
