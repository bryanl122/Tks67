import Link from "next/link";
import Image from "next/image";
import { Truck, Sparkles, ShieldCheck, RefreshCw } from "lucide-react";
import { products, getBestSellers } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { NewsletterInline } from "@/components/newsletter-inline";

const ASSUR = [
  { icon: Truck, title: "Livraison offerte", sub: "Dès 60€ d'achat" },
  { icon: Sparkles, title: "Fait main", sub: "Coulé en France" },
  { icon: ShieldCheck, title: "Paiement sécurisé", sub: "Stripe · PayPal · Pay" },
  { icon: RefreshCw, title: "Retours 30 jours", sub: "Satisfait ou remboursé" },
];

const COLLECTIONS = [
  { title: "Florales & Poudrées", count: "4 senteurs", href: "/boutique?famille=Florale", cls: "from-[#D6B9A6] to-[#A56C53]" },
  { title: "Végétales & Fraîches", count: "3 senteurs", href: "/boutique?famille=Végétale", cls: "from-[#A9B093] to-[#717a5b]" },
  { title: "Gourmandes & Formes", count: "3 créations", href: "/boutique?famille=Gourmande", cls: "from-[#C9B68F] to-[#9E7E4F]" },
];

const REVIEWS = [
  { text: "Une odeur incroyable qui embaume toute la pièce sans être entêtante. On sent vraiment l'artisanat.", name: "Camille R.", product: "Pétale de Rose" },
  { text: "Offerte à ma mère, elle a adoré. L'emballage est digne d'une grande maison, la combustion impeccable.", name: "Sophie L.", product: "Coffret Bouquet de Roses" },
  { text: "Enfin une bougie artisanale qui tient ses promesses. Cire végétale, parfum subtil. Je suis fidèle !", name: "Marie D.", product: "Jardin de Sauge" },
];

const FAQ = [
  { q: "Quelle est la durée de combustion ?", a: "Selon le format, nos bougies offrent de 16 à 32 heures de combustion. Pour un résultat optimal, laissez fondre la cire sur toute la surface dès le premier allumage." },
  { q: "Vos bougies sont-elles naturelles ?", a: "Oui. Nous utilisons exclusivement une cire 100% végétale, une mèche en coton naturel sans plomb et des fragrances sans CMR. Aucune paraffine." },
  { q: "Quels sont les délais de livraison ?", a: "Expédition sous 48h. Livraison en 2 à 4 jours ouvrés en France, offerte dès 60€ d'achat, avec suivi par e-mail." },
  { q: "Proposez-vous des coffrets cadeaux ?", a: "Bien sûr. Nos coffrets sont présentés dans un écrin signé ÉclaDeCire avec une carte personnalisable et un emballage cadeau offert." },
];

