import Link from "next/link";
import { getDashboardStats, getOrders, getProducts } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const stats = getDashboardStats();
  const recentOrders = getOrders().slice(0, 6);
  const lowStock = getProducts()
    .filter((p) => p.stock < 50)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const cards = [
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue), icon: "💶", accent: "bg-emerald-50 text-emerald-700" },
    { label: "Commandes", value: stats.orders.toString(), icon: "🧾", accent: "bg-brand-50 text-brand-700" },
    { label: "Produits", value: stats.products.toString(), icon: "📦", accent: "bg-violet-50 text-violet-700" },
    { label: "Stock faible", value: stats.lowStock.toString(), icon: "⚠️", accent: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
      <p className="text-sm text-slate-500">Vue d'ensemble de votre boutique DropFlow.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-lg text-lg ${c.accent}`}>
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Tout voir →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Aucune commande pour l'instant.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="pb-2">Réf.</th>
                  <th className="pb-2">Client</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 font-mono text-xs">{o.reference}</td>
                    <td className="py-2.5">{o.customerName}</td>
                    <td className="py-2.5 text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="py-2.5"><StatusBadge status={o.status} /></td>
                    <td className="py-2.5 text-right font-medium">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900">⚠️ Stock à surveiller</h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Tous les stocks sont confortables.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                  <span className="line-clamp-1 flex-1 text-sm text-slate-700">{p.name}</span>
                  <span className={`badge ${p.stock < 50 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                    {p.stock} u.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
