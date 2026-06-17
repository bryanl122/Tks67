import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              ⚡
            </span>
            DropFlow
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Les meilleurs produits tendance, sélectionnés et livrés directement
            chez vous. Satisfait ou remboursé sous 30 jours.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Boutique</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/products" className="hover:text-brand-600">Tous les produits</Link></li>
            <li><Link href="/products?sort=popular" className="hover:text-brand-600">Meilleures ventes</Link></li>
            <li><Link href="/products?category=Électronique" className="hover:text-brand-600">Électronique</Link></li>
            <li><Link href="/products?category=Maison" className="hover:text-brand-600">Maison</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Aide</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><span className="cursor-default">Suivi de commande</span></li>
            <li><span className="cursor-default">Livraison & retours</span></li>
            <li><span className="cursor-default">FAQ</span></li>
            <li><Link href="/admin" className="hover:text-brand-600">Espace administrateur</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Newsletter</h4>
          <p className="mt-3 text-sm text-slate-500">
            -10% sur votre première commande en vous inscrivant.
          </p>
          <form className="mt-3 flex gap-2" action="#">
            <input className="input" placeholder="Votre e-mail" aria-label="E-mail" />
            <button className="btn-primary shrink-0" type="button">OK</button>
          </form>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5">
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} DropFlow. Démo e-commerce. Paiement
          simulé — aucune transaction réelle.
        </p>
      </div>
    </footer>
  );
}
