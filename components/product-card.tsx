"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./cart-context";

function badgeClass(badge?: string) {
  switch (badge) {
    case "Best-seller":
      return "badge-gold";
    case "Nouveauté":
      return "badge-sauge";
    case "Coffret":
      return "badge-soft";
    default:
      return "";
  }
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [fav, setFav] = useState(false);

  return (
    <article className="group relative transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden bg-cire-deep">
        <Link href={`/produit/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {product.badge && (
          <span className={`badge ${badgeClass(product.badge)} absolute top-3 left-3 z-10`}>
            {product.badge}
          </span>
        )}

        <button
          onClick={() => setFav((v) => !v)}
          aria-label="Ajouter aux favoris"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-cire/85 grid place-items-center text-cacao hover:bg-cire transition-colors"
        >
          <Heart size={16} fill={fav ? "var(--color-eclat)" : "none"} stroke={fav ? "var(--color-eclat)" : "currentColor"} />
        </button>

        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={() =>
              add({
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                format: product.format,
              })
            }
            className="btn btn-primary w-full"
          >
            Ajouter — {product.price}€
          </button>
        </div>
      </div>

      <div className="text-center pt-4">
        <div className="text-[11px] tracking-[0.18em] uppercase text-sauge font-medium">
          {product.family}
        </div>
        <h3 className="font-serif text-xl mt-1.5 mb-1">
          <Link href={`/produit/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="text-[13px] text-muted min-h-[38px]">{product.shortNotes}</p>
        <div className="flex items-center justify-center gap-2.5 mt-2">
          <span className="stars text-[13px]" aria-label={`Note ${product.rating} sur 5`}>
            ★★★★★
          </span>
          <span className="font-serif text-[19px]">
            {product.compareAt && (
              <s className="text-muted text-sm mr-1.5">{product.compareAt}€</s>
            )}
            {product.price}€
          </span>
        </div>
      </div>
    </article>
  );
}
