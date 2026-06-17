import { NextResponse } from "next/server";
import { createOrder, type NewOrderInput } from "@/lib/db";

export async function POST(request: Request) {
  let body: Partial<NewOrderInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const required: (keyof NewOrderInput)[] = [
    "customerName",
    "email",
    "address",
    "city",
    "postalCode",
    "country",
  ];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json(
        { ok: false, error: `Le champ "${field}" est requis.` },
        { status: 400 }
      );
    }
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ ok: false, error: "Le panier est vide." }, { status: 400 });
  }

  const items = body.items
    .map((i) => ({
      productId: Number(i.productId),
      quantity: Math.max(1, Number(i.quantity) || 0),
    }))
    .filter((i) => Number.isInteger(i.productId) && i.quantity > 0);

  const result = createOrder({
    customerName: String(body.customerName),
    email: String(body.email),
    phone: String(body.phone ?? ""),
    address: String(body.address),
    city: String(body.city),
    postalCode: String(body.postalCode),
    country: String(body.country),
    paymentMethod: String(body.paymentMethod ?? "card"),
    items,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
