"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useStaff } from "@/lib/api2/staff"
import { TeacherScheduleProjectionDto, useTeacherScheduleProjection } from "@/lib/api2/schedule-projection"
import { PageContent } from "@/components/dashboard/page-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, Calendar03Icon } from "@hugeicons/core-free-icons"
import PageLayout from "@/components/dashboard/page-layout"
import { AuthButton } from "@/components/auth/auth-button"
import { WeeklyScheduleCalendar, type WeeklyScheduleItem } from "@/components/shared/weekly-schedule-calendar"
import { useGradeLevels } from "@/hooks/use-grade-level"

type TeacherScheduleRow = {
  id?: string
  section: { id?: string; name?: string } | null
  subject: { id?: string; name?: string } | null
  period: { id?: string; name?: string; period_type?: "class" | "recess" } | null
  time_window?: {
    day_of_week?: number | null
    start_time?: string | null
    end_time?: string | null
  } | null
  is_recess?: boolean
}

function getTimeSlot(item: TeacherScheduleRow) {
  return item.time_window || null
}

const SUBJECT_COLORS = [
  "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
]

function isRecess(item: TeacherScheduleRow) {
  return item.is_recess || item.period?.period_type === "recess" || !item.subject
}

function getLabel(item: TeacherScheduleRow) {
  if (isRecess(item)) return "Recess"
  return item.subject?.name || "Subject"
}

function ScheduleSkeleton() {
  return (
    <PageContent>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    </PageContent>
  )
}

export default function StaffSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const idNumber = params.id_number as string

  const staffApi = useStaff()
  const { data: staff, isLoading: staffLoading, error, refetch, isFetching } = staffApi.getStaffMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/staff/"),
  })

  const {
    data: projectedSchedules,
    isFetching: projectionFetching,
    error: projectionError,
    refetch: refetchProjection,
  } = useTeacherScheduleProjection(staff?.id)
  const { data: gradeLevels = [] } = useGradeLevels()

  const schedules: TeacherScheduleRow[] = useMemo(
    () =>
      (projectedSchedules ?? []).map((item: TeacherScheduleProjectionDto) => ({
        id: item.id,
        section: item.section,
        subject: item.subject,
        period: item.period,
        time_window: item.time_window,
        is_recess: item.period?.period_type === "recess" || !item.subject,
      })),
    [projectedSchedules]
  )

  const subjectColorMap = useMemo(() => {
    const uniqueSubjects = [...new Set(
      schedules.filter((s) => !isRecess(s)).map((s) => s.subject?.name || "Subject")
    )]
    const map = new Map<string, string>()
    uniqueSubjects.forEach((name, i) => {
      map.set(name, SUBJECT_COLORS[i % SUBJECT_COLORS.length])
    })
    return map
  }, [schedules])

  const sectionLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const gradeLevel of gradeLevels) {
      for (const section of gradeLevel.sections) {
        map.set(section.id, `${gradeLevel.name}\n${section.name}`)
      }
    }
    return map
  }, [gradeLevels])

  const calendarItems = useMemo<WeeklyScheduleItem[]>(() => {
    return schedules.reduce<WeeklyScheduleItem[]>((acc, item, index) => {
        const slot = getTimeSlot(item)
        if (!slot?.day_of_week || !slot.start_time || !slot.end_time) return acc

        const label = getLabel(item)
        const sectionSubtitle =
          (item.section?.id ? sectionLabelMap.get(item.section.id) : undefined) ||
          item.section?.name ||
          "Section"
        acc.push({
          id: item.id ?? `${slot.day_of_week}-${slot.start_time}-${index}`,
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
          title: label,
          subtitle: sectionSubtitle,
          badge: item.period?.name || "Period",
          muted: isRecess(item),
          cardClassName: isRecess(item) ? undefined : subjectColorMap.get(label),
        })
        return acc
      }, [])
  }, [schedules, subjectColorMap, sectionLabelMap])

  if (staffLoading) return <ScheduleSkeleton />

  if (!staff) {
    return (
      <PageContent>
        <Card className="p-6 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error Loading Staff</h3>
              <p className="text-sm text-muted-foreground">Staff member not found</p>
            </div>
          </div>
        </Card>
      </PageContent>
    )
  }

  return (
    <PageLayout
      title="Teaching Calendar"
      description="Your class schedule by day and time"
      noData={!staff.is_teacher || schedules.length === 0}
      loading={staffLoading}
      fetching={isFetching || projectionFetching}
      refreshAction={() => {
        refetch()
        refetchProjection()
      }}
      error={error || projectionError}
      actions={
        <AuthButton
          roles={["admin", "registrar", "data_entry"]}
          variant="outline"
          iconLeft={<HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4" />}
          onClick={() => router.push("/setup/period-times")}
        >
          Configure Period Times
        </AuthButton>
      }
      emptyStateTitle={!staff.is_teacher ? "Not a Teacher" : "No Schedule Entries"}
      emptyStateDescription={!staff.is_teacher
        ? "This staff member is not marked as a teaching staff."
        : "No class schedule has been configured for this teacher yet."}
      emptyStateIcon={<HugeiconsIcon icon={Calendar03Icon} className="size-5 text-muted-foreground" />}
    >
      {staff.is_teacher && (
      <div className="overflow-hidden">
        <WeeklyScheduleCalendar
          items={calendarItems}
          searchPlaceholder="Search classes or sections"
          emptyDayText="No classes"
          showMutedToggle
          defaultShowMuted={false}
          mutedLabel="Recess"
        />
      </div>
      )}
    </PageLayout>
  )
}
