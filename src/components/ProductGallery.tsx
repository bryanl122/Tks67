"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const list = images.length ? images : [];
  const [active, setActive] = useState(list[0]);

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={active} alt={alt} className="h-full w-full object-cover" />
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {list.map((src) => (
            <button
              key={src}
              onClick={() => setActive(src)}
              className={`aspect-square overflow-hidden rounded-lg border-2 bg-slate-100 transition ${
                active === src ? "border-brand-500" : "border-transparent hover:border-slate-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
