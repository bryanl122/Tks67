"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "./cart-context";

const FREE_SHIPPING = 60;

export function CartDrawer() {
  const { lines, isOpen, close, subtotal, setQty, remove, count } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-cacao/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-cire z-[61] flex flex-col shadow-[var(--shadow-float)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.4 }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <h3 className="font-serif text-xl">Votre panier ({count})</h3>
              <button onClick={close} aria-label="Fermer" className="text-cacao hover:text-eclat-dark">
                <X size={22} />
              </button>
            </div>

            {subtotal > 0 && (
              <div className="px-6 py-4 bg-cire-rose">
                <p className="text-[12.5px] text-cacao-soft mb-2">
                  {remaining > 0 ? (
                    <>
                      Plus que <b className="text-eclat-dark">{remaining}€</b> pour la livraison offerte ✨
                    </>
                  ) : (
                    <>🎉 Vous bénéficiez de la livraison offerte !</>
                  )}
                </p>
                <div className="h-1.5 bg-cire-deep rounded-full overflow-hidden">
                  <div className="h-full bg-eclat transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
              {lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                  <ShoppingBag size={40} strokeWidth={1} className="text-eclat" />
                  <p className="text-muted">Votre panier est vide.</p>
                  <button onClick={close} className="btn btn-ghost">
                    Découvrir la boutique
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  {lines.map((l) => (
                    <li key={`${l.slug}-${l.format}`} className="flex gap-4">
                      <div className="relative w-20 h-24 rounded-[var(--radius)] overflow-hidden shrink-0 bg-cire-deep">
                        <Image src={l.image} alt={l.name} fill className="object-cover" sizes="80px" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between gap-2">
                          <p className="font-serif text-[17px] leading-tight">{l.name}</p>
                          <button
                            onClick={() => remove(l.slug, l.format)}
                            aria-label="Retirer"
                            className="text-muted hover:text-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-muted mt-0.5">{l.format}</p>
                        <div className="flex justify-between items-center mt-2.5">
                          <div className="flex items-center border border-line rounded-[var(--radius-sm)]">
                            <button
                              onClick={() => setQty(l.slug, l.format, l.qty - 1)}
                              className="w-8 h-8 grid place-items-center text-cacao"
                              aria-label="Moins"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-7 text-center text-sm">{l.qty}</span>
                            <button
                              onClick={() => setQty(l.slug, l.format, l.qty + 1)}
                              className="w-8 h-8 grid place-items-center text-cacao"
                              aria-label="Plus"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-serif text-[17px]">{(l.price * l.qty).toFixed(0)}€</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-muted text-sm">Sous-total</span>
                  <span className="font-serif text-2xl text-cacao">{subtotal.toFixed(0)}€</span>
                </div>
                <Link href="/panier" className="btn btn-primary w-full" onClick={close}>
                  Passer commande
                </Link>
                <button onClick={close} className="btn btn-light w-full mt-2.5">
                  Continuer mes achats
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
