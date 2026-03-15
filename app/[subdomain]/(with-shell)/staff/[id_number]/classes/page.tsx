"use client"

import { useParams, useRouter } from "next/navigation"
import { useStaff } from "@/lib/api2/staff"
import { AuthButton } from "@/components/auth/auth-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
} from "@hugeicons/core-free-icons"
import PageLayout from "@/components/dashboard/page-layout"
import { AssignTeacherSectionsDialog } from "@/components/staff/assign-teacher-sections-dialog"
import { AssignTeacherSubjectsDialog } from "@/components/staff/assign-teacher-subjects-dialog"
import * as React from "react"
import {
    EmptyState,
    EmptyStateTitle,
    EmptyStateDescription,
} from "@/components/ui/empty-state"

type SectionItem = {
  id?: string
  name?: string
  grade_level?: { id?: string; name?: string } | string
  students_count?: number
}

type TeacherSubjectItem = {
  id?: string
  section_subject?: {
    id?: string
    section?: {
      id?: string
      name?: string
      grade_level?: {
        id?: string
        name?: string
      }
    }
    subject?: {
      id?: string
      name?: string
    }
  }
  subject?: {
    id?: string
    name?: string
  }
}

type ScheduleItem = {
  id?: string
  class_schedule?: {
    id?: string
    section?: string | { id?: string; name?: string }
    subject?: { id?: string; name?: string } | null
    period?: string | { id?: string; name?: string; period_type?: "class" | "recess" }
    period_time?: {
      id?: string
      start_time?: string
      end_time?: string
      day_of_week?: number
    }
    section_time_slot?: {
      id?: string
      start_time?: string
      end_time?: string
      day_of_week?: number
    }
    is_recess?: boolean
  }
}

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
}

