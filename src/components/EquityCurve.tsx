import { useEffect, useRef, useState } from "react";

export type EquityPoint = { label: string; value: number };

/**
 * Dark-tech equity curve. Draws the line left-to-right when scrolled into view.
 * Pure presentation — values are passed in from real backtest data.
 */
export function EquityCurve({
  points,
  height = 220,
}: {
  points: EquityPoint[];
  height?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const gradId = useRef(`eq-${Math.random().toString(36).slice(2, 9)}`).current;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const W = 1000;
  const H = 320;
  const padX = 8;
  const padY = 24;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padX + (i / Math.max(points.length - 1, 1)) * (W - padX * 2);
    const y = padY + (1 - (p.value - min) / span) * (H - padY * 2);
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1]?.[0].toFixed(1)},${H} L${coords[0]?.[0].toFixed(1)},${H} Z`;

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-background/50">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="relative block w-full"
        style={{ height }}
        role="img"
        aria-label="历史回测资金曲线"
      >
        <defs>
          <linearGradient id={`${gradId}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.70 0.14 250)" />
            <stop offset="55%" stopColor="oklch(0.72 0.17 275)" />
            <stop offset="100%" stopColor="oklch(0.80 0.13 290)" />
          </linearGradient>
          <linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.18 270 / 0.35)" />
            <stop offset="100%" stopColor="oklch(0.65 0.18 270 / 0)" />
          </linearGradient>
        </defs>

        <path
          d={area}
          fill={`url(#${gradId}-fill)`}
          style={{ opacity: visible ? 1 : 0, transition: "opacity 900ms ease 700ms" }}
        />
        <path
          d={line}
          fill="none"
          stroke={`url(#${gradId}-stroke)`}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{
            filter: "drop-shadow(0 0 10px oklch(0.65 0.18 270 / 0.55))",
            strokeDasharray: 4000,
            strokeDashoffset: visible ? 0 : 4000,
            transition: "stroke-dashoffset 1800ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>

      <div className="flex justify-between gap-1 border-t border-border/50 px-3 py-2 text-[10px] font-sans text-muted-foreground">
        {points.map((p) => (
          <span key={p.label} className="truncate">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
