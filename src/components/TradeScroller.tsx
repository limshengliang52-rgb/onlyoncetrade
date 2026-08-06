export type TradeShot = { src: string; symbol: string; roi: string; date: string };

/**
 * Vertical CSS marquee for trade-record screenshots.
 * Duplicates the list for a seamless loop, scrolls continuously via CSS,
 * and pauses on hover. No JavaScript-driven switching.
 */
export function TradeScroller({
  items,
  duration = 32000,
}: {
  items: TradeShot[];
  duration?: number;
}) {
  const loopItems = [...items, ...items];

  if (items.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background/50 p-3 sm:p-4">
      <style>{`
        @keyframes trade-marquee {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />

      <div className="group relative h-[300px] overflow-hidden rounded-xl border border-primary/20 bg-surface/40 sm:h-[380px]">
        <div
          className="flex flex-col items-center gap-4 group-hover:[animation-play-state:paused]"
          style={{
            animation: `trade-marquee ${duration}ms linear infinite`,
          }}
        >
          {loopItems.map((r, i) => (
            <div
              key={i}
              className="h-[88%] w-full shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-surface/40"
            >
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
    </div>
  );
}
