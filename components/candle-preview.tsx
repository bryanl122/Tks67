"use client";

import { useId } from "react";
import type { CandleShape } from "@/lib/customization";

/* ---- helpers couleur (éclaircir / assombrir un hex) ---- */
function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function shade(hex: string, amount: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const f = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const mix = (c: number) => clamp(c + (f - c) * t);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function CandlePreview({
  color,
  shape = "jar",
  className,
}: {
  color: string;
  shape?: CandleShape;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const light = shade(color, 0.22);
  const dark = shade(color, -0.2);
  const waxGrad = `wax-${id}`;
  const flameGrad = `flame-${id}`;

  return (
    <svg
      viewBox="0 0 320 360"
      className={className}
      role="img"
      aria-label="Aperçu personnalisé de la bougie"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={waxGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <radialGradient id={flameGrad} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF7E0" />
          <stop offset="45%" stopColor="#FFD27A" />
          <stop offset="100%" stopColor="#E8973C" />
        </radialGradient>
        <radialGradient id={`halo-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE6A8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFE6A8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* halo de lumière */}
      <ellipse cx="160" cy="120" rx="120" ry="120" fill={`url(#halo-${id})`} className="candle-glow" />

      {/* flamme (commune à toutes les formes) */}
      <FlameAndWick shape={shape} flameGrad={flameGrad} />

      {shape === "jar" && <Jar waxGrad={waxGrad} light={light} />}
      {shape === "heart" && <HeartShape waxGrad={waxGrad} light={light} />}
      {shape === "cube" && <CubeShape waxGrad={waxGrad} color={color} light={light} />}
      {shape === "pillar" && <PillarShape waxGrad={waxGrad} light={light} />}

      {/* reflet sol */}
      <ellipse cx="160" cy="334" rx="92" ry="12" fill="rgba(62,47,35,0.10)" />
    </svg>
  );
}

function FlameAndWick({ shape, flameGrad }: { shape: CandleShape; flameGrad: string }) {
  const topY = shape === "heart" ? 150 : shape === "pillar" ? 120 : shape === "cube" ? 150 : 150;
  const wickBottom = shape === "heart" ? 178 : shape === "pillar" ? 150 : shape === "cube" ? 178 : 176;
  return (
    <g className="candle-flame" style={{ transformOrigin: `160px ${wickBottom}px` }}>
      <path
        d={`M160 ${topY - 34} C 176 ${topY - 14}, 174 ${topY + 6}, 160 ${topY + 10} C 146 ${topY + 6}, 144 ${topY - 14}, 160 ${topY - 34} Z`}
        fill={`url(#${flameGrad})`}
      />
      <path
        d={`M160 ${topY - 16} C 168 ${topY - 6}, 167 ${topY + 4}, 160 ${topY + 7} C 153 ${topY + 4}, 152 ${topY - 6}, 160 ${topY - 16} Z`}
        fill="#FFF3D0"
        opacity="0.9"
      />
      <line x1="160" y1={topY + 8} x2="160" y2={wickBottom} stroke="#5A4636" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function Jar({ waxGrad, light }: { waxGrad: string; light: string }) {
  return (
    <g>
      {/* verre */}
      <rect x="86" y="176" width="148" height="140" rx="18" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      {/* cire */}
      <rect x="94" y="190" width="132" height="120" rx="12" fill={`url(#${waxGrad})`} />
      {/* bain de fonte */}
      <ellipse cx="160" cy="194" rx="64" ry="10" fill={light} opacity="0.85" />
      {/* reflet verre */}
      <rect x="98" y="200" width="10" height="96" rx="5" fill="rgba(255,255,255,0.35)" />
    </g>
  );
}

function HeartShape({ waxGrad, light }: { waxGrad: string; light: string }) {
  const heart =
    "M160 300 C 96 252, 70 214, 70 184 C 70 156, 92 138, 116 138 C 138 138, 152 152, 160 168 C 168 152, 182 138, 204 138 C 228 138, 250 156, 250 184 C 250 214, 224 252, 160 300 Z";
  return (
    <g>
      <path d={heart} fill={`url(#${waxGrad})`} />
      <path d={heart} fill="none" stroke={light} strokeOpacity="0.5" strokeWidth="2" />
      <ellipse cx="135" cy="172" rx="22" ry="14" fill="#fff" opacity="0.18" />
    </g>
  );
}

function CubeShape({ waxGrad, color, light }: { waxGrad: string; color: string; light: string }) {
  const dots = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      dots.push(
        <circle key={`${r}-${c}`} cx={108 + c * 26} cy={184 + r * 26} r="13" fill={(r + c) % 2 ? light : color} opacity="0.95" />,
      );
    }
  }
  return (
    <g>
      <rect x="92" y="168" width="136" height="136" rx="14" fill={`url(#${waxGrad})`} />
      <g style={{ clipPath: "inset(0 round 14px)" }}>{dots}</g>
      <rect x="92" y="168" width="136" height="136" rx="14" fill="none" stroke={light} strokeOpacity="0.4" strokeWidth="2" />
    </g>
  );
}

function PillarShape({ waxGrad, light }: { waxGrad: string; light: string }) {
  return (
    <g>
      <ellipse cx="160" cy="170" rx="58" ry="12" fill={light} />
      <rect x="102" y="170" width="116" height="146" fill={`url(#${waxGrad})`} />
      <ellipse cx="160" cy="316" rx="58" ry="12" fill={light} opacity="0.5" />
      <rect x="108" y="178" width="9" height="130" rx="4" fill="rgba(255,255,255,0.28)" />
    </g>
  );
}
