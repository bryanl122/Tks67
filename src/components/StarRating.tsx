export function StarRating({
  rating,
  reviews,
  size = "sm",
}: {
  rating: number;
  reviews?: number;
  size?: "sm" | "md";
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return "full";
    if (i === full && half) return "half";
    return "empty";
  });
  const textSize = size === "md" ? "text-base" : "text-sm";

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex ${textSize} leading-none`} aria-label={`${rating} sur 5`}>
        {stars.map((s, i) => (
          <span key={i} className="text-amber-400">
            {s === "full" ? "★" : s === "half" ? "⯨" : <span className="text-slate-300">★</span>}
          </span>
        ))}
      </div>
      <span className="text-xs text-slate-500">
        {rating.toFixed(1)}
        {reviews !== undefined && ` (${reviews})`}
      </span>
    </div>
  );
}
