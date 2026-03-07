import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state"
import { DataTable } from "@/components/shared/data-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon, Coins01Icon } from "@hugeicons/core-free-icons"
import type { StudentConcessionDto } from "@/lib/api2/billing-types"
import { useBillingsApi } from "@/lib/api2/billing/api"
import { getConcessionsColumns } from "./concession-columns"

interface ConcessionsTableProps {
  studentId: string | null
  currencySymbol?: string
  onEdit?: (concession: StudentConcessionDto) => void
  onDelete?: (concession: StudentConcessionDto) => void
}

export function ConcessionsTable({
  studentId,
  currencySymbol = "$",
  onEdit,
  onDelete,
}: ConcessionsTableProps) {
  const { getStudentConcessionsApi } = useBillingsApi()

  const { data: concessionsData, isLoading, refetch } = useQuery<any>({
    queryKey: ["student-concessions", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("No student selected")
      const response = await getStudentConcessionsApi(studentId)
      return response.data
    },
    enabled: !!studentId,
  })

  const concessions = ((concessionsData as any)?.results as StudentConcessionDto[]) || []

  const columns = getConcessionsColumns({
    currencySymbol,
    onDelete: onDelete,
    onEdit: onEdit,
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Concessions ({concessions.length})</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
          icon={<HugeiconsIcon icon={RefreshIcon} className="size-4" />}
        />
      </CardHeader>
      <CardContent>
        {concessions.length === 0 && !isLoading ? (
          <EmptyState>
            <EmptyStateIcon>
              <HugeiconsIcon icon={Coins01Icon} />
            </EmptyStateIcon>
            <EmptyStateTitle>No Concessions Found</EmptyStateTitle>
            <EmptyStateDescription>
              Add the first concession for this student
            </EmptyStateDescription>
          </EmptyState>
        ) : (
          <DataTable columns={columns} data={concessions} />
        )}
      </CardContent>
    </Card>
  )
}
