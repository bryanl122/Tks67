"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "./cart-context";

const NAV = [
  { label: "Boutique", href: "/boutique" },
  { label: "Best-sellers", href: "/boutique?tri=populaire" },
  { label: "Coffrets", href: "/boutique?famille=Coffret" },
  { label: "Notre atelier", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-cacao text-cire text-center text-[11.5px] tracking-[0.18em] uppercase py-[9px] px-3">
        Livraison offerte dès 60€ · Coulées à la main en France ·{" "}
        <span className="text-eclat-light">-10% sur votre 1ère commande</span>
      </div>

      <div
        className={`transition-colors duration-300 border-b border-line ${
          scrolled ? "bg-cire/90 backdrop-blur-md" : "bg-cire/70 backdrop-blur"
        }`}
      >
        <div className="container-lux flex items-center justify-between h-[74px]">
          <button
            className="md:hidden text-cacao"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="ÉclaDeCire"
              width={46}
              height={46}
              className="rounded-full shadow-[var(--shadow-soft)]"
            />
            <b className="font-serif font-semibold text-[22px] text-cacao tracking-[0.01em]">
              ecladecire
            </b>
          </Link>

          <nav className="hidden md:flex gap-8">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[13px] tracking-[0.05em] text-cacao-soft hover:text-cacao relative py-1.5 after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-eclat after:transition-all hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5 text-cacao">
            <button aria-label="Recherche" className="hover:text-eclat-dark transition-colors">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link href="/compte" aria-label="Compte" className="hover:text-eclat-dark transition-colors hidden sm:block">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <button onClick={open} aria-label="Panier" className="relative hover:text-eclat-dark transition-colors">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-eclat text-cacao text-[9px] font-semibold w-4 h-4 rounded-full grid place-items-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-line bg-cire">
            <div className="container-lux py-2 flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-[15px] text-cacao border-b border-line/60 last:border-0"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
