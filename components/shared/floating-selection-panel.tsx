"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  icon?: React.ReactNode;
  disabled?: boolean;
  shortcut?: string;
  hidden?: boolean;
}

interface FloatingSelectionPanelProps {
  count: number;
  onClear: () => void;
  actions: FloatingAction[];
  className?: string;
}

export function FloatingSelectionPanel({
  count,
  onClear,
  actions,
  className,
}: FloatingSelectionPanelProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const prevCountRef = React.useRef(count);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (count > 0) {
      setShouldRender(true);
      // Delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && count > 0) {
        e.preventDefault();
        onClear();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [count, onClear]);

  if (!mounted || !shouldRender) return null;

  const visibleActions = actions.filter(action => !action.hidden);

  const panel = (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:px-0",
        "transition-all duration-300",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-full opacity-0 pointer-events-none",
        className
      )}
    >
      <style>{`
        .floating-panel-content {
          transition: all 300ms ease-out;
        }
      `}</style>
      <div className="floating-panel-content mx-auto flex w-full max-w-full items-center gap-2 rounded-xl border border-border/50 bg-zinc-900 px-3 py-2 sm:px-4 shadow-2xl backdrop-blur-sm sm:w-auto sm:gap-3">
        {/* Count + Clear */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-r border-zinc-700 pr-2 sm:pr-3 shrink-0">
          <span className="text-xs sm:text-sm font-medium text-zinc-100 whitespace-nowrap">
            {count} selected
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-5 sm:size-6 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 shrink-0"
            onClick={onClear}
            title="Clear selection (Esc)"
          >
            <X className="size-3 sm:size-3.5" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
          {visibleActions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || "secondary"}
              size="sm"
              className={cn(
                "h-5 sm:h-6 gap-1 sm:gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 px-2.5 sm:px-2 transition-all",
                action.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : action.variant === "outline"
                  ? "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                  : action.variant === "default"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              )}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <span className="shrink-0">{action.icon}</span>}
              <span className="hidden sm:inline">{action.label}</span>
              <span className="sm:hidden">{action.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
