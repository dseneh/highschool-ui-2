import { useState } from "react"
import { Button } from "@/components/ui/button"
import { History, Edit2 } from "lucide-react"
import { GradeHistoryModal } from "./grade-history-modal"
import { GradeCorrectionModal } from "./grade-correction-modal"

interface Grade {
  id: string
  student: {
    id: string
    first_name: string
    last_name: string
  }
  score: number | null
  assessment: {
    max_score: number
  }
  status: string
}

interface GradeCorrectionsTabProps {
  grades: Grade[]
  isLoading?: boolean
  onGradeUpdate?: () => void
}

export function GradeCorrectionsTab({
  grades,
  isLoading,
  onGradeUpdate,
}: GradeCorrectionsTabProps) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)

  const handleViewHistory = (grade: Grade) => {
    setSelectedGrade(grade)
    setHistoryOpen(true)
  }

  const handleCorrectGrade = (grade: Grade) => {
    setSelectedGrade(grade)
    setCorrectionOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading grades...</div>
  }

  if (grades.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No grades to correct</div>
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Make corrections to grades. Each change is tracked with a timestamp and reason.
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Student</th>
              <th className="text-left py-3 px-4 font-medium">Current Score</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  {grade.student.first_name} {grade.student.last_name}
                </td>
                <td className="py-3 px-4">
                  {grade.score !== null
                    ? `${grade.score} / ${grade.assessment.max_score}`
                    : "—"}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {grade.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewHistory(grade)}
                      className="gap-1"
                    >
                      <History className="h-3 w-3" />
                      History
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleCorrectGrade(grade)}
                      className="gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Correct
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* History Modal */}
      {selectedGrade && (
        <GradeHistoryModal
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          gradeId={selectedGrade.id}
          studentName={`${selectedGrade.student.first_name} ${selectedGrade.student.last_name}`}
        />
      )}

      {/* Correction Modal */}
      {selectedGrade && (
        <GradeCorrectionModal
          open={correctionOpen}
          onOpenChange={setCorrectionOpen}
          gradeId={selectedGrade.id}
          studentName={`${selectedGrade.student.first_name} ${selectedGrade.student.last_name}`}
          currentScore={selectedGrade.score}
          maxScore={selectedGrade.assessment.max_score}
          onSuccess={() => {
            setSelectedGrade(null)
            onGradeUpdate?.()
          }}
        />
      )}
    </div>
  )
}
