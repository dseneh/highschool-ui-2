"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSystemHealth, type SystemStatus } from "@/hooks/use-system-health"

/* ------------------------------------------------------------------ */
/*  Status config map                                                  */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  SystemStatus,
  {
    dot: string
    ring: string
    label: string
    shortLabel: string
    description: string
  }
> = {
  online: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/20",
    label: "System Online",
    shortLabel: "Online",
    description: "All services are running normally",
  },
  offline: {
    dot: "bg-red-500",
    ring: "ring-red-500/20",
    label: "System Offline",
    shortLabel: "Offline",
    description: "Backend server is not responding",
  },
  checking: {
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
    label: "Checking…",
    shortLabel: "Checking",
    description: "Verifying system status",
  },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SystemStatusIndicator() {
  const { status, refetch, isFetching } = useSystemHealth()
  const config = STATUS_CONFIG[status]

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() => void refetch()}
            className="relative flex items-center gap-2 h-8 px-2 rounded-md hover:bg-muted transition-colors"
            aria-label={config.label}
          >
            {/* Dot with animated ping ring */}
            <span className="relative flex size-2.5">
              {/* Ping animation — only when online or checking */}
              {(status === "online" || status === "checking") && (
                <span
                  className={cn(
                    "absolute inset-0 rounded-full opacity-75 animate-ping",
                    status === "online" ? "bg-emerald-400" : "bg-amber-400",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full ring-4 transition-colors",
                  config.dot,
                  config.ring,
                  isFetching && "animate-pulse",
                )}
              />
            </span>

            {/* Label */}
            <span
              className={cn(
                "fhidden fsm:inline text-xs font-medium transition-colors",
                status === "online" && "text-emerald-600 dark:text-emerald-400",
                status === "offline" && "text-red-600 dark:text-red-400",
                status === "checking" && "text-amber-600 dark:text-amber-400",
              )}
            >
              {config.shortLabel}
            </span>
          </button>
        }
      />
      <TooltipContent side="bottom" className="text-center">
        <p className="font-medium text-xs">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
        <p className="text-[10px] text-muted-foreground mt-1">Click to re-check</p>
      </TooltipContent>
    </Tooltip>
  )
}
