import { Button } from "@/components/ui/button"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state"
import { Users } from "lucide-react"

interface EmptyStudentsProps {
  onAddStudent?: () => void
}

export function EmptyStudents({ onAddStudent }: EmptyStudentsProps) {
  return (
    <EmptyState>
      <EmptyStateIcon className="p-4 [&_svg]:size-10">
        <Users />
      </EmptyStateIcon>
      <EmptyStateTitle>No students yet</EmptyStateTitle>
      <EmptyStateDescription>
        Get started by adding your first student to the system. You can add their
        information, upload photos, and manage their enrollment.
      </EmptyStateDescription>
      {onAddStudent && (
        <EmptyStateAction>
          <Button onClick={onAddStudent}>Add Your First Student</Button>
        </EmptyStateAction>
      )}
    </EmptyState>
  )
}
