"use client";

import { useState } from "react";

export function NewsletterInline() {
  const [done, setDone] = useState(false);
  return done ? (
    <p className="script text-3xl text-eclat mt-6">merci, à très vite ✨</p>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="flex flex-col sm:flex-row gap-2.5 max-w-[480px] mx-auto mt-6"
    >
      <input type="email" required placeholder="Votre adresse e-mail" className="field flex-1" />
      <button type="submit" className="btn btn-primary">
        Je m&apos;inscris
      </button>
    </form>
  );
}