function formatTime(value?: string) {
  if (!value) return "--"
  const [h, m] = value.split(":")
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${h12}:${m} ${ampm}`
}

function getTimeSlot(schedule: ScheduleItem) {
  const classSchedule = schedule.class_schedule
  if (!classSchedule) return null
  return classSchedule.section_time_slot || classSchedule.period_time || null
}

export default function StaffClassesPage() {
  const params = useParams()
  const router = useRouter()
  const idNumber = params.id_number as string
  const staffApi = useStaff()
  const [showAssignClasses, setShowAssignClasses] = React.useState(false)
  const [subjectDialogSection, setSubjectDialogSection] = React.useState<{
    id: string
    label: string
  } | null>(null)

  const { data: staff, isLoading, error, refetch, isFetching } = staffApi.getStaffMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/staff/"), 
  })

  const handleRefresh = () => {
    void refetch()
  }

  const sections = React.useMemo(
    () => ((staff?.sections as SectionItem[] | undefined) ?? []),
    [staff?.sections]
  )

  const schedules = React.useMemo(
    () => ((staff?.schedules as ScheduleItem[] | undefined) ?? []),
    [staff?.schedules]
  )

  const teacherSubjects = React.useMemo(
    () => ((staff?.subjects as TeacherSubjectItem[] | undefined) ?? []),
    [staff?.subjects]
  )

  // Group teacher subjects by section ID
  const teacherSubjectsBySection = React.useMemo(() => {
    const grouped: Record<string, TeacherSubjectItem[]> = {}
    teacherSubjects.forEach((ts) => {
      const sectionId = ts.section_subject?.section?.id
      if (sectionId) {
        if (!grouped[sectionId]) {
          grouped[sectionId] = []
        }
        grouped[sectionId].push(ts)
      }
    })
    return grouped
  }, [teacherSubjects])

  const getSectionName = (section: SectionItem) =>
    typeof section.name === "string" && section.name.trim().length > 0
      ? section.name
      : "Section"

  const getSectionId = (section: SectionItem, index: number) =>
    typeof section.id === "string" && section.id.trim().length > 0
      ? section.id
      : `section-${index}`

  const getSectionGradeLevel = (section: SectionItem) => {
    if (typeof section.grade_level === "string") return section.grade_level
    if (section.grade_level && typeof section.grade_level.name === "string") {
      return section.grade_level.name
    }
    return "Grade Level"
  }

  const getSectionGroupName = (section: SectionItem) => {
    return `${getSectionGradeLevel(section)} - ${getSectionName(section)}`
  }

  const getSectionStudentsCount = (section: SectionItem) =>
    typeof section.students_count === "number" ? section.students_count : 0

  const getScheduleSectionName = (schedule: ScheduleItem) => {
    const section = schedule.class_schedule?.section
    if (typeof section === "string") return section
    if (section && typeof section.name === "string") return section.name
    return ""
  }

  const getScheduleSectionId = (schedule: ScheduleItem) => {
    const section = schedule.class_schedule?.section
    if (typeof section === "string") return undefined
    return section?.id
  }

  const getSchedulePeriodName = (schedule: ScheduleItem) => {
    const period = schedule.class_schedule?.period
    if (typeof period === "string") return period
    if (period && typeof period.name === "string") return period.name
    return "Period"
  }

  const getScheduleSubjectName = (schedule: ScheduleItem) => {
    const subjectName = schedule.class_schedule?.subject?.name
    if (subjectName) return subjectName
    const period = schedule.class_schedule?.period
    const isRecess =
      schedule.class_schedule?.is_recess ||
      (typeof period !== "string" && period?.period_type === "recess")
    return isRecess ? "Recess" : "Unassigned"
  }

  const getScheduleDay = (schedule: ScheduleItem) =>
    getTimeSlot(schedule)?.day_of_week

  const getScheduleTimeRange = (schedule: ScheduleItem) => {
    const slot = getTimeSlot(schedule)
    const start = slot?.start_time
    const end = slot?.end_time
    if (!start || !end) return "--"
    return `${formatTime(start)} - ${formatTime(end)}`
  }

  return (
    <PageLayout
      title="Teaching Assignments"
      description="Teaching assignments and classes"
      loading={isLoading}
      fetching={isFetching}
      refreshAction={handleRefresh}
      actions={
        staff?.is_teacher ? (
          <div className="flex flex-wrap items-center gap-2">
            <AuthButton
              roles={["admin", "registrar", "data_entry"]}
              variant="default"
              onClick={() => setShowAssignClasses(true)}
            >
              Manage Classes
            </AuthButton>
            <AuthButton
              roles={["admin", "registrar", "data_entry"]}
              variant="outline"
              iconLeft={<HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4" />}
              onClick={() => router.push("/setup/period-times")}
            >
              Configure Period Times
            </AuthButton>
          </div>
        ) : undefined
      }
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
      error={error}
      noData={!staff || !staff.is_teacher}
      emptyStateTitle={"Not a Teacher"}
      emptyStateDescription={"This staff member is not marked as a teacher."}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Classes Header */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={BookOpen02Icon} className="h-5 w-5" />
              Teaching Assignments
            </CardTitle>
          </CardHeader>
          
        </Card> */}
        <div>
            {sections.length > 0 ? (
              <Accordion
                key={sections.length > 0 ? getSectionId(sections[0], 0) : 'no-sections'}
                defaultValue={sections.length > 0 ? [getSectionId(sections[0], 0)] : []}
                className="space-y-3"
                multiple
              >
                {sections.map((section, idx) => {
                  const sectionName = getSectionName(section)
                  const sectionId = getSectionId(section, idx)
                  const groupName = getSectionGroupName(section)
                  const sectionSchedules = schedules.filter(
                    (schedule) =>
                      getScheduleSectionId(schedule) === sectionId ||
                      getScheduleSectionName(schedule) === sectionName
                  )
                  const sortedSectionSchedules = [...sectionSchedules].sort((a, b) => {
                    const dayA = getScheduleDay(a) ?? 99
                    const dayB = getScheduleDay(b) ?? 99
                    if (dayA !== dayB) return dayA - dayB

                    const startA = getTimeSlot(a)?.start_time ?? "99:99"
                    const startB = getTimeSlot(b)?.start_time ?? "99:99"
                    return startA.localeCompare(startB)
                  })
                  const assignedSubjects = teacherSubjectsBySection[sectionId] ?? []

                  return (
                    <AccordionItem key={sectionId} value={sectionId}>
                      <AccordionTrigger>
                        <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                          <div className="text-left">
                            <p className="font-semibold">{groupName}</p>
                          </div>
                          <Badge variant="secondary">
                            {getSectionStudentsCount(section)} students
                          </Badge>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="mb-3">
                          <AuthButton
                            roles={["admin", "registrar", "data_entry"]}
                            onClick={() =>
                              setSubjectDialogSection({
                                id: sectionId,
                                label: groupName,
                              })
                            }
                            variant="info-outline"
                          >
                            Assign Subjects
                          </AuthButton>
                        </div>

                        <Tabs defaultValue="subjects" className="w-full" >
                          <TabsList className="mb-2 grid w-full grid-cols-2 max-w-md">
                            <TabsTrigger value="subjects">Subjects</TabsTrigger>
                            <TabsTrigger value="schedule">Schedule</TabsTrigger>
                          </TabsList>

                          <TabsContent value="subjects" className="space-y-2">
                            {isLoading ? (
                              <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, loadingIdx) => (
                                  <Skeleton key={loadingIdx} className="h-12 w-full rounded-lg" />
                                ))}
                              </div>
                            ) : assignedSubjects.length > 0 ? (
                              assignedSubjects.map((teacherSubject, subjectIdx) => {
                                const subjectName = 
                                  teacherSubject.section_subject?.subject?.name ?? 
                                  teacherSubject.subject?.name ?? 
                                  "Subject"
                                return (
                                  <div
                                    key={teacherSubject.id ?? `subject-${subjectIdx}`}
                                    className="rounded-lg border p-4 hover:bg-muted"
                                  >
                                    <p className="text-sm font-medium">
                                      {subjectName}
                                    </p>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                                No subjects assigned.
                              </p>
                            )}
                          </TabsContent>

                          <TabsContent value="schedule" className="space-y-2">
                            {sortedSectionSchedules.length > 0 ? (
                              <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted/50">
                                    <tr>
                                      <th className="text-left font-medium px-3 py-2">Day</th>
                                      <th className="text-left font-medium px-3 py-2">Time</th>
                                      <th className="text-left font-medium px-3 py-2">Period</th>
                                      <th className="text-left font-medium px-3 py-2">Subject</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sortedSectionSchedules.map((schedule, scheduleIdx) => {
                                      const day = getScheduleDay(schedule)
                                      const period = schedule.class_schedule?.period
                                      const recess =
                                        schedule.class_schedule?.is_recess ||
                                        (typeof period !== "string" && period?.period_type === "recess")

                                      return (
                                        <tr key={schedule.id ?? `schedule-${scheduleIdx}`} className="border-t">
                                          <td className="px-3 py-2 text-muted-foreground">
                                            {day ? DAY_NAMES[day] ?? `Day ${day}` : "--"}
                                          </td>
                                          <td className="px-3 py-2">{getScheduleTimeRange(schedule)}</td>
                                          <td className="px-3 py-2">{getSchedulePeriodName(schedule)}</td>
                                          <td className="px-3 py-2">
                                            {recess ? (
                                              <Badge variant="outline" className="text-muted-foreground">
                                                Recess
                                              </Badge>
                                            ) : (
                                              <span>{getScheduleSubjectName(schedule)}</span>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                                No schedule entries for this class.
                              </p>
                            )}
                          </TabsContent>
                        </Tabs>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            ) : (
              <EmptyState className="border-none py-8">
                <EmptyStateTitle>No Classes Assigned</EmptyStateTitle>
                <EmptyStateDescription>
                  This teacher has not been assigned to any classes yet.
                </EmptyStateDescription>
              </EmptyState>
            )}
          </div>

        {staff && (
          <AssignTeacherSectionsDialog
            open={showAssignClasses}
            onOpenChange={setShowAssignClasses}
            teacherId={staff.id}
            teacherName={staff.full_name}
            onSuccess={() => {
              void refetch()
            }}
          />
        )}

        {staff && (
          <AssignTeacherSubjectsDialog
            open={Boolean(subjectDialogSection)}
            onOpenChange={(open) => {
              if (!open) {
                setSubjectDialogSection(null)
              }
            }}
            teacherId={staff.id}
            teacherName={staff.full_name}
            sectionId={subjectDialogSection?.id}
            sectionLabel={subjectDialogSection?.label}
            onSuccess={() => {
              void refetch()
            }}
          />
        )}
      </div>
    </PageLayout>
  )
}
