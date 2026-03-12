"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
  compactOnMobile?: boolean;
}

/**
 * Breadcrumb navigation component
 * Shows hierarchical navigation path with chevron separators
 */
export function BreadcrumbNav({
  items,
  className,
  compactOnMobile = true,
}: BreadcrumbNavProps) {
  const mobileItems =
    compactOnMobile && items.length > 2
      ? [items[items.length - 2], items[items.length - 1]]
      : items;

  const renderItems = (renderList: BreadcrumbItem[]) =>
    renderList.map((item, index) => {
      const isLast = index === renderList.length - 1;

      return (
        <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
          {item.href && !isLast ? (
            <Link
              href={item.href}
              className="max-w-35 truncate text-muted-foreground transition-colors hover:text-foreground sm:max-w-none"
              title={item.label}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "max-w-40 truncate sm:max-w-none",
                isLast ? "font-medium text-foreground" : "text-muted-foreground"
              )}
              title={item.label}
            >
              {item.label}
            </span>
          )}

          {!isLast && (
            <span aria-hidden className="shrink-0 text-lg text-muted-foreground/50">
              /
            </span>
          )}
        </li>
      );
    });

  return (
    <nav aria-label="Breadcrumb" className={cn("w-full min-w-0 text-sm", className)}>
      {/* Mobile: compact trail for narrow screens */}
      <ol className="flex min-w-0 items-center gap-1 overflow-hidden sm:hidden">
        {compactOnMobile && items.length > 2 && (
          <li className="flex items-center gap-1">
            <span className="text-muted-foreground/70">...</span>
            <span aria-hidden className="shrink-0 text-lg text-muted-foreground/50">/</span>
          </li>
        )}
        {renderItems(mobileItems)}
      </ol>

      {/* Desktop/tablet: full trail */}
      <ol className="hidden items-center gap-1 overflow-hidden sm:flex">
        {renderItems(items)}
      </ol>
    </nav>
  );
}
