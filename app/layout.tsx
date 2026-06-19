import type { Metadata } from "next";
import { Fraunces, Jost, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { NewsletterPopup } from "@/components/newsletter-popup";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon",
  display: "swap",
});

const siteUrl = "https://www.ecladecire.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ÉclaDeCire — Bougies artisanales, faites avec passion",
    template: "%s | ÉclaDeCire",
  },
  description:
    "ÉclaDeCire — bougies artisanales haut de gamme, coulées à la main en cire végétale. L'éclat d'un savoir-faire d'exception.",
  keywords: ["bougie artisanale", "bougie cire végétale", "bougie parfumée", "cadeau", "fait main", "ÉclaDeCire"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "ÉclaDeCire",
    title: "ÉclaDeCire — Bougies artisanales, faites avec passion",
    description:
      "Bougies artisanales coulées à la main en cire végétale. L'éclat d'un savoir-faire d'exception.",
    images: [{ url: "/logo.jpg", width: 1254, height: 1254, alt: "ÉclaDeCire" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ÉclaDeCire — Bougies artisanales",
    description: "Bougies artisanales coulées à la main en cire végétale.",
    images: ["/logo.jpg"],
  },
  icons: { icon: "/logo.jpg" },
  alternates: { canonical: siteUrl },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "ÉclaDeCire",
  description: "Bougies artisanales coulées à la main en cire végétale.",
  url: siteUrl,
  logo: `${siteUrl}/logo.jpg`,
  sameAs: ["https://www.instagram.com/ecladecire"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${jost.variable} ${pinyon.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <NewsletterPopup />
        </CartProvider>
      </body>
    </html>
  );
}
