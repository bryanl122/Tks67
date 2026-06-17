import type { OrderStatus } from "@/lib/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-slate-100 text-slate-600" },
  paid: { label: "Payée", className: "bg-brand-100 text-brand-700" },
  shipped: { label: "Expédiée", className: "bg-violet-100 text-violet-700" },
  delivered: { label: "Livrée", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Annulée", className: "bg-rose-100 text-rose-700" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
}
