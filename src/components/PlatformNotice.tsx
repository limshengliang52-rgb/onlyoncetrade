import { Info } from "lucide-react";

export function PlatformNotice() {
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
              <span className="text-foreground">OnlyOnce EA</span> 策略参数主要基于{" "}
              <span className="text-foreground">Vantage</span> 平台环境优化。强烈建议使用{" "}
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
