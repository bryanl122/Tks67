"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const SORT_OPTIONS = [
  { value: "newest", label: "Nouveautés" },
  { value: "popular", label: "Popularité" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    router.push(`/products?${next.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      Trier&nbsp;:
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="input w-auto py-2"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CategoryFilter({
  categories,
  active,
}: {
  categories: { category: string; count: number }[];
  active?: string;
}) {
  const params = useSearchParams();

  function href(category?: string) {
    const next = new URLSearchParams(params.toString());
    if (category) next.set("category", category);
    else next.delete("category");
    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  const base =
    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition";
  return (
    <nav className="space-y-1">
      <Link
        href={href()}
        className={`${base} ${!active ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}
      >
        <span>Toutes les catégories</span>
      </Link>
      {categories.map((c) => (
        <Link
          key={c.category}
          href={href(c.category)}
          className={`${base} ${active === c.category ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <span>{c.category}</span>
          <span className="text-xs text-slate-400">{c.count}</span>
        </Link>
      ))}
    </nav>
  );
}
