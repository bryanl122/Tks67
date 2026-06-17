import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, discountPercent } from "@/lib/format";
import { StarRating } from "./StarRating";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.price, product.compareAtPrice);
  return (
    <div className="card group flex flex-col overflow-hidden transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="badge absolute left-3 top-3 bg-rose-500 text-white">
            -{discount}%
          </span>
        )}
        {product.stock <= 0 && (
          <span className="badge absolute right-3 top-3 bg-slate-900 text-white">
            Épuisé
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
          {product.category}
        </span>
        <Link
          href={`/products/${product.slug}`}
          className="mt-1 line-clamp-2 font-semibold text-slate-900 hover:text-brand-600"
        >
          {product.name}
        </Link>
        <div className="mt-2">
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        <div className="mt-4 pt-0">
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </div>
  );
}
