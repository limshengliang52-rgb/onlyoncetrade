import { Info, AlertTriangle } from "lucide-react";

type PlatformNoticeProps = {
  variant?: "default" | "compact" | "banner";
};

export function PlatformNotice({ variant = "default" }: PlatformNoticeProps) {
  if (variant === "banner") {
    return (
      <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 shadow-[0_0_20px_-8px_rgba(212,163,66,0.35)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/20 text-gold">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">平台使用提醒</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              OnlyOnce EA 策略基于 <span className="font-semibold text-gold">Vantage</span> 平台优化，强烈建议使用{" "}
              <span className="font-semibold text-gold">Vantage MT5 账户</span> 运行本 EA。
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              使用其他平台可能因点差、滑点、服务器时间差异导致回测与实盘结果不同。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="rounded-lg border border-gold/35 bg-gold/[0.08] p-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gold/15 text-gold">
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs leading-snug text-foreground/90">
            <span className="font-semibold text-foreground">注意事项：</span>
            OnlyOnce EA 策略基于 <span className="font-semibold text-gold">Vantage</span> 平台优化，强烈建议使用{" "}
            <span className="font-semibold text-gold">Vantage MT5 账户</span>。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/60 p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
          <Info className="h-4 w-4" />
        </span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground">平台使用提醒</h4>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                OnlyOnce EA 策略基于 <span className="text-foreground">Vantage</span> 平台优化，强烈建议使用{" "}
                <span className="text-foreground">Vantage MT5 账户</span> 运行本 EA。
              </p>
              <p>
                如果使用其他交易商平台，可能因为点差、报价、滑点、合约规格、服务器时间不同，导致回测与实盘结果出现差异。非 Vantage 平台使用产生的结果差异或风险，由用户自行承担。
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}

