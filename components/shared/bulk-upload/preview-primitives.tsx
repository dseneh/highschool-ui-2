"use client";

import * as React from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkUploadStepItem<TStep extends string> {
  key: TStep;
  label: string;
  num: number;
}

interface StepIndicatorProps<TStep extends string> {
  step: TStep;
  steps: BulkUploadStepItem<TStep>[];
  showCheckOnComplete?: boolean;
}

export function BulkUploadStepIndicator<TStep extends string>({
  step,
  steps,
  showCheckOnComplete = true,
}: StepIndicatorProps<TStep>) {
  const currentIdx = steps.findIndex((item) => item.key === step);

  return (
    <div className="flex items-center">
      {steps.map((item, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <React.Fragment key={item.key}>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                  isPast && "bg-primary text-primary-foreground",
                  isCurrent && "border-2 border-primary bg-primary/10 text-primary",
                  !isPast && !isCurrent && "border border-muted-foreground/25 bg-muted/60 text-muted-foreground",
                )}
              >
                {isPast && showCheckOnComplete ? <CheckCircle2 className="size-3.5" /> : item.num}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCurrent && "text-primary",
                  isPast && "text-foreground",
                  !isPast && !isCurrent && "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn("mx-3 h-px w-8 flex-1 transition-colors", isPast ? "bg-primary" : "bg-border")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
}

export function BulkUploadEditableCell({ value, onChange }: EditableCellProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onChange(draft);
  };

  return (
    <div className="w-full min-w-0">
      {editing ? (
        <input
          ref={inputRef}
          size={1}
          className="block h-6 w-full min-w-0 max-w-full box-border rounded border border-primary bg-primary/5 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="group flex h-6 w-full min-w-0 items-center gap-1 rounded border border-transparent px-1.5 py-0.5 text-left text-xs transition-colors hover:bg-muted/60"
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          <span className={cn("min-w-0 flex-1 truncate", !value && "italic text-muted-foreground")}>
            {value}
          </span>
          <Pencil className="size-2.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40" />
        </button>
      )}
    </div>
  );
}
