"use client"

import { useParams, usePathname } from "next/navigation"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { StudentDetailHeader } from "@/components/students/student-detail-header"
import { StudentPersonalInfo } from "@/components/students/student-personal-info"
import { EnrollmentAlert } from "@/components/students/enrollment-alert"
import { WithdrawnBanner } from "@/components/students/withdrawn-banner"
import { AccountInfoSection } from "@/components/shared/account/account-info-section"
import { useStudentPageActions, StudentPageDialogs } from "@/hooks/use-student-page-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import PageLayout from "@/components/dashboard/page-layout"

export default function StudentDetailsPage() {
  const params = useParams()
  const pathname = usePathname()
  const idNumber = params.id_number as string

  const studentsApi = useStudentsApi()
  const { data: student, isLoading, error, refetch, isFetching } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber && Boolean(pathname?.includes("/students/")),
  })
  const hookResult = useStudentPageActions(student)
  const studentDisplayName = [student?.first_name, student?.last_name].filter(Boolean).join(" ") || student?.full_name || "this student"

  if (isLoading){
    return <LoadingSkeleton />
  }

  return (
    <PageLayout
    
    title="Student Details"
    description={`View and manage detailed information for ${studentDisplayName}`}
    actions={
       <Button 
            variant="outline"
            size='icon'
            onClick={() => refetch()}
            icon={<RefreshCw className="size-4" />}
            loading={isLoading || isFetching}
            />
    }
    error={error}
    noData={!student}
    loading={isLoading}
    skeleton={
      <LoadingSkeleton />
    }
    >
      <div className="space-y-4">

        {/* Enrollment Alert — shown when student is not enrolled */}
        <EnrollmentAlert student={student} />

        {/* Withdrawn Banner — shown when student is in read-only state */}
        <WithdrawnBanner student={student} onReEnroll={hookResult.handleReinstate} loading={hookResult.reinstate.isPending} />

        {/* Student Header */}
        {student && (
            <StudentDetailHeader
            student={student}
            />
        )}

        {/* Detailed Personal Information */}
        <div>
          <StudentPersonalInfo student={student} />
        </div>

        {student && (
          <AccountInfoSection
            entityLabel="Student"
            fullName={student.full_name}
            idNumber={student.id_number}
            accountType="STUDENT"
            dateOfBirth={student.date_of_birth}
            userAccount={student.user_account}
            onAccountCreated={async () => {
              await refetch()
            }}
          />
        )}
      </div>

      <StudentPageDialogs student={student} hookResult={hookResult} />
    </PageLayout>
  )
}


function LoadingSkeleton() {
  return (
    <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
  )
}