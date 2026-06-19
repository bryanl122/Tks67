import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const base = "https://www.ecladecire.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/boutique", "/a-propos", "/contact", "/panier"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${base}/produit/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...productRoutes];
}
