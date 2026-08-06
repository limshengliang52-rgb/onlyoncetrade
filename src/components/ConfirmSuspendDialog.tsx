import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * 暂停授权二次确认弹窗：只有点击「确认暂停」才会真正修改授权状态。
 */
export function ConfirmSuspendDialog({ open, pending, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="card-lux w-full max-w-md rounded-2xl border border-red-500/30 p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-400">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold">确认暂停授权</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              暂停授权后，该客户的 EA 将无法通过授权检查。必须由管理员确认后才会暂停。
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
          >
            {pending ? "处理中..." : "确认暂停"}
          </button>
        </div>
      </div>
    </div>
  );
}
