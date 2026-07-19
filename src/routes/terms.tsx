import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "服务条款 · OnlyOnce EA Trade" },
      { name: "description", content: "OnlyOnce EA Trade 服务条款：EA 授权服务的使用规范、账号管理与责任限制。" },
      { property: "og:title", content: "服务条款 · OnlyOnce EA Trade" },
      { property: "og:description", content: "EA 授权服务的使用规范、账号管理与责任限制。" },
    ],
    links: [{ rel: "canonical", href: "https://onlyoncetrade.com/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="服务条款" updated="2026-07-19">
      <p>
        欢迎使用 OnlyOnce EA Trade。使用本网站及订阅本服务，即表示您同意以下条款。
      </p>

      <h2>1. 服务内容</h2>
      <p>
        OnlyOnce EA Trade 提供基于 MT5 平台的 EA 自动交易脚本授权服务。会员通过订阅获得
        <strong>指定 MT5 UID 在授权期内使用 EA 的权限</strong>。本服务不包括代客交易、资金托管或收益分成。
      </p>

      <h2>2. 会员账号</h2>
      <ul>
        <li>会员需提供有效的 MT5 UID 用于开通白名单。</li>
        <li>会员对自己的账号、密码及授权 UID 的保密与使用负全部责任。</li>
        <li>严禁将 EA 文件、授权或账号分享、转卖给第三方，一经发现将立即终止授权且不予退款。</li>
      </ul>

      <h2>3. 订阅与续费</h2>
      <ul>
        <li>订阅按月付费（30 天），付款成功后 UID 自动进入授权白名单。</li>
        <li>到期后授权自动停止，EA 停止执行新交易，需续费方可恢复。</li>
        <li>价格如有调整以订阅时页面显示为准。</li>
      </ul>

      <h2>4. 使用限制</h2>
      <ul>
        <li>不得对 EA 进行反编译、逆向工程或二次分发。</li>
        <li>不得用本服务从事违反当地法律法规的交易活动。</li>
        <li>如发现滥用、恶意行为，我们有权立即暂停或终止授权。</li>
      </ul>

      <h2>5. 免责与责任限制</h2>
      <p>
        请配合阅读<a href="/risk-disclosure">《风险声明》</a>。在法律允许的最大范围内，
        OnlyOnce EA Trade 对以下情形<strong>不承担任何责任</strong>：
      </p>
      <ul>
        <li>因交易产生的任何盈亏；</li>
        <li>因经纪商、网络、服务器、MT5 平台或第三方原因导致的服务中断或订单执行异常；</li>
        <li>因用户自身操作错误、参数调整不当所导致的损失。</li>
      </ul>

      <h2>6. 服务变更与终止</h2>
      <p>
        我们保留在合理情况下调整、升级、暂停或终止部分或全部服务的权利，并会尽力提前通知会员。
      </p>

      <h2>7. 条款更新</h2>
      <p>
        本条款可能不定期更新，更新后将在本页面公示。继续使用本服务即视为接受最新条款。
      </p>
    </LegalLayout>
  );
}
