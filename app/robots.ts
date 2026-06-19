import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/panier", "/compte"] },
    sitemap: "https://www.ecladecire.fr/sitemap.xml",
  };
}
