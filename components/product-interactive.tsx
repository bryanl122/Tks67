"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, Minus, Plus, Truck, Sparkles, RefreshCw, AlertCircle, Wand2, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "./cart-context";
import { CandlePreview } from "./candle-preview";
import {
  WAX_COLORS,
  SCENTS,
  NATURAL_COLOR,
  NATURAL_SCENT,
  CUSTOMIZATION_FEE,
  shapeFor,
} from "@/lib/customization";

const FORMAT_OPTIONS = [
  { label: "Mini", suffix: " · découverte", delta: -6 },
  { label: "Classique", suffix: "", delta: 0 },
  { label: "Grand", suffix: " · format maison", delta: 12 },
];

export function ProductInteractive({ product }: { product: Product }) {
  const { add, open } = useCart();

  const naturalColor = NATURAL_COLOR[product.slug] ?? "#E3A6B2";
  const naturalScent = NATURAL_SCENT[product.slug] ?? SCENTS[0];
  const shape = shapeFor(product);

  const [view, setView] = useState<"photo" | "custom">("photo");
  const [formatIdx, setFormatIdx] = useState(1);
  const [gift, setGift] = useState(false);
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);

  const [scent, setScent] = useState(naturalScent);
  const [color, setColor] = useState({ name: "Naturelle", hex: naturalColor });

  const formats = FORMAT_OPTIONS;
  const customized = color.hex.toLowerCase() !== naturalColor.toLowerCase() || scent !== naturalScent;
  const unitPrice =
    product.price + formats[formatIdx].delta + (gift ? 6 : 0) + (customized ? CUSTOMIZATION_FEE : 0);

  function pickColor(name: string, hex: string) {
    setColor({ name, hex });
    setView("custom");
  }
  function pickScent(s: string) {
    setScent(s);
    setView("custom");
  }

  function handleAdd() {
    const parts = [formats[formatIdx].label, scent, `cire ${color.name}`];
    if (gift) parts.push("écrin cadeau");
    add(
      {
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: unitPrice,
        format: parts.join(" · "),
      },
      qty,
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
      {/* ===== GALERIE / APERÇU ===== */}
      <div>
        <div className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-card)] group">
          {view === "photo" ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width:1024px) 90vw, 600px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_18%,var(--color-cire),var(--color-cire-rose))] grid place-items-center">
              <CandlePreview color={color.hex} shape={shape} className="w-[78%] h-[78%]" />
              <span className="badge badge-gold absolute bottom-4 left-1/2 -translate-x-1/2">
                Aperçu personnalisé · {color.name}
              </span>
            </div>
          )}
          {product.badge && view === "photo" && (
            <span className="badge badge-gold absolute top-4 left-4">{product.badge}</span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 mt-3.5">
          {/* vignette photo */}
          <button
            onClick={() => setView("photo")}
            className={`relative aspect-square rounded-[var(--radius)] overflow-hidden border-2 ${
              view === "photo" ? "border-eclat" : "border-transparent"
            }`}
          >
            <Image src={product.image} alt="" fill sizes="120px" className="object-cover" />
          </button>

          {/* vignette aperçu personnalisé */}
          <button
            onClick={() => setView("custom")}
            className={`relative aspect-square rounded-[var(--radius)] overflow-hidden border-2 bg-cire-rose ${
              view === "custom" ? "border-eclat" : "border-transparent"
            }`}
            aria-label="Aperçu personnalisé"
          >
            <CandlePreview color={color.hex} shape={shape} className="w-full h-full" />
            <span className="absolute bottom-0 inset-x-0 bg-cacao/75 text-cire text-[8.5px] tracking-[0.12em] uppercase py-0.5 text-center">
              Perso
            </span>
          </button>

          <div className="relative aspect-square rounded-[var(--radius)] overflow-hidden bg-cacao grid place-items-center text-cire/70 text-[11px] text-center px-1">
            Vidéo
            <br />
            flamme
          </div>
        </div>
      </div>

      {/* ===== INFOS / ACHAT ===== */}
      <div>
        <div className="text-[11px] tracking-[0.18em] uppercase text-sauge font-medium">{product.family}</div>
        <h1 className="text-4xl md:text-5xl mt-2 mb-3">{product.name}</h1>
        <div className="flex items-center gap-2.5 text-[13px] text-muted">
          <span className="stars">★★★★★</span> {product.rating}/5 · {product.reviewsCount} avis
        </div>

        <div className="font-serif text-3xl text-cacao my-5 flex items-center gap-3">
          {product.compareAt && <s className="text-xl text-muted">{product.compareAt}€</s>}
          {unitPrice}€
          {customized && <span className="badge badge-soft align-middle">personnalisée</span>}
        </div>

        <p className="text-muted mb-6">{product.description}</p>

        {/* ===== CONFIGURATEUR ===== */}
        <div className="rounded-[var(--radius-lg)] border border-line bg-cire-rose/50 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 size={17} className="text-eclat-dark" />
            <span className="text-xs tracking-[0.16em] uppercase text-cacao font-medium">
              Composez votre bougie
            </span>
          </div>

          {/* Parfum */}
          <span className="text-[11px] tracking-[0.14em] uppercase text-muted block mb-2">Parfum</span>
          <div className="flex flex-wrap gap-2 mb-5">
            {SCENTS.map((s) => (
              <button
                key={s}
                onClick={() => pickScent(s)}
                className={`text-[12.5px] px-3 py-1.5 rounded-full border transition-colors ${
                  scent === s
                    ? "bg-cacao text-cire border-cacao"
                    : "border-line bg-cire text-cacao-soft hover:bg-cire-deep"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Couleur de cire */}
          <span className="text-[11px] tracking-[0.14em] uppercase text-muted block mb-2">
            Couleur de cire — <b className="text-cacao normal-case tracking-normal">{color.name}</b>
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* couleur naturelle */}
            <button
              onClick={() => pickColor("Naturelle", naturalColor)}
              className="swatch relative grid place-items-center"
              style={{ background: naturalColor }}
              data-active={color.hex.toLowerCase() === naturalColor.toLowerCase()}
              aria-label="Couleur naturelle"
              title="Naturelle"
            >
              {color.hex.toLowerCase() === naturalColor.toLowerCase() && (
                <Check size={15} className="text-cacao" />
              )}
            </button>

            {WAX_COLORS.map((c) => {
              const active = color.hex.toLowerCase() === c.hex.toLowerCase() && color.name === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => pickColor(c.name, c.hex)}
                  className="swatch grid place-items-center"
                  style={{ background: c.hex }}
                  data-active={active}
                  aria-label={c.name}
                  title={c.name}
                >
                  {active && <Check size={15} className="text-cacao" />}
                </button>
              );
            })}

            {/* couleur libre */}
            <label
              className="swatch grid place-items-center relative overflow-hidden"
              style={{ background: "conic-gradient(from 0deg, #E7AFBC, #B3A4D8, #A7C3D6, #9CAC88, #D6B068, #E79B78, #E7AFBC)" }}
              title="Couleur personnalisée"
            >
              <Plus size={15} className="text-cacao" />
              <input
                type="color"
                value={color.hex}
                onChange={(e) => pickColor("sur mesure", e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Choisir une couleur personnalisée"
              />
            </label>
          </div>

          <p className="text-[11.5px] text-muted mt-3 flex items-center gap-1.5">
            <Sparkles size={13} className="text-eclat-dark" />
            {customized
              ? `Personnalisation +${CUSTOMIZATION_FEE}€ — coulée rien que pour vous.`
              : "Modifiez le parfum ou la couleur : l'aperçu se met à jour en direct."}
          </p>
        </div>

        {/* FORMAT */}
        <div className="mb-5">
          <span className="text-xs tracking-[0.16em] uppercase text-cacao block mb-2.5">Format</span>
          <div className="flex flex-wrap gap-2.5">
            {formats.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setFormatIdx(i)}
                className={`border rounded-[var(--radius-sm)] px-[18px] py-3 text-[13px] transition-colors ${
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
              className={`border rounded-[var(--radius-sm)] px-[18px] py-3 text-[13px] ${
                !gift ? "border-cacao bg-cire-deep" : "border-line bg-cire"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setGift(true)}
              className={`border rounded-[var(--radius-sm)] px-[18px] py-3 text-[13px] ${
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
        <div className="flex flex-col gap-2.5 p-[22px] bg-cire-rose rounded-[var(--radius)] mt-2">
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
