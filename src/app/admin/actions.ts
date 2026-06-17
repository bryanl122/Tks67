"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
} from "@/lib/db";
import type { OrderStatus, Product } from "@/lib/types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function euroToCents(value: FormDataEntryValue | null): number {
  const n = parseFloat(String(value ?? "0").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function buildProductFromForm(form: FormData): Omit<Product, "id" | "createdAt"> {
  const name = String(form.get("name") ?? "").trim();
  const image =
    String(form.get("image") ?? "").trim() ||
    `https://picsum.photos/seed/${slugify(name) || "product"}-1/800/800`;
  const compareAt = euroToCents(form.get("compareAtPrice"));
  return {
    slug: String(form.get("slug") ?? "").trim() || slugify(name),
    name,
    description: String(form.get("description") ?? "").trim(),
    price: euroToCents(form.get("price")),
    compareAtPrice: compareAt > 0 ? compareAt : null,
    image,
    gallery: [image],
    category: String(form.get("category") ?? "Accessoires"),
    stock: parseInt(String(form.get("stock") ?? "0"), 10) || 0,
    supplier: String(form.get("supplier") ?? "").trim(),
    rating: parseFloat(String(form.get("rating") ?? "4.5")) || 4.5,
    reviews: parseInt(String(form.get("reviews") ?? "0"), 10) || 0,
    featured: form.get("featured") ? 1 : 0,
  };
}

export async function createProductAction(form: FormData) {
  const data = buildProductFromForm(form);
  if (!data.name || !data.price) return;
  createProduct(data);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProductAction(form: FormData) {
  const id = parseInt(String(form.get("id") ?? "0"), 10);
  if (!id) return;
  const data = buildProductFromForm(form);
  updateProduct(id, data);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${data.slug}`);
  redirect("/admin/products");
}

export async function deleteProductAction(form: FormData) {
  const id = parseInt(String(form.get("id") ?? "0"), 10);
  if (!id) return;
  deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateOrderStatusAction(form: FormData) {
  const reference = String(form.get("reference") ?? "");
  const status = String(form.get("status") ?? "") as OrderStatus;
  if (!reference || !status) return;
  updateOrderStatus(reference, status);
  revalidatePath("/admin/orders");
}
