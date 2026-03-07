"use client";

import { BrandWordmark } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  highlight?: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  highlight,
}: AuthShellProps) {
  return (
    <div className="min-h-svh bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-120px] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[-100px] h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.08),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6">
        <div className="w-full rounded-3xl border bg-card/90 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-8 px-6 py-10 sm:px-10">
            <div className="flex items-center justify-between gap-4">
              <BrandWordmark className="h-6 w-auto" />
              {highlight ? (
                <span className="text-xs font-medium rounded-full bg-primary/10 text-primary px-3 py-1">
                  {highlight}
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>

            <div className={cn("space-y-6")}>
              {children}
              {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
