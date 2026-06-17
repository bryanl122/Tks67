import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="text-6xl">🛸</span>
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Page introuvable</h1>
      <p className="mt-2 text-slate-500">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Accueil</Link>
        <Link href="/products" className="btn-secondary">Boutique</Link>
      </div>
    </div>
  );
}
