import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "隐私政策 · OnlyOnce EA Trade" },
      { name: "description", content: "OnlyOnce EA Trade 隐私政策：我们如何收集、使用和保护您的个人信息。" },
      { property: "og:title", content: "隐私政策 · OnlyOnce EA Trade" },
      { property: "og:description", content: "我们如何收集、使用和保护您的个人信息。" },
    ],
    links: [{ rel: "canonical", href: "https://onlyoncetrade.com/privacy-policy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout title="隐私政策" updated="2026-07-19">
      <p>
        我们尊重并保护每一位用户的隐私。本政策说明 OnlyOnce EA Trade 会收集哪些信息、
        如何使用、以及如何保护。
      </p>

      <h2>1. 我们收集的信息</h2>
      <ul>
        <li><strong>账号信息</strong>：邮箱、登录方式（Email / Google）。</li>
        <li><strong>授权信息</strong>：MT5 UID、订阅方案、到期时间、授权产品。</li>
        <li><strong>付款信息</strong>：通过 Stripe 处理付款，我们仅接收订单元数据（金额、状态、订单号），
          <strong>不接触也不存储您的信用卡完整信息</strong>。</li>
        <li><strong>技术信息</strong>：访问日志、IP 地址、浏览器与设备信息，用于安全防护和服务质量。</li>
      </ul>

      <h2>2. 使用目的</h2>
      <ul>
        <li>为您提供 EA 授权、白名单管理、订阅续费与客户服务；</li>
        <li>防止欺诈与滥用；</li>
        <li>改善网站与产品体验；</li>
        <li>依法履行法律或监管要求。</li>
      </ul>

      <h2>3. 第三方服务</h2>
      <ul>
        <li><strong>Stripe</strong>：处理付款交易。</li>
        <li><strong>Google OAuth</strong>：可选的登录方式。</li>
        <li><strong>后端云服务</strong>：用于数据存储、认证与授权检查。</li>
      </ul>
      <p>
        这些服务提供商在处理相关数据时受各自的隐私政策约束。
      </p>

      <h2>4. 数据保存与安全</h2>
      <ul>
        <li>我们仅在必要期限内保留您的信息，用于提供服务和满足法律要求。</li>
        <li>数据传输采用 HTTPS 加密。</li>
        <li>访问后台数据的权限严格限制在授权管理员范围内。</li>
      </ul>

      <h2>5. 您的权利</h2>
      <p>
        您可以随时联系我们要求查询、更新或删除您的账号信息。
        如需删除账号，请通过{" "}
        <a href="https://wa.me/60136330303" target="_blank" rel="noopener noreferrer">WhatsApp 客服</a>
        {" "}提交申请。请注意，出于合规与财务记录的要求，某些付款相关记录会依法保留一段时间。
      </p>

      <h2>6. Cookies</h2>
      <p>
        本网站使用必要的 Cookies 与本地存储以维持登录状态与站点功能，不用于跨站追踪广告。
      </p>

      <h2>7. 政策更新</h2>
      <p>
        本政策可能不定期更新，更新后将在本页面公示。重大变更时我们将通过邮件或站内通知告知。
      </p>
    </LegalLayout>
  );
}
