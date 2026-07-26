import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "联系我们 · OnlyOnce EA Trade" },
      { name: "description", content: "通过官方 WhatsApp 联系 OnlyOnce EA Trade 客服，咨询 MT5 EA 授权、订阅与技术问题。" },
      { property: "og:title", content: "联系我们 · OnlyOnce EA Trade" },
      { property: "og:description", content: "官方 WhatsApp 客服联系方式。" },
    ],
    links: [{ rel: "canonical", href: "https://onlyoncetrade.com/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <LegalLayout title="联系 / Contact" updated="2026-07-26">
      <p>
        OnlyOnce EA Trade 是 MT5 Expert Advisor 订阅授权服务。如需咨询订阅、UID 授权、
        续费或安装说明，请通过以下官方渠道联系我们。
      </p>
      <p>
        OnlyOnce EA Trade is a legitimate MT5 Expert Advisor subscription service.
        For any inquiries about subscription, authorization, renewal, or setup,
        please contact us through the official channel below.
      </p>

      <h2>官方客服 / Official Support</h2>
      <ul>
        <li>
          WhatsApp：{" "}
          <a href="https://wa.me/60136330303" target="_blank" rel="noopener noreferrer">
            +60 13-633 0303
          </a>
        </li>
      </ul>

      <h2>安全提醒 / Security Notice</h2>
      <p>
        我们<strong>不会</strong>索取或收集您的 MT5 密码、经纪商登录密码、银行密码、
        银行卡号码、钱包助记词，也不会请求任何形式的远程设备控制权限。
        EA 授权仅使用您提供的 <strong>MT5 UID</strong>；付款由 Stripe 安全处理。
      </p>
      <p>
        We will <strong>never</strong> ask for your MT5 password, broker password,
        bank password, card number, wallet seed phrase, or remote access to your
        device. EA authorization uses only your <strong>MT5 UID</strong>. Payments
        are processed securely by Stripe.
      </p>

      <h2>响应时间 / Response Time</h2>
      <p>
        客服工作时间通常为 GMT+8 上午 10:00 – 晚上 10:00，我们会尽快回复您的信息。
      </p>
    </LegalLayout>
  );
}
