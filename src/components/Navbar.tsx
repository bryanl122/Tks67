"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "./CartProvider";

export function Navbar() {
  const { count, ready } = useCart();
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("search") ?? "");
  const [open, setOpen] = useState(false);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
            ⚡
          </span>
          Drop<span className="text-brand-600">Flow</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">
          <Link href="/products" className="hover:text-brand-600">
            Boutique
          </Link>
          <Link href="/products?sort=popular" className="hover:text-brand-600">
            Meilleures ventes
          </Link>
          <Link href="/products?category=Électronique" className="hover:text-brand-600">
            Électronique
          </Link>
          <Link href="/products?category=Maison" className="hover:text-brand-600">
            Maison
          </Link>
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden flex-1 max-w-md md:block">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit…"
              className="input pl-10"
              aria-label="Rechercher"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <Link
            href="/admin"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:block"
          >
            Admin
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            🛒
            <span className="hidden sm:inline">Panier</span>
            {ready && count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg border border-slate-200 px-3 py-2 lg:hidden"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <form onSubmit={onSearch} className="mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="input"
            />
          </form>
          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <Link href="/products" onClick={() => setOpen(false)} className="rounded px-2 py-2 hover:bg-slate-100">
              Boutique
            </Link>
            <Link href="/products?sort=popular" onClick={() => setOpen(false)} className="rounded px-2 py-2 hover:bg-slate-100">
              Meilleures ventes
            </Link>
            <Link href="/admin" onClick={() => setOpen(false)} className="rounded px-2 py-2 hover:bg-slate-100">
              Espace admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
