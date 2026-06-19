import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, HandHeart, Recycle, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Notre atelier — L'histoire d'ÉclaDeCire",
  description:
    "Découvrez l'histoire d'ÉclaDeCire : des bougies artisanales coulées à la main en cire végétale, faites avec passion. Notre savoir-faire, nos engagements.",
  alternates: { canonical: "/a-propos" },
};

const VALUES = [
  { icon: Leaf, title: "100% végétal", text: "Cire de soja et de colza, mèches en coton naturel, fragrances sans CMR." },
  { icon: HandHeart, title: "Fait main", text: "Chaque pièce est coulée, moulée et contrôlée à la main, en petites séries." },
  { icon: Recycle, title: "Éco-responsable", text: "Contenants réutilisables, recharges disponibles, emballages recyclés." },
  { icon: Sparkles, title: "Parfums d'exception", text: "Des compositions olfactives travaillées pour un sillage subtil et durable." },
];

export default function AProposPage() {
  return (
    <>
      <section className="relative min-h-[60vh] flex items-center bg-[linear-gradient(160deg,var(--color-cire-rose),var(--color-cire))]">
        <div className="container-lux py-20 text-center max-w-[760px] mx-auto">
          <Reveal>
            <p className="script text-3xl md:text-4xl">faites avec passion</p>
            <h1 className="text-4xl md:text-6xl mt-2">L&apos;histoire d&apos;une flamme</h1>
            <div className="divider-lux my-5" />
            <p className="text-muted text-lg">
              ÉclaDeCire est née d&apos;une conviction simple : une bougie n&apos;est pas un objet, c&apos;est
              une émotion. Celle d&apos;une lumière douce, d&apos;un parfum qui apaise, d&apos;un geste fait avec
              le cœur.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-lux py-24 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="relative aspect-[4/5] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-card)]">
            <Image src="/products/bouquet-de-roses.jpg" alt="Créations ÉclaDeCire" fill sizes="(max-width:1024px) 90vw, 560px" className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <span className="eyebrow">Le geste artisanal</span>
          <h2 className="text-3xl md:text-4xl mt-3 mb-4">Du choix de la cire à la dernière mèche</h2>
          <p className="text-muted mb-4">
            Tout commence dans notre atelier, où nous sélectionnons une cire 100% végétale, fondue à juste
            température pour préserver la pureté du parfum. Nous coulons les verrines, moulons les cœurs, les
            roses et les sculptures, puis laissons chaque pièce reposer le temps qu&apos;il faut.
          </p>
          <p className="text-muted mb-4">
            Rien n&apos;est industriel : les variations de teinte et de matière sont la signature du fait main.
            Chaque bougie est unique, comme l&apos;instant qu&apos;elle accompagnera.
          </p>
          <p className="script text-3xl">je brûle pour toi</p>
        </Reveal>
      </section>

      <section className="bg-cire-rose py-24">
        <div className="container-lux">
          <Reveal className="text-center mb-14">
            <span className="eyebrow block mb-3">Nos engagements</span>
            <h2 className="text-3xl md:text-4xl">Ce en quoi nous croyons</h2>
            <div className="divider-lux my-4" />
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="bg-cire rounded-[var(--radius-lg)] p-8 text-center h-full border border-line">
                  <v.icon size={32} className="text-eclat-dark mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="font-serif text-xl mb-2">{v.title}</h3>
                  <p className="text-muted text-sm">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-lux py-24 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl mb-5">Prêt·e à faire entrer la lumière ?</h2>
          <Link href="/boutique" className="btn btn-primary">
            Découvrir nos bougies
          </Link>
        </Reveal>
      </section>
    </>
  );
}
