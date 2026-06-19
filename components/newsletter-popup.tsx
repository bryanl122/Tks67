"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("ecladecire-news") === "1") return;
    const t = setTimeout(() => setShow(true), 9000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("ecladecire-news", "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-0 bg-cacao/50 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-[71] w-[90%] max-w-[440px] -translate-x-1/2 -translate-y-1/2 bg-cire rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-float)]"
            initial={{ opacity: 0, scale: 0.92, y: "-46%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.92 }}
          >
            <button onClick={dismiss} aria-label="Fermer" className="absolute top-4 right-4 text-cacao/60 hover:text-cacao z-10">
              <X size={20} />
            </button>
            <div className="h-28 bg-gradient-to-br from-eclat-light to-eclat" />
            <div className="p-8 text-center">
              {done ? (
                <>
                  <p className="script text-3xl text-eclat mb-2">merci !</p>
                  <p className="text-muted text-sm">
                    Votre code de bienvenue arrive dans votre boîte mail. À très vite ✨
                  </p>
                </>
              ) : (
                <>
                  <p className="script text-3xl mb-1">restons en lumière</p>
                  <h3 className="text-2xl mb-2">-10% sur votre 1ère commande</h3>
                  <p className="text-muted text-sm mb-5">
                    Rejoignez la communauté ÉclaDeCire : nouveautés, éditions limitées et conseils d&apos;allumage.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setDone(true);
                      try {
                        localStorage.setItem("ecladecire-news", "1");
                      } catch {}
                      setTimeout(() => setShow(false), 2200);
                    }}
                    className="flex flex-col gap-2.5"
                  >
                    <input type="email" required placeholder="Votre adresse e-mail" className="field text-center" />
                    <button className="btn btn-primary w-full" type="submit">
                      Je profite de -10%
                    </button>
                  </form>
                  <button onClick={dismiss} className="text-[11px] text-muted mt-3 underline">
                    Non merci, je paie plein tarif
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
