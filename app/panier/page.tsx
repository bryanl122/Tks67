"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Lock, Tag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-context";

const FREE_SHIPPING = 60;

export default function PanierPage() {
  const { lines, subtotal, setQty, remove } = useCart();
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState<number>(0);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : 5.9;
  const discount = applied ? (subtotal * applied) / 100 : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  return (
    <div className="container-lux py-16 min-h-[60vh]">
      <h1 className="text-4xl md:text-5xl mb-2">Votre panier</h1>
      <div className="divider-lux !mx-0 my-4" />

      {lines.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted mb-6">Votre panier est encore vide.</p>
          <Link href="/boutique" className="btn btn-primary">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-12 mt-8">
          {/* LIGNES */}
          <ul className="flex flex-col">
            {lines.map((l) => (
              <li
                key={`${l.slug}-${l.format}`}
                className="flex gap-5 py-6 border-b border-line first:border-t"
              >
                <Link
                  href={`/produit/${l.slug}`}
                  className="relative w-24 h-28 rounded-[var(--radius)] overflow-hidden bg-cire-deep shrink-0"
                >
                  <Image src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl">{l.name}</h3>
                      <p className="text-xs text-muted mt-1">{l.format}</p>
                    </div>
                    <button onClick={() => remove(l.slug, l.format)} className="text-muted hover:text-danger h-fit" aria-label="Retirer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-line rounded-[var(--radius-sm)]">
                      <button onClick={() => setQty(l.slug, l.format, l.qty - 1)} className="w-9 h-9 grid place-items-center" aria-label="Moins">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{l.qty}</span>
                      <button onClick={() => setQty(l.slug, l.format, l.qty + 1)} className="w-9 h-9 grid place-items-center" aria-label="Plus">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-serif text-xl">{(l.price * l.qty).toFixed(0)}€</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* RÉCAP */}
          <aside className="bg-cire-rose rounded-[var(--radius-lg)] p-7 h-fit lg:sticky lg:top-28">
            <h2 className="text-2xl mb-5">Récapitulatif</h2>

            <div className="flex gap-2 mb-5">
              <div className="flex items-center gap-2 border border-line rounded-[var(--radius-sm)] px-3 bg-cire flex-1">
                <Tag size={15} className="text-muted" />
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Code promo"
                  className="bg-transparent text-sm py-2.5 w-full outline-none"
                />
              </div>
              <button
                onClick={() => setApplied(promo.trim().toUpperCase() === "BIENVENUE10" ? 10 : 0)}
                className="btn btn-ghost !px-4 !py-2.5"
              >
                OK
              </button>
            </div>
            {applied > 0 && (
              <p className="text-success text-xs mb-4">Code BIENVENUE10 appliqué : -{applied}%</p>
            )}

            <dl className="flex flex-col gap-2.5 text-sm border-t border-line pt-4">
              <div className="flex justify-between">
                <dt className="text-muted">Sous-total</dt>
                <dd>{subtotal.toFixed(2)}€</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Réduction</dt>
                  <dd>-{discount.toFixed(2)}€</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Livraison</dt>
                <dd>{shipping === 0 ? "Offerte" : `${shipping.toFixed(2)}€`}</dd>
              </div>
              <div className="flex justify-between items-baseline border-t border-line pt-3 mt-1">
                <dt className="font-serif text-lg">Total</dt>
                <dd className="font-serif text-2xl">{total.toFixed(2)}€</dd>
              </div>
            </dl>

            <button className="btn btn-primary w-full mt-6">
              <Lock size={15} /> Paiement sécurisé
            </button>
            <p className="text-center text-[11px] text-muted mt-3">
              Stripe · PayPal · Apple Pay · Google Pay
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
