import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gold-gradient text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold">
              OnlyOnce <span className="gold-text">EA Trade</span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> 返回首页
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
        {updated && (
          <p className="mt-2 text-xs text-muted-foreground">最后更新：{updated}</p>
        )}
        <div className="prose-legal mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-gold [&_a]:underline">
          {children}
        </div>
        <div className="mt-14 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          有疑问？通过{" "}
          <a
            href="https://wa.me/60136330303"
            target="_blank"
            rel="noreferrer"
            className="text-gold underline"
          >
            WhatsApp
          </a>{" "}
          联系客服。
        </div>
      </article>
    </main>
  );
}
