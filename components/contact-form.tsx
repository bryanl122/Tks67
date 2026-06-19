"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <div className="bg-cire-rose rounded-[var(--radius-lg)] p-10 text-center">
        <p className="script text-4xl text-eclat mb-2">merci !</p>
        <p className="text-muted">Votre message a bien été envoyé. Nous vous répondrons sous 24h ouvrées.</p>
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Prénom" className="field" />
        <input required placeholder="Nom" className="field" />
      </div>
      <input required type="email" placeholder="Adresse e-mail" className="field" />
      <input placeholder="Sujet" className="field" />
      <textarea required placeholder="Votre message" rows={6} className="field resize-none" />
      <button type="submit" className="btn btn-primary self-start">
        Envoyer le message
      </button>
    </form>
  );
}
