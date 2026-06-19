"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, Minus, Plus, Truck, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "./cart-context";

const FORMAT_OPTIONS = (base: number) => [
  { label: "Mini", suffix: " · découverte", delta: -6 },
  { label: "Classique", suffix: "", delta: 0 },
  { label: "Grand", suffix: " · format maison", delta: 12 },
];

export function ProductInteractive({ product }: { product: Product }) {
  const { add, open } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [formatIdx, setFormatIdx] = useState(1);
  const [gift, setGift] = useState(false);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);

  const formats = FORMAT_OPTIONS(product.price);
  const unitPrice = product.price + formats[formatIdx].delta + (gift ? 6 : 0);
  const thumbs = [product.image, product.image, product.image];

  function handleAdd() {
    add(
      {
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: unitPrice,
        format: `${formats[formatIdx].label}${gift ? " · écrin cadeau" : ""}`,
      },
      qty,
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
      {/* GALERIE */}
      <div>
        <div className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-cire-deep shadow-[var(--shadow-card)] group">
          <Image
            src={thumbs[activeImg]}
            alt={product.name}
            fill
            priority
            sizes="(max-width:1024px) 90vw, 600px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {product.badge && <span className="badge badge-gold absolute top-4 left-4">{product.badge}</span>}
        </div>
        <div className="grid grid-cols-4 gap-3 mt-3.5">
          {thumbs.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`relative aspect-square rounded-[var(--radius)] overflow-hidden border-2 ${
                activeImg === i ? "border-eclat" : "border-transparent"
              }`}
            >
              <Image src={t} alt={`${product.name} ${i + 1}`} fill sizes="120px" className="object-cover" />
            </button>
          ))}
          <div className="relative aspect-square rounded-[var(--radius)] overflow-hidden bg-cacao grid place-items-center text-cire/70 text-[11px] text-center px-1">
            Vidéo
            <br />
            flamme
          </div>
        </div>
      </div>

      {/* INFOS / ACHAT */}
      <div>
        <div className="text-[11px] tracking-[0.18em] uppercase text-sauge font-medium">{product.family}</div>
        <h1 className="text-4xl md:text-5xl mt-2 mb-3">{product.name}</h1>
        <div className="flex items-center gap-2.5 text-[13px] text-muted">
          <span className="stars">★★★★★</span> {product.rating}/5 · {product.reviewsCount} avis
        </div>

        <div className="font-serif text-3xl text-cacao my-5 flex items-center gap-3">
          {product.compareAt && <s className="text-xl text-muted">{product.compareAt}€</s>}
          {unitPrice}€
          {product.compareAt && (
            <span className="badge badge-soft align-middle">
              -{Math.round((1 - product.price / product.compareAt) * 100)}%
            </span>
          )}
        </div>

        <p className="text-muted mb-6">{product.description}</p>

        {/* FORMAT */}
        <div className="mb-5">
          <span className="text-xs tracking-[0.16em] uppercase text-cacao block mb-2.5">Format</span>
          <div className="flex flex-wrap gap-2.5">
            {formats.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setFormatIdx(i)}
                className={`border rounded-[var(--radius-sm)] px-4.5 px-[18px] py-3 text-[13px] transition-colors ${
                  formatIdx === i ? "border-cacao bg-cire-deep" : "border-line bg-cire hover:bg-cire-deep"
                }`}
              >
                {f.label}
                {f.suffix} — {product.price + f.delta}€
              </button>
            ))}
          </div>
        </div>

        {/* CADEAU */}
        <div className="mb-6">
          <span className="text-xs tracking-[0.16em] uppercase text-cacao block mb-2.5">Option cadeau</span>
          <div className="flex gap-2.5">
            <button
              onClick={() => setGift(false)}
              className={`border rounded-[var(--radius-sm)] px-4.5 px-[18px] py-3 text-[13px] ${
                !gift ? "border-cacao bg-cire-deep" : "border-line bg-cire"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setGift(true)}
              className={`border rounded-[var(--radius-sm)] px-4.5 px-[18px] py-3 text-[13px] ${
                gift ? "border-cacao bg-cire-deep" : "border-line bg-cire"
              }`}
            >
              Écrin cadeau +6€
            </button>
          </div>
        </div>

        {/* ACHAT */}
        <div className="flex gap-3 mb-3">
          <div className="flex items-center border border-line rounded-[var(--radius-sm)]">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-12 h-[52px] grid place-items-center text-cacao" aria-label="Moins">
              <Minus size={16} />
            </button>
            <span className="w-9 text-center text-sm">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-12 h-[52px] grid place-items-center text-cacao" aria-label="Plus">
              <Plus size={16} />
            </button>
          </div>
          <button onClick={handleAdd} className="btn btn-primary flex-1">
            Ajouter au panier — {unitPrice * qty}€
          </button>
          <button
            onClick={() => setFav((v) => !v)}
            className="w-[52px] h-[52px] grid place-items-center border border-line rounded-[var(--radius-sm)] text-cacao shrink-0"
            aria-label="Favori"
          >
            <Heart size={20} fill={fav ? "var(--color-eclat)" : "none"} stroke={fav ? "var(--color-eclat)" : "currentColor"} />
          </button>
        </div>
        <button
          onClick={() => {
            handleAdd();
            open();
          }}
          className="btn btn-ghost w-full"
        >
          Acheter maintenant · Apple Pay / G Pay
        </button>

        {/* RÉASSURANCE */}
        <div className="flex flex-col gap-2.5 p-5.5 p-[22px] bg-cire-rose rounded-[var(--radius)] mt-2">
          <div className="flex items-center gap-3 text-[13.5px] text-cacao-soft">
            <Truck size={18} className="text-eclat-dark" /> Livraison offerte dès 60€ · expédition sous 48h
          </div>
          <div className="flex items-center gap-3 text-[13.5px] text-cacao-soft">
            <Sparkles size={18} className="text-eclat-dark" /> Coulée à la main en France · cire 100% végétale
          </div>
          <div className="flex items-center gap-3 text-[13.5px] text-cacao-soft">
            <RefreshCw size={18} className="text-eclat-dark" /> Retours offerts sous 30 jours
          </div>
          {product.stock <= 10 && (
            <div className="flex items-center gap-3 text-[13.5px] text-danger">
              <AlertCircle size={18} /> Édition limitée · plus que {product.stock} exemplaires
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
