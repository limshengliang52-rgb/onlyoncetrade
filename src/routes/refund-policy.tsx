import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "退款政策 · OnlyOnce EA Trade" },
      { name: "description", content: "OnlyOnce EA Trade 退款政策：数字授权服务的退款规则与申请流程。" },
      { property: "og:title", content: "退款政策 · OnlyOnce EA Trade" },
      { property: "og:description", content: "数字授权服务的退款规则与申请流程。" },
    ],
    links: [{ rel: "canonical", href: "https://onlyoncetrade.com/refund-policy" }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalLayout title="退款政策" updated="2026-07-19">
      <p>
        OnlyOnce EA Trade 是数字授权服务，付款成功即立即为您开通 EA 使用权限。
        请在订阅前充分阅读<a href="/risk-disclosure">《风险声明》</a>与
        <a href="/terms">《服务条款》</a>。
      </p>

      <h2>1. 一般政策</h2>
      <p>
        由于本服务属于<strong>数字授权 / 软件访问服务</strong>，
        一旦 UID 白名单开通、EA 文件与安装指引发出，订阅费用
        <strong>原则上不予退款</strong>。
      </p>

      <h2>2. 可申请退款情形</h2>
      <ul>
        <li>付款成功但因我方原因超过 24 小时仍无法完成 UID 授权且无法解决；</li>
        <li>因系统重复扣款导致的多余款项；</li>
        <li>付款成功后从未收到 EA 文件与安装指引，且我们无法在合理时间内交付。</li>
      </ul>

      <h2>3. 不予退款情形</h2>
      <ul>
        <li>已收到 EA 文件、已完成 UID 白名单授权；</li>
        <li>因使用 EA 交易产生亏损或未达到预期收益；</li>
        <li>因用户自身经纪商、网络、参数配置、账户资金不足等问题导致 EA 无法正常运行；</li>
        <li>会员违反<a href="/terms">《服务条款》</a>被暂停或终止授权；</li>
        <li>订阅到期未续费的自然停止。</li>
      </ul>

      <h2>4. 申请流程</h2>
      <p>
        如认为符合退款条件，请在付款后 7 天内通过{" "}
        <a href="https://wa.me/60136330303" target="_blank" rel="noreferrer">WhatsApp 客服</a>
        {" "}提交：付款截图、订单号、MT5 UID 与详细原因。审核通过后款项将原路退回，处理周期通常为 5–14 个工作日（视银行 / Stripe 处理时间而定）。
      </p>
    </LegalLayout>
  );
}
