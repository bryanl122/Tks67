import type { Metadata } from "next";
import { Package, Heart, MapPin, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Gérez vos commandes, favoris, adresses et informations personnelles ÉclaDeCire.",
  robots: { index: false },
};

const ORDERS = [
  { id: "ECL-2041", date: "12 juin 2026", total: "64,00€", status: "Livré", items: "Pétale de Rose, Cœur de Cire" },
  { id: "ECL-1987", date: "28 mai 2026", total: "32,00€", status: "Livré", items: "Bouquet de Roses" },
];

const TABS = [
  { icon: Package, label: "Commandes", active: true },
  { icon: Heart, label: "Favoris" },
  { icon: MapPin, label: "Adresses" },
  { icon: Settings, label: "Paramètres" },
];

export default function ComptePage() {
  return (
    <div className="container-lux py-16 min-h-[60vh]">
      <span className="eyebrow">Espace personnel</span>
      <h1 className="text-4xl md:text-5xl mt-2 mb-2">Bonjour, Violette</h1>
      <p className="text-muted mb-10">Membre depuis mai 2026 · 240 points fidélité ✨</p>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto hide-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] text-sm whitespace-nowrap transition-colors ${
                t.active ? "bg-cacao text-cire" : "text-cacao-soft hover:bg-cire-deep"
              }`}
            >
              <t.icon size={18} strokeWidth={1.5} /> {t.label}
            </button>
          ))}
        </nav>

        <div>
          <h2 className="text-2xl mb-5">Mes commandes</h2>
          <div className="flex flex-col gap-4">
            {ORDERS.map((o) => (
              <div
                key={o.id}
                className="border border-line rounded-[var(--radius-lg)] p-6 flex flex-wrap justify-between gap-4 items-center"
              >
                <div>
                  <b className="font-serif text-lg">{o.id}</b>
                  <p className="text-xs text-muted mt-0.5">{o.date} · {o.items}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="badge badge-sauge">{o.status}</span>
                  <span className="font-serif text-xl">{o.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
