import { useEffect, useRef, useState } from "react";

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
  const [active, setActive] = useState<string | null>(SECTIONS[0].id);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (els.length === 0) return;

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const line = window.innerHeight * 0.25;
        let current: string | null = null;
        for (const el of els) {
          if (el.getBoundingClientRect().top <= line) current = el.id;
        }
        setActive(current ?? SECTIONS[0].id);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="页面区块导航"
      className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 md:block lg:right-8"
    >
      <ul className="pointer-events-auto flex flex-col items-end gap-3">
        {SECTIONS.map((s, i) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="group relative flex items-center justify-end">
              <span
                className={[
                  "absolute right-8 whitespace-nowrap text-[11px] font-medium tracking-wide transition-all duration-300 ease-out",
                  isActive
                    ? "translate-x-0 text-foreground/80 opacity-100"
                    : "translate-x-1.5 text-muted-foreground/80 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                ].join(" ")}
              >
                <span className="tabular-nums text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                <span className="mx-1.5 text-muted-foreground/40">·</span>
                {s.label}
              </span>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-label={s.label}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ease-out",
                  "hover:bg-white/5",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-2 w-2 rounded-full border transition-all duration-300 ease-out",
                    isActive
                      ? "border-indigo-300/70 bg-gold/80"
                      : "border-muted-foreground/35 bg-transparent group-hover:border-indigo-200/60 group-hover:bg-white/10",
                  ].join(" ")}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

