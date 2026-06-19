"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Product, Family } from "@/lib/types";
import { ProductCard } from "./product-card";

const SORTS = [
  { value: "populaire", label: "Popularité" },
  { value: "nouveaute", label: "Nouveautés" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "note", label: "Mieux notés" },
];

export function ShopClient({
  products,
  families,
  initialFamily,
  initialSort = "populaire",
}: {
  products: Product[];
  families: Family[];
  initialFamily?: string;
  initialSort?: string;
}) {
  const [family, setFamily] = useState<string>(initialFamily ?? "Toutes");
  const [sort, setSort] = useState<string>(initialSort);
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(40);
  const [minIntensity, setMinIntensity] = useState(1);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (family !== "Toutes" && p.family !== family) return false;
      if (p.price > maxPrice) return false;
      if (p.intensity < minIntensity) return false;
      if (query && !`${p.name} ${p.shortNotes} ${p.family}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });

    switch (sort) {
      case "prix-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "prix-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "note":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "nouveaute":
        list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
        break;
      default:
        list = [...list].sort((a, b) => Number(!!b.bestSeller) - Number(!!a.bestSeller));
    }
    return list;
  }, [products, family, sort, query, maxPrice, minIntensity]);

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-12 items-start pt-12">
      {/* FILTRES */}
      <aside className="lg:sticky lg:top-28">
        <h4 className="font-sans text-xs uppercase tracking-[0.18em] text-cacao mb-3.5">Famille olfactive</h4>
        <div className="flex flex-wrap">
          {["Toutes", ...families].map((f) => (
            <button
              key={f}
              onClick={() => setFamily(f)}
              className={`text-[12.5px] px-3.5 py-2 mr-1.5 mb-2 rounded-full border transition-colors ${
                family === f
                  ? "bg-cacao text-cire border-cacao"
                  : "border-line text-muted hover:bg-cire-deep"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <h4 className="font-sans text-xs uppercase tracking-[0.18em] text-cacao mt-7 mb-3.5">
          Prix max — {maxPrice}€
        </h4>
        <input
          type="range"
          min={16}
          max={40}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-eclat"
        />
        <div className="flex justify-between text-[11px] text-muted">
          <span>16€</span>
          <span>40€</span>
        </div>

        <h4 className="font-sans text-xs uppercase tracking-[0.18em] text-cacao mt-7 mb-3.5">
          Intensité minimale
        </h4>
        <input
          type="range"
          min={1}
          max={5}
          value={minIntensity}
          onChange={(e) => setMinIntensity(Number(e.target.value))}
          className="w-full accent-eclat"
        />
        <div className="flex justify-between text-[11px] text-muted">
          <span>Délicate</span>
          <span>Intense</span>
        </div>

        <button
          onClick={() => {
            setFamily("Toutes");
            setMaxPrice(40);
            setMinIntensity(1);
            setQuery("");
          }}
          className="btn btn-ghost w-full mt-7"
        >
          Réinitialiser
        </button>
      </aside>

      {/* GRILLE */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-6 border-b border-line mb-8">
          <div className="flex items-center gap-2.5 border border-line rounded-full px-4.5 px-[18px] py-2.5 bg-cire max-w-[280px] w-full">
            <Search size={16} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une senteur…"
              className="bg-transparent text-[13px] w-full outline-none text-cacao"
            />
          </div>
          <div className="flex items-center gap-3.5">
            <span className="text-muted text-[13px]">{filtered.length} produits</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="font-sans text-[13px] border border-line bg-cire px-4 py-2.5 rounded-[var(--radius-sm)] text-cacao"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  Trier : {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted text-center py-20">Aucune bougie ne correspond à votre recherche.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
