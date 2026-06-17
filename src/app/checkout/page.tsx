"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clear, ready } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState("card");

  if (ready && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Votre panier est vide</h1>
        <Link href="/products" className="btn-primary mt-6">Retour à la boutique</Link>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("customerName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      postalCode: String(form.get("postalCode") ?? ""),
      country: String(form.get("country") ?? ""),
      paymentMethod: payment,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Une erreur est survenue.");
      }
      clear();
      router.push(`/order/${data.reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Finaliser la commande</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">📦 Adresse de livraison</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="customerName">Nom complet</label>
                <input id="customerName" name="customerName" required className="input" placeholder="Jean Dupont" />
              </div>
              <div>
                <label className="label" htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" required className="input" placeholder="jean@exemple.fr" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Téléphone</label>
                <input id="phone" name="phone" className="input" placeholder="06 12 34 56 78" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="address">Adresse</label>
                <input id="address" name="address" required className="input" placeholder="12 rue des Lilas" />
              </div>
              <div>
                <label className="label" htmlFor="postalCode">Code postal</label>
                <input id="postalCode" name="postalCode" required className="input" placeholder="75001" />
              </div>
              <div>
                <label className="label" htmlFor="city">Ville</label>
                <input id="city" name="city" required className="input" placeholder="Paris" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="country">Pays</label>
                <select id="country" name="country" required className="input" defaultValue="France">
                  <option>France</option>
                  <option>Belgique</option>
                  <option>Suisse</option>
                  <option>Luxembourg</option>
                  <option>Canada</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">💳 Paiement</h2>
            <p className="mt-1 text-sm text-slate-500">
              Démonstration — aucune somme ne sera réellement débitée.
            </p>
            <div className="mt-4 space-y-3">
              {[
                ["card", "Carte bancaire", "💳"],
                ["paypal", "PayPal", "🅿️"],
                ["transfer", "Virement", "🏦"],
              ].map(([value, label, icon]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    payment === value ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={payment === value}
                    onChange={() => setPayment(value)}
                    className="accent-brand-600"
                  />
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>

            {payment === "card" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Numéro de carte</label>
                  <input className="input" placeholder="4242 4242 4242 4242" inputMode="numeric" />
                </div>
                <div>
                  <label className="label">Expiration</label>
                  <input className="input" placeholder="MM/AA" />
                </div>
                <div>
                  <label className="label">CVC</label>
                  <input className="input" placeholder="123" inputMode="numeric" />
                </div>
              </div>
            )}
          </section>

          {error && (
            <div className="rounded-lg bg-rose-50 p-4 text-sm font-medium text-rose-700">
              ⚠️ {error}
            </div>
          )}
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">Votre commande</h2>
            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3 text-sm">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-xs text-white">
                      {i.quantity}
                    </span>
                  </div>
                  <span className="line-clamp-2 flex-1 text-slate-700">{i.name}</span>
                  <span className="font-medium text-slate-900">{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Sous-total</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Livraison</dt>
                <dd className="font-medium">
                  {shipping === 0 ? <span className="text-emerald-600">Offerte</span> : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full text-base">
              {submitting ? "Traitement…" : `Payer ${formatPrice(total)}`}
            </button>
            <Link href="/cart" className="btn-secondary mt-2 w-full">
              Retour au panier
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
