const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-red-500/40 bg-red-500/10 px-4 py-2 text-center text-xs text-red-300">
        生产支付尚未配置。请完成 Payments 上线流程以接受真实付款。
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-300">
        当前处于测试模式，任何付款均不会产生真实扣款。
      </div>
    );
  }
  return null;
}
