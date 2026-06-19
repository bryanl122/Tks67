import Link from "next/link";
import { Instagram, Heart } from "lucide-react";

const COLS = [
  {
    title: "Boutique",
    links: [
      ["Toutes les bougies", "/boutique"],
      ["Best-sellers", "/boutique?tri=populaire"],
      ["Nouveautés", "/boutique?tri=nouveaute"],
      ["Coffrets cadeaux", "/boutique"],
      ["Cartes cadeaux", "/boutique"],
    ],
  },
  {
    title: "La maison",
    links: [
      ["Notre histoire", "/a-propos"],
      ["L'atelier", "/a-propos"],
      ["Nos engagements", "/a-propos"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Aide",
    links: [
      ["FAQ", "/contact"],
      ["Livraison", "/contact"],
      ["Retours & échanges", "/contact"],
      ["Programme fidélité", "/compte"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-cacao text-cire/70 pt-24 pb-6 mt-0">
      <div className="container-lux">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 pb-12 border-b border-eclat/20">
          <div className="col-span-2 md:col-span-1">
            <b className="font-serif text-cire text-2xl block mb-3.5">ecladecire</b>
            <p className="max-w-[34ch] text-sm">
              Bougies artisanales coulées à la main, faites avec passion. L&apos;éclat d&apos;un
              savoir-faire d&apos;exception.
            </p>
            <p className="script text-eclat-light text-2xl mt-4">je brûle pour toi</p>
            <div className="flex gap-3.5 mt-5">
              <a
                href="https://www.instagram.com/ecladecire"
                aria-label="Instagram"
                className="w-[38px] h-[38px] border border-eclat/35 rounded-full grid place-items-center text-eclat-light hover:bg-eclat hover:text-cacao transition-colors"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-cire font-sans text-xs font-medium uppercase tracking-[0.18em] mb-[18px]">
                {col.title}
              </h4>
              {col.links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="block text-sm py-1.5 hover:text-eclat-light hover:pl-1 transition-all"
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3.5 pt-6 text-[12.5px]">
          <span className="flex items-center gap-2">
            © 2026 ÉclaDeCire · Fait avec <Heart size={12} className="text-eclat" /> en France · Mentions
            légales · CGV · Confidentialité
          </span>
          <div className="flex gap-2">
            {["VISA", "MASTERCARD", "PAYPAL", "APPLE PAY", "G PAY"].map((p) => (
              <span
                key={p}
                className="border border-eclat/30 rounded px-2.5 py-1 text-[10px] tracking-[0.1em] text-cire/60"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
