"use client"

import { useParams } from "next/navigation"
import { useStaff } from "@/lib/api2/staff"
import { AuthButton } from "@/components/auth/auth-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    BookOpen02Icon
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
    period?: string | { id?: string; name?: string }
  }
}

export default function StaffClassesPage() {
  const params = useParams()
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

  const getSchedulePeriodName = (schedule: ScheduleItem) => {
    const period = schedule.class_schedule?.period
    if (typeof period === "string") return period
    if (period && typeof period.name === "string") return period.name
    return "Period"
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
                    (schedule) => getScheduleSectionName(schedule) === sectionName
                  )
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
                            {sectionSchedules.length > 0 ? (
                              sectionSchedules.map((schedule, scheduleIdx) => (
                                <div
                                  key={schedule.id ?? `schedule-${scheduleIdx}`}
                                  className="rounded-lg border p-3"
                                >
                                  <p className="text-sm font-medium">
                                    {getSchedulePeriodName(schedule)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{sectionName}</p>
                                </div>
                              ))
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
