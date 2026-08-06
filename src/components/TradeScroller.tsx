import { useEffect, useState } from "react";

export type TradeShot = { src: string; symbol: string; roi: string; date: string };

/**
 * Vertical auto-scrolling trade-record showcase.
 * Shows one screenshot at a time, sliding upward on a loop.
 * Fixed-height container so the page never jumps.
 */
export function TradeScroller({
  items,
  interval = 3500,
}: {
  items: TradeShot[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [items.length, interval]);

  const current = items[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background/50 p-3 sm:p-4">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />

      <div className="relative h-[300px] overflow-hidden rounded-xl border border-primary/20 bg-surface/40 sm:h-[380px]">
        <div
          className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateY(-${index * 100}%)` }}
        >
          {items.map((r, i) => (
            <div key={i} className="h-full w-full">
              <img
                src={r.src}
                alt={`会员 ${r.symbol} 交易战绩截图 ${r.roi}`}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-background/70 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/70 to-transparent" aria-hidden />
      </div>

      {current && (
        <div className="relative mt-3 flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {current.symbol}
            <span className="ml-2 font-sans text-xs text-primary">{current.roi}</span>
          </span>
          <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-sans text-primary">
            {current.date}
          </span>
        </div>
      )}

      <div className="relative mt-3 flex justify-center gap-1.5">
        {items.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-5 bg-primary" : "w-1.5 bg-primary/30"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
