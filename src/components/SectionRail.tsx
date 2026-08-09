import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "strategy", label: "策略" },
  { id: "how", label: "开通流程" },
  { id: "features", label: "功能" },
  { id: "pricing", label: "订阅方案" },
  { id: "backtest", label: "回测数据" },
  { id: "live-trade-records", label: "会员战绩" },
  { id: "risk", label: "风险说明" },
];

export function SectionRail() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (els.length === 0) return;

    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="页面区块导航"
      className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 md:block lg:right-6"
    >
      <ul className="pointer-events-auto flex flex-col items-end gap-5">
        {SECTIONS.map((s, i) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="group flex items-center justify-end gap-3">
              <span
                className={[
                  "whitespace-nowrap text-[11px] font-medium tracking-wide transition-all duration-300",
                  isActive
                    ? "text-foreground/80 opacity-100"
                    : "translate-x-1 text-muted-foreground/70 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                ].join(" ")}
              >
                <span className="tabular-nums text-gold/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mx-1.5 text-muted-foreground/40">·</span>
                {s.label}
              </span>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-label={s.label}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "h-2 w-2 rounded-full border transition-all duration-300",
                  isActive
                    ? "scale-125 border-gold/70 bg-gold/80"
                    : "border-muted-foreground/40 bg-transparent hover:border-foreground/60",
                ].join(" ")}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
