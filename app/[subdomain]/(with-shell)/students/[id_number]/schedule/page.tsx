"use client"

import { useMemo } from "react"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { StudentScheduleProjectionDto, useStudentScheduleProjection } from "@/lib/api2/schedule-projection"
import { PageContent } from "@/components/dashboard/page-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, Calendar03Icon } from "@hugeicons/core-free-icons"
import { useStaff } from "@/lib/api2/staff"
import PageLayout from "@/components/dashboard/page-layout"
import { useResolvedStudentIdNumber } from "@/hooks/use-resolved-student-id-number"
import { WeeklyScheduleCalendar, type WeeklyScheduleItem } from "@/components/shared/weekly-schedule-calendar"
import { useSectionTimeSlots } from "@/lib/api2/section-time-slot"

type StudentScheduleRow = StudentScheduleProjectionDto & { is_recess: boolean }

type TeacherSubjectLookupRow = {
  teacher?: { full_name?: string | null } | null
  section_subject?: { id?: string | null } | null
}

type TeacherSubjectLookupResponse =
  | TeacherSubjectLookupRow[]
  | { results?: TeacherSubjectLookupRow[] }
  | undefined

type SectionTimeSlotRow = {
  id: string
  day_of_week?: number
  start_time?: string
  end_time?: string
  period?: { name?: string; period_type?: "class" | "recess" }
  is_recess?: boolean
}

const SUBJECT_COLORS = [
  "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
]

function getScheduleLabel(item: StudentScheduleRow) {
  if (item.period.period_type === "recess" || !item.subject) {
    return "Recess";
  }
  return item.subject.name;
}

function isRecess(item: StudentScheduleRow) {
  return item.period.period_type === "recess" || !item.subject;
}

