import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/risk-disclosure")({
  head: () => ({
    meta: [
      { title: "风险声明 · OnlyOnce EA Trade" },
      { name: "description", content: "OnlyOnce EA Trade 风险声明：EA 自动交易不保证盈利，交易涉及高风险，用户须自行承担。" },
      { property: "og:title", content: "风险声明 · OnlyOnce EA Trade" },
      { property: "og:description", content: "EA 自动交易不保证盈利，交易涉及高风险，用户须自行承担。" },
    ],
    links: [{ rel: "canonical", href: "https://onlyoncetrade.com/risk-disclosure" }],
  }),
  component: RiskDisclosurePage,
});

function RiskDisclosurePage() {
  return (
    <LegalLayout title="风险声明" updated="2026-07-19">
      <p>
        使用 OnlyOnce EA Trade 提供的 MT5 EA 授权服务之前，请务必阅读并理解本风险声明。
        订阅本服务即视为您已阅读、理解并同意以下所有条款。
      </p>

      <h2>1. EA 是自动执行工具，并非收益保证</h2>
      <p>
        OnlyOnce EA Trade 提供的 EA 是按预设策略自动执行交易的软件工具，
        <strong>不构成任何盈利承诺、收益率保证或胜率保证</strong>。
        任何在网站、宣传材料或私下沟通中提到的表现数据，仅供参考。
      </p>

      <h2>2. 历史表现不代表未来</h2>
      <p>
        任何历史回测、模拟账户表现或过往实盘结果，
        <strong>都不代表未来的收益</strong>。市场行情、点差、滑点、流动性、经纪商执行环境和策略参数均可能影响实际结果。
      </p>

      <h2>3. 金融交易涉及高风险</h2>
      <ul>
        <li>外汇（Forex）、黄金（XAUUSD）、加密货币（如 BTCUSD）等杠杆交易品种波动剧烈，可能导致本金全部或部分亏损。</li>
        <li>使用杠杆会同时放大盈利与亏损。</li>
        <li>市场极端行情下可能出现无法及时平仓、滑点扩大、点差飙升等情况。</li>
      </ul>

      <h2>4. 用户自行承担风险</h2>
      <p>
        您在使用 EA 进行交易时，
        <strong>需自行承担所有交易风险与资金损失</strong>。OnlyOnce EA Trade 不对您因使用本服务而产生的任何直接或间接损失负责。
      </p>

      <h2>5. 建议先用小资金测试</h2>
      <ul>
        <li>强烈建议先使用 Demo 模拟账户或小资金账户挂载 EA，观察其表现与风险表现。</li>
        <li>建议最低起始资金为 <strong>500 USD</strong>，以确保 EA 的风控、止损距离与 MT5 最小手数有足够运行空间。</li>
        <li>确认对回撤、点差与滑点的承受度后再考虑逐步放大资金。</li>
      </ul>

      <h2>6. 订阅费用性质</h2>
      <p>
        您所支付的订阅费用仅代表<strong>软件使用权 / 授权服务费</strong>，
        <strong>不代表投资本金、不构成托管资金、不代表任何形式的理财或代客交易服务</strong>。
        您的交易账户与资金始终由您本人在自己选择的经纪商处独立持有与控制。
      </p>

      <h2>7. 不构成投资建议</h2>
      <p>
        本服务不构成任何投资、财务、税务或法律建议。您在做出交易决定前，
        应根据自身财务状况、投资目标与风险承受能力，必要时咨询独立的专业顾问。
      </p>

      <h2>8. 合规责任</h2>
      <p>
        您需自行确保在您所在国家或地区使用本服务、进行相关金融交易属于合法行为，
        并遵守当地法律法规。
      </p>
    </LegalLayout>
  );
}
