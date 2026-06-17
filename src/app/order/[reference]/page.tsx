import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByReference } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "paid", label: "Confirmée", icon: "✅" },
  { key: "shipped", label: "Expédiée", icon: "📦" },
  { key: "delivered", label: "Livrée", icon: "🏠" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

export default function OrderPage({
  params,
}: {
  params: { reference: string };
}) {
  const order = getOrderByReference(params.reference);
  if (!order) notFound();

  const currentIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card overflow-hidden">
        <div className="bg-emerald-50 px-6 py-8 text-center">
          <span className="text-5xl">🎉</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Merci pour votre commande&nbsp;!</h1>
          <p className="mt-2 text-slate-600">
            Un e-mail de confirmation a été envoyé à{" "}
            <span className="font-medium">{order.email}</span>.
          </p>
          <p className="mt-3 inline-block rounded-lg bg-white px-4 py-2 font-mono text-sm font-semibold text-slate-900 shadow-sm">
            Référence : {order.reference}
          </p>
        </div>

        <div className="p-6">
          {order.status !== "cancelled" && (
            <div className="mb-8">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                Suivi
              </h2>
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => {
                  const stepIndex = STATUS_ORDER.indexOf(step.key);
                  const done = currentIndex >= stepIndex;
                  return (
                    <div key={step.key} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-full text-lg ${
                            done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <span className={`mt-1.5 text-xs font-medium ${done ? "text-slate-900" : "text-slate-400"}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`mx-2 h-0.5 flex-1 ${currentIndex > stepIndex ? "bg-emerald-500" : "bg-slate-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Articles
          </h2>
          <ul className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-700">
                  {item.name} <span className="text-slate-400">× {item.quantity}</span>
                </span>
                <span className="font-medium text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Sous-total</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Livraison</dt>
              <dd>{order.shipping === 0 ? "Offerte" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold">
              <dt>Total payé</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Livraison</h3>
              <p className="mt-1 text-slate-600">
                {order.customerName}<br />
                {order.address}<br />
                {order.postalCode} {order.city}<br />
                {order.country}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Détails</h3>
              <p className="mt-1 text-slate-600">
                Date : {formatDate(order.createdAt)}<br />
                Paiement : {order.paymentMethod}<br />
                Statut : <span className="font-medium capitalize">{order.status}</span>
              </p>
            </div>
          </div>

          <Link href="/products" className="btn-primary mt-6 w-full">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
