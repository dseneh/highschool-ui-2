"use client"

import { useParams, useRouter } from "next/navigation"
import { useEmployee } from "@/lib/api2/employee"
import {
  TeacherScheduleProjectionDto,
  useTeacherScheduleProjection,
} from "@/lib/api2/schedule-projection"
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
import { AssignTeacherSectionsDialog } from "@/components/employees/assign-teacher-sections-dialog"
import { AssignTeacherSubjectsDialog } from "@/components/employees/assign-teacher-subjects-dialog"
import * as React from "react"
import { cn } from "@/lib/utils"
import EmptyStateComponent from "@/components/shared/empty-state"

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
  section?: { id?: string; name?: string } | null
  subject?: { id?: string; name?: string } | null
  period?: { id?: string; name?: string; period_type?: "class" | "recess" } | null
  time_window?: {
    day_of_week?: number | null
    start_time?: string | null
    end_time?: string | null
  } | null
  is_recess?: boolean
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
  return schedule.time_window || null
}

export default function EmployeeClassesPage() {
  const params = useParams()
  const router = useRouter()
  const idNumber = params.id_number as string
  const employeeApi = useEmployee()
  const [showAssignClasses, setShowAssignClasses] = React.useState(false)
  const [subjectDialogSection, setSubjectDialogSection] = React.useState<{
    id: string
    label: string
  } | null>(null)

  const { data: employee, isLoading, error, refetch, isFetching } = employeeApi.getEmployeeMember(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/employees/"), 
  })
  const {
    data: projectedSchedules,
    isFetching: projectionFetching,
    error: projectionError,
    refetch: refetchProjection,
  } = useTeacherScheduleProjection(employee?.id)

  const handleRefresh = () => {
    void refetch()
    void refetchProjection()
  }

  const sections = React.useMemo(
    () => ((employee?.sections as SectionItem[] | undefined) ?? []),
    [employee?.sections]
  )

  const schedules = React.useMemo(
    () =>
      ((projectedSchedules as TeacherScheduleProjectionDto[] | undefined) ?? []).map(
        (schedule): ScheduleItem => ({
          id: schedule.id,
          section: schedule.section,
          subject: schedule.subject,
          period: schedule.period,
          time_window: schedule.time_window,
          is_recess: schedule.period?.period_type === "recess" || !schedule.subject,
        })
      ),
    [projectedSchedules]
  )

  const teacherSubjects = React.useMemo(
    () => ((employee?.subjects as TeacherSubjectItem[] | undefined) ?? []),
    [employee?.subjects]
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
  
      // get section id in an array
  const getSectionIds = (sections: SectionItem[]) => {
    return sections.map((section, index) => getSectionId(section, index))
  }

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

  const scheduleMatchesSection = (
    schedule: ScheduleItem,
    section: SectionItem,
    index: number
  ) => {
    const scheduleSectionId = getScheduleSectionId(schedule)
    const currentSectionId = getSectionId(section, index)

    // Prefer exact section-id matching so repeated section names across grade
    // levels do not leak schedules into the wrong accordion.
    if (scheduleSectionId && currentSectionId) {
      return scheduleSectionId === currentSectionId
    }

    // Only fall back to name matching when neither side has a usable id.
    if (scheduleSectionId || section.id) {
      return false
    }

    return getScheduleSectionName(schedule) === getSectionName(section)
  }

  const getScheduleSectionName = (schedule: ScheduleItem) => {
    const section = schedule.section
    if (section && typeof section.name === "string") return section.name
    return ""
  }

  const getScheduleSectionId = (schedule: ScheduleItem) => {
    return schedule.section?.id
  }

  const getSchedulePeriodName = (schedule: ScheduleItem) => {
    const period = schedule.period
    if (period && typeof period.name === "string") return period.name
    return "Period"
  }

  const getScheduleSubjectName = (schedule: ScheduleItem) => {
    const subjectName = schedule.subject?.name
    if (subjectName) return subjectName
    const period = schedule.period
    const isRecess =
      schedule.is_recess ||
      period?.period_type === "recess"
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
      fetching={isFetching || projectionFetching}
      refreshAction={handleRefresh}
      actions={
        employee?.is_teacher ? (
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
      error={error || projectionError}
      noData={!employee || !employee.is_teacher}
      emptyStateTitle={"Not a Teaching Staff"}
      emptyStateDescription={"This employee is not marked as a teaching staff."}
    >
      <div className="space-y-6 fmax-w-4xl">
        <div>
            {sections.length > 0 ? (
              <Accordion
                key={sections.length > 0 ? getSectionId(sections[0], 0) : 'no-sections'}
                defaultValue={sections.length > 0 ? getSectionIds(sections) : []}
                className="space-y-3"
                multiple
              >
                {sections.map((section, idx) => {
                  const sectionId = getSectionId(section, idx)
                  const groupName = getSectionGroupName(section)
                  const sectionSchedules = schedules.filter(
                    (schedule) => scheduleMatchesSection(schedule, section, idx)
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
                          {/* <Badge variant="secondary">
                            {getSectionStudentsCount(section)} students
                          </Badge> */}
                          <AuthButton
                            roles={["admin", "registrar", "data_entry"]}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSubjectDialogSection({
                                id: sectionId,
                                label: groupName,
                              })}
                            }
                            variant="link"
                          >
                            Assign Subjects
                          </AuthButton>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        {/* <div className="mb-3">
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
                        </div> */}

                        <Tabs defaultValue="subjects" className="w-full" >
                          <TabsList className="mb-2 fgrid w-full fgrid-cols-2 max-w-md" variant="default">
                            <TabsTrigger value="subjects">Subjects</TabsTrigger>
                            <TabsTrigger value="schedule">Schedule</TabsTrigger>
                          </TabsList>

                          <TabsContent value="subjects" className="fspace-y-1 border rounded-lg divide-y">
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
                                    className={cn("frounded-lg fborder fp-4 hover:bg-muted",
                                      subjectIdx === 0 ? "hover:rounded-tl-lg rounded-tr-lg" : "",
                                      subjectIdx === assignedSubjects.length - 1 ? "hover:rounded-bl-lg rounded-br-lg" : "",
                                    )}
                                  >
                                    <div className="grid grid-cols-12 divide-x">
                                      <div className={cn("text-center p-4 bg-muted text-muted-foreground/50 font-semibold",
                                        subjectIdx === 0 ? "rounded-tl-lg" : "",
                                        subjectIdx === assignedSubjects.length - 1 ? "rounded-bl-lg" : "",
                                      )}>{subjectIdx + 1}</div>
                                       <div className="col-span-11 p-4 w-full text-sm font-medium">{subjectName}</div>
                                    </div>
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
                                      const period = schedule.period
                                      const recess =
                                        schedule.is_recess ||
                                        period?.period_type === "recess"

                                      return (
                                        <tr key={schedule.id ?? `schedule-${scheduleIdx}`} className="border-t hover:bg-muted">
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
              <EmptyStateComponent
                title="No classes assigned"
                description="This teacher has not been assigned to any classes yet. Use the Manage Classes button to assign sections."
              />
            )}
          </div>

        {employee && (
          <AssignTeacherSectionsDialog
            open={showAssignClasses}
            onOpenChange={setShowAssignClasses}
            teacherId={employee.id}
            teacherName={employee.full_name}
            onSuccess={() => {
              void refetch()
            }}
          />
        )}

        {employee && (
          <AssignTeacherSubjectsDialog
            open={Boolean(subjectDialogSection)}
            onOpenChange={(open) => {
              if (!open) {
                setSubjectDialogSection(null)
              }
            }}
            teacherId={employee.id}
            teacherName={employee.full_name}
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
