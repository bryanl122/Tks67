import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside>
          <div className="mb-4 rounded-xl bg-slate-900 px-4 py-3 text-white">
            <p className="text-xs uppercase tracking-wide text-slate-400">Espace</p>
            <p className="font-bold">Administration</p>
          </div>
          <nav className="space-y-1 text-sm font-medium">
            <Link href="/admin" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              📊 Tableau de bord
            </Link>
            <Link href="/admin/products" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              📦 Produits
            </Link>
            <Link href="/admin/orders" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              🧾 Commandes
            </Link>
            <Link href="/" className="block rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100">
              ← Retour au site
            </Link>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
