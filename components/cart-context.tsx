"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartLine } from "@/lib/types";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string, format: string) => void;
  setQty: (slug: string, format: string, qty: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ecladecire-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);

    return {
      lines,
      count,
      subtotal,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add: (line, qty = 1) => {
        setLines((prev) => {
          const i = prev.findIndex((l) => l.slug === line.slug && l.format === line.format);
          if (i >= 0) {
            const next = [...prev];
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return next;
          }
          return [...prev, { ...line, qty }];
        });
        setIsOpen(true);
      },
      remove: (slug, format) =>
        setLines((prev) => prev.filter((l) => !(l.slug === slug && l.format === format))),
      setQty: (slug, format, qty) =>
        setLines((prev) =>
          prev
            .map((l) => (l.slug === slug && l.format === format ? { ...l, qty: Math.max(1, qty) } : l))
            .filter((l) => l.qty > 0),
        ),
    };
  }, [lines, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
