type PlatformNoticeProps = {
  variant?: "default" | "compact" | "banner";
};

export function PlatformNotice({ variant = "default" }: PlatformNoticeProps) {
  if (variant === "banner") {
    return (
      <div className="rounded-xl border border-border/60 bg-surface/40 p-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-semibold text-foreground">平台使用提醒</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            OnlyOnce EA 策略基于 <span className="text-foreground">Vantage</span> 平台优化，建议优先使用{" "}
            <span className="text-foreground">Vantage MT5 账户</span> 运行本 EA。
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/80">
            使用其他平台可能因点差、滑点、服务器时间差异导致回测与实盘结果不同。
          </p>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="rounded-lg border border-border/60 bg-surface/30 p-3">
        <p className="text-xs leading-snug text-muted-foreground">
          <span className="font-medium text-foreground">注意事项：</span>
          OnlyOnce EA 策略基于 <span className="text-foreground">Vantage</span> 平台优化，建议优先使用{" "}
          <span className="text-foreground">Vantage MT5 账户</span>。
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/60 p-5 md:p-6">
      <div>
        <h4 className="text-sm font-semibold text-foreground">平台使用提醒</h4>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            OnlyOnce EA 策略基于 <span className="text-foreground">Vantage</span> 平台优化，建议优先使用{" "}
            <span className="text-foreground">Vantage MT5 账户</span> 运行本 EA。
          </p>
          <p>
            如果使用其他交易商平台，可能因为点差、报价、滑点、合约规格、服务器时间不同，导致回测与实盘结果出现差异。非 Vantage 平台使用产生的结果差异或风险，由用户自行承担。
          </p>
        </div>
      </div>
    </div>
  );
}
