"use client"

import { useCurrentAcademicYear } from "@/hooks/use-academic-year"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { format } from "date-fns"
import { ChevronDown } from "lucide-react"
import { getStatusBadgeClass } from "@/lib/status-colors"

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "MMM d, yyyy")
  } catch {
    return dateStr
  }
}

export function AcademicYearIndicator() {
  const { data: year, isLoading } = useCurrentAcademicYear()

  if (isLoading) {
    return <Skeleton className="h-8 w-36 rounded-md" />
  }

  if (!year) {
    return (
      <Badge variant="outline" className="h-8 gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
        No Academic Year
      </Badge>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium"
          icon={<HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />}
          iconRight={<ChevronDown className="size-3" />}
          >
            
            <span className="fhidden fsm:inline">{year.name}</span>
            {/* <span className="sm:hidden">AY</span> */}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-72 p-4">
        <div className="space-y-3">
          {/* Title */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Academic Year</h4>
            <Badge variant="outline" className={getStatusBadgeClass(year.status)}>
              {year.status === "active" ? "Active" : year.status === "onhold" ? "On Hold" : "Inactive"}
            </Badge>
          </div>

          {/* Year name */}
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-base font-semibold">{year.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(year.start_date)} — {formatDate(year.end_date)}
            </p>
          </div>

          {/* Semesters */}
          {year.semesters && year.semesters.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Semesters</p>
              {year.semesters.map((sem) => (
                <div
                  key={sem.id}
                  className="flex items-start flex-col gap-2 justify-between text-xs p-2 rounded-md border"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{sem.name}</span>
                    {sem.is_current && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        Current
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {formatDate(sem.start_date)} — {formatDate(sem.end_date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