function getTimeSlot(item: StudentScheduleRow) {
  return {
    day_of_week: item.day_of_week,
    start_time: item.start_time,
    end_time: item.end_time,
  }
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

export default function StudentSchedulePage() {
  const idNumber = useResolvedStudentIdNumber()

  const studentsApi = useStudentsApi()
  const { data: student, isLoading: studentLoading, error: studentError, refetch: refetchStudent, isFetching: isFetchingStudent } = studentsApi.getStudent(idNumber)


  const {
    data: scheduleProjections,
    isLoading: scheduleLoading,
    error: scheduleError,
        refetch: refetchSchedule,
        isFetching: isFetchingSchedule,
  } = useStudentScheduleProjection(student?.id, {
    academic_year_id: student?.current_enrollment?.academic_year?.id,
  })

  const schedules = useMemo<StudentScheduleRow[]>(() => {
    return (scheduleProjections ?? []).map((row: StudentScheduleProjectionDto) => ({
      ...row,
      is_recess: row.period.period_type === "recess" || !row.subject,
    }))
  }, [scheduleProjections])

  const enrollment = student?.current_enrollment

  const sectionTimeSlotApi = useSectionTimeSlots()
  const { data: sectionTimeSlots = [] } = sectionTimeSlotApi.getSectionTimeSlots(
    enrollment?.section?.id ?? "",
    { enabled: Boolean(enrollment?.section?.id) }
  )

  const staffApi = useStaff()
  const { data: teacherSubjectsResponse } = staffApi.getTeacherSubjects(
    {
      section: enrollment?.section?.id,
      page_size: 200,
    },
    { enabled: Boolean(enrollment?.section?.id) }
  )

  const teacherBySectionSubjectId = useMemo(() => {
    const map = new Map<string, string>()
    const response = teacherSubjectsResponse as TeacherSubjectLookupResponse
    const rows = Array.isArray(response)
      ? response
      : response?.results ?? []

    for (const row of rows) {
      const sectionSubjectId = row?.section_subject?.id
      const teacherName = row?.teacher?.full_name
      if (!sectionSubjectId || !teacherName) continue
      map.set(sectionSubjectId, teacherName)
    }

    return map
  }, [teacherSubjectsResponse])

  // Build a subject → color map
  const subjectColorMap = useMemo(() => {
    if (!schedules || schedules.length === 0) return new Map<string, string>()
    const uniqueSubjects = [...new Set(
      schedules
        .filter((s: StudentScheduleRow) => !isRecess(s) && Boolean(s.subject?.name))
        .map((s: StudentScheduleRow) => s.subject?.name ?? "Subject")
    )]
    const map = new Map<string, string>()
    uniqueSubjects.forEach((name, i) => {
      map.set(name, SUBJECT_COLORS[i % SUBJECT_COLORS.length])
    })
    return map
  }, [schedules])

  const calendarItems = useMemo<WeeklyScheduleItem[]>(() => {
    if (!schedules) return []

    const slotKeys = new Set<string>()

    const itemsFromProjection = schedules.reduce<WeeklyScheduleItem[]>((acc, item, index) => {
      const slot = getTimeSlot(item)
      if (!slot?.day_of_week || !slot.start_time || !slot.end_time) return acc

      slotKeys.add(`${slot.day_of_week}-${slot.start_time}-${slot.end_time}`)

      const label = getScheduleLabel(item)
      acc.push({
        id: item.id ?? `${slot.day_of_week}-${slot.start_time}-${index}`,
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        title: label,
        subtitle: isRecess(item)
          ? undefined
          : teacherBySectionSubjectId.get(item.section_subject.id) || "Teacher not assigned",
        badge: item.period.name,
        muted: isRecess(item),
        cardClassName: isRecess(item) ? undefined : subjectColorMap.get(label),
      })

      return acc
    }, [])

    const slotRows = sectionTimeSlots as SectionTimeSlotRow[]
    for (const slot of slotRows) {
      const isRecessSlot = Boolean(slot.is_recess || slot.period?.period_type === "recess")
      if (!isRecessSlot || !slot.day_of_week || !slot.start_time || !slot.end_time) continue

      const key = `${slot.day_of_week}-${slot.start_time}-${slot.end_time}`
      if (slotKeys.has(key)) continue

      itemsFromProjection.push({
        id: `recess-${slot.id}`,
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        title: "Recess",
        badge: slot.period?.name ?? "Recess",
        muted: true,
      })
    }

    itemsFromProjection.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
      return a.startTime.localeCompare(b.startTime)
    })

    return itemsFromProjection
  }, [schedules, sectionTimeSlots, subjectColorMap, teacherBySectionSubjectId])

  const handleRefresh = () => {
    refetchStudent()
    refetchSchedule()
  }

  if (studentLoading) return <ScheduleSkeleton />

  if (!student) {
    return (
      <PageContent>
        <Card className="p-6 border-destructive/50 bg-destructive/10">
          <div className="flex items-start gap-3">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error Loading Student</h3>
              <p className="text-sm text-muted-foreground">Student not found</p>
            </div>
          </div>
        </Card>
      </PageContent>
    )
  }

  return (
    <PageLayout
      title="Class Schedule"
      description={enrollment
        ? `${enrollment.grade_level?.name} - ${enrollment.section?.name}`
        : "No current enrollment"}
      noData={!student || !enrollment || !schedules || schedules.length === 0}
      loading={studentLoading || scheduleLoading}
      refreshAction={handleRefresh}
      error={studentError || scheduleError}
      fetching={isFetchingStudent || isFetchingSchedule}
      emptyStateTitle={!enrollment ? "No Current Enrollment" : "No Schedule Set"}
      emptyStateDescription={
        !enrollment
          ? "This student is not currently enrolled. Enroll the student to see their class schedule."
          : "No class schedule has been configured for this section yet. The schedule will appear here once an administrator sets it up."
      }
      emptyStateIcon={<HugeiconsIcon icon={Calendar03Icon} className="size-5 text-muted-foreground" />}
    >
      {schedules && !enrollment && (
      <div className="space-y-4">
        <>
            <div className="overflow-hidden">
              <WeeklyScheduleCalendar
                items={calendarItems}
                searchPlaceholder="Search subjects"
                emptyDayText="No classes"
                showMutedToggle
                defaultShowMuted
                mutedLabel="Recess"
              />
            </div>
        </>
      </div>
      )}
    </PageLayout>
  )
}