export default function HomePage() {
  const bestSellers = getBestSellers();
  const newest = products.filter((p) => p.isNew || p.badge === "Nouveauté");

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-[radial-gradient(120%_90%_at_78%_20%,rgba(217,196,160,0.45),transparent_55%),linear-gradient(160deg,var(--color-cire-rose),var(--color-cire)_60%)]">
        <div className="container-lux grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center py-16">
          <Reveal>
            <p className="script text-3xl md:text-4xl mb-1">faites avec passion</p>
            <h1 className="text-5xl md:text-6xl lg:text-[66px] leading-[1.05]">
              L&apos;éclat d&apos;une
              <br />
              flamme artisanale
            </h1>
            <p className="text-lg text-muted max-w-[52ch] mt-5 mb-8">
              Des bougies coulées à la main en cire végétale, sculptées et parfumées une à une.
              Chaque mèche raconte un savoir-faire, chaque éclat une émotion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/boutique" className="btn btn-primary">
                Découvrir la collection
              </Link>
              <Link href="/a-propos" className="btn btn-ghost">
                Notre histoire
              </Link>
            </div>
            <div className="flex flex-wrap gap-10 mt-12 pt-6 border-t border-line">
              {[
                ["100%", "Cire végétale"],
                ["Fait", "Main en France"],
                ["4.9/5", "+1 200 avis"],
              ].map(([b, s]) => (
                <div key={s}>
                  <b className="block font-serif text-3xl text-cacao">{b}</b>
                  <small className="text-[11px] tracking-[0.16em] uppercase text-muted">{s}</small>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative aspect-[4/5] max-w-[440px] mx-auto rounded-t-[200px] rounded-b-2xl overflow-hidden shadow-[var(--shadow-float)]">
              <Image
                src="/products/petale-de-rose.jpg"
                alt="Bougie artisanale Pétale de Rose"
                fill
                priority
                sizes="(max-width:1024px) 90vw, 440px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* RÉASSURANCE */}
      <section className="bg-cacao text-cire">
        <div className="container-lux grid grid-cols-2 md:grid-cols-4 gap-7 py-7 text-center">
          {ASSUR.map((a) => (
            <div key={a.title} className="flex flex-col items-center gap-2">
              <a.icon size={26} strokeWidth={1.5} className="text-eclat-light" />
              <b className="text-[12.5px] tracking-[0.1em] uppercase font-medium">{a.title}</b>
              <small className="text-[11.5px] text-cire/60">{a.sub}</small>
            </div>
          ))}
        </div>
      </section>

      {/* BEST-SELLERS */}
      <section className="container-lux py-24">
        <Reveal className="max-w-[60ch] mx-auto text-center mb-14">
          <span className="eyebrow block mb-3">Les préférées</span>
          <h2 className="text-3xl md:text-4xl">Nos best-sellers</h2>
          <div className="divider-lux my-4" />
          <p className="text-muted">Les créations qui ont conquis nos clients — coulées en petites séries.</p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/boutique" className="btn btn-ghost">
            Voir toute la boutique
          </Link>
        </div>
      </section>

      {/* RÉCIT */}
      <section className="bg-cire-rose py-24">
        <div className="container-lux grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-card)]">
              <Image src="/products/edition-love.jpg" alt="L'atelier ÉclaDeCire" fill sizes="(max-width:1024px) 90vw, 560px" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow">Notre savoir-faire</span>
            <h2 className="text-3xl md:text-4xl mt-3">Chaque bougie naît d&apos;un geste, d&apos;une patience, d&apos;une passion</h2>
            <p className="text-muted my-4">
              Dans notre atelier, nous coulons et moulons chaque bougie à la main, en petites séries, à partir
              d&apos;une cire 100% végétale et d&apos;une mèche en coton naturel. Pas de paraffine, pas de
              raccourci — seulement le temps qu&apos;il faut pour faire naître une flamme parfaite.
            </p>
            <p className="text-muted mb-4">
              Verrines colorées, cœurs, roses, sculptures… nous donnons à la cire mille formes pour révéler
              <em> l&apos;éclat</em> d&apos;un véritable savoir-faire artisanal.
            </p>
            <p className="script text-3xl mb-5">L&apos;équipe ÉclaDeCire</p>
            <Link href="/a-propos" className="btn btn-ghost">
              Découvrir l&apos;atelier
            </Link>
          </Reveal>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="container-lux py-24">
        <Reveal className="text-center mb-14">
          <span className="eyebrow block mb-3">Par famille olfactive</span>
          <h2 className="text-3xl md:text-4xl">Explorez nos univers</h2>
          <div className="divider-lux my-4" />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Link
                href={c.href}
                className={`group relative block aspect-[3/4] rounded-[var(--radius-lg)] overflow-hidden p-7 flex items-end text-cire bg-gradient-to-b ${c.cls}`}
              >
                <span className="absolute inset-0 bg-gradient-to-t from-cacao/70 to-transparent" />
                <span className="relative z-10">
                  <span className="eyebrow text-eclat-light">{c.count}</span>
                  <h3 className="text-cire text-[26px] mt-1.5 mb-1">{c.title}</h3>
                  <small className="opacity-85 text-[13px]">Découvrir →</small>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* NOUVEAUTÉS */}
      {newest.length > 0 && (
        <section className="container-lux pb-24">
          <Reveal className="text-center mb-14">
            <span className="eyebrow block mb-3">Tout juste coulées</span>
            <h2 className="text-3xl md:text-4xl">Nos nouveautés</h2>
            <div className="divider-lux my-4" />
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(5, 9).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* AVIS */}
      <section className="bg-cacao text-cire py-24">
        <div className="container-lux">
          <Reveal className="text-center mb-14">
            <span className="eyebrow text-eclat-light block mb-3">Ils nous font confiance</span>
            <h2 className="text-cire text-3xl md:text-4xl">4,9/5 · plus de 1 200 avis vérifiés</h2>
            <div className="divider-lux my-4" />
          </Reveal>
          <div className="grid md:grid-cols-3 gap-7">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.08}>
                <div className="bg-cacao-soft border border-eclat/25 rounded-[var(--radius-lg)] p-8 h-full">
                  <div className="stars mb-3.5">★★★★★</div>
                  <p className="font-serif italic text-lg text-cire leading-snug">« {r.text} »</p>
                  <div className="flex items-center gap-3 mt-4.5 mt-[18px]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eclat-light to-eclat-dark" />
                    <div>
                      <b className="font-sans text-[13px] font-medium">{r.name}</b>
                      <small className="block text-[11px] text-cire/55">Achat vérifié · {r.product}</small>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container-lux py-24">
        <Reveal className="text-center mb-14">
          <span className="eyebrow block mb-3">@ecladecire</span>
          <h2 className="text-3xl md:text-4xl">Rejoignez la communauté</h2>
          <div className="divider-lux my-4" />
          <p className="text-muted">
            Partagez vos instants lumière avec <strong>#ecladecire</strong>
          </p>
        </Reveal>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {products.slice(0, 6).map((p) => (
            <a
              key={p.slug}
              href="https://www.instagram.com/ecladecire"
              className="group relative aspect-square rounded-[var(--radius)] overflow-hidden"
            >
              <Image src={p.image} alt={p.name} fill sizes="(max-width:768px) 33vw, 16vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute inset-0 bg-cacao/0 group-hover:bg-cacao/30 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 text-center bg-[radial-gradient(100%_120%_at_50%_0,rgba(217,196,160,0.5),transparent_60%),var(--color-cire-rose)]">
        <div className="container-lux">
          <p className="script text-3xl md:text-4xl">restons en lumière</p>
          <h2 className="text-3xl md:text-4xl mt-2">-10% sur votre première commande</h2>
          <p className="text-muted max-w-[50ch] mx-auto mt-3.5">
            Inscrivez-vous pour recevoir nos nouveautés, éditions limitées et conseils d&apos;allumage.
          </p>
          <NewsletterInline />
          <small className="text-muted text-xs">
            En vous inscrivant, vous acceptez notre politique de confidentialité.
          </small>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-lux py-24">
        <Reveal className="text-center mb-12">
          <span className="eyebrow block mb-3">Questions fréquentes</span>
          <h2 className="text-3xl md:text-4xl">Tout savoir avant d&apos;allumer</h2>
          <div className="divider-lux my-4" />
        </Reveal>
        <div className="max-w-[760px] mx-auto">
          {FAQ.map((f, i) => (
            <details key={f.q} className="border-b border-line group" open={i === 0}>
              <summary className="flex justify-between items-center gap-5 cursor-pointer py-6 font-serif text-lg text-cacao">
                {f.q}
                <span className="text-eclat text-2xl font-sans transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-muted pb-6 max-w-[64ch]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
