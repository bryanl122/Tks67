import type { Metadata } from "next";
import { Mail, MapPin, Instagram, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — Une question ? Écrivez-nous",
  description:
    "Contactez l'équipe ÉclaDeCire : service client, commandes, partenariats. Réponse sous 24h ouvrées. FAQ et réseaux sociaux.",
  alternates: { canonical: "/contact" },
};

const FAQ = [
  { q: "Où en est ma commande ?", a: "Un e-mail de suivi vous est envoyé dès l'expédition. Vous pouvez aussi consulter l'historique dans votre espace compte." },
  { q: "Puis-je personnaliser un coffret ?", a: "Oui, indiquez-le dans le champ message lors de la commande ou contactez-nous : nous adorons les demandes sur mesure." },
  { q: "Proposez-vous des ventes en gros / B2B ?", a: "Absolument. Pour les hôtels, boutiques et événements, écrivez-nous à pro@ecladecire.fr." },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-cire-rose py-16 text-center">
        <span className="eyebrow">Contact</span>
        <h1 className="text-4xl md:text-5xl mt-2.5">Une question ? Parlons-en</h1>
        <div className="divider-lux my-4" />
        <p className="text-muted max-w-[52ch] mx-auto">
          Notre équipe vous répond avec passion, sous 24h ouvrées.
        </p>
      </section>

      <section className="container-lux py-20 grid lg:grid-cols-[1fr_1.3fr] gap-14">
        <div>
          <h2 className="text-2xl mb-6">Nos coordonnées</h2>
          <ul className="flex flex-col gap-5">
            <li className="flex gap-4">
              <Mail className="text-eclat-dark shrink-0" strokeWidth={1.5} />
              <div>
                <b className="block font-sans text-sm">E-mail</b>
                <span className="text-muted text-sm">bonjour@ecladecire.fr</span>
              </div>
            </li>
            <li className="flex gap-4">
              <Instagram className="text-eclat-dark shrink-0" strokeWidth={1.5} />
              <div>
                <b className="block font-sans text-sm">Instagram</b>
                <a href="https://www.instagram.com/ecladecire" className="text-muted text-sm hover:text-eclat-dark">
                  @ecladecire
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Clock className="text-eclat-dark shrink-0" strokeWidth={1.5} />
              <div>
                <b className="block font-sans text-sm">Service client</b>
                <span className="text-muted text-sm">Lun. – Ven. · 9h – 18h</span>
              </div>
            </li>
            <li className="flex gap-4">
              <MapPin className="text-eclat-dark shrink-0" strokeWidth={1.5} />
              <div>
                <b className="block font-sans text-sm">Atelier</b>
                <span className="text-muted text-sm">France · expéditions dans toute l&apos;Europe</span>
              </div>
            </li>
          </ul>

          <h2 className="text-2xl mt-12 mb-6">Questions fréquentes</h2>
          <div>
            {FAQ.map((f, i) => (
              <details key={f.q} className="border-b border-line group" open={i === 0}>
                <summary className="flex justify-between items-center gap-4 cursor-pointer py-4 font-serif text-[17px]">
                  {f.q}
                  <span className="text-eclat text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="text-muted pb-4 text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl mb-6">Écrivez-nous</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
