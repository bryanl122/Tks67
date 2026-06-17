"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function AddToCartButton({
  product,
  compact = false,
  quantity = 1,
}: {
  product: Product;
  compact?: boolean;
  quantity?: number;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleClick() {
    if (soldOut) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      disabled={soldOut}
      className={`${compact ? "btn-secondary w-full" : "btn-primary w-full text-base"} ${
        added ? "border-emerald-500 bg-emerald-50 text-emerald-700" : ""
      }`}
    >
      {soldOut ? "Épuisé" : added ? "✓ Ajouté" : compact ? "Ajouter" : "Ajouter au panier"}
    </button>
  );
}
