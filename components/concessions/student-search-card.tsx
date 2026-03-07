import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { useStudentsApi } from "@/lib/api2/student/api"

export interface StudentSearchResult {
  id: string
  full_name: string
  id_number: string
  grade_level?: string
}

interface StudentSearchCardProps {
  selectedStudent: StudentSearchResult | null
  onSelectStudent: (student: StudentSearchResult) => void
  onClearStudent: () => void
}

export function StudentSearchCard({
  selectedStudent,
  onSelectStudent,
  onClearStudent,
}: StudentSearchCardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { getStudentsApi } = useStudentsApi()

  // Search for students
  const { data: studentSearchResults, isLoading: isSearching } = useQuery<StudentSearchResult[]>({
    queryKey: ["students-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return []
      const response = await getStudentsApi({ search: searchQuery, limit: 10 })
      return ((response.data as any)?.results as StudentSearchResult[]) || []
    },
    enabled: searchQuery.length >= 2,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Student</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-2.5 size-4 text-muted-foreground"
          />
          <Input
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchQuery.length >= 2 &&
          !isSearching &&
          (studentSearchResults?.length ?? 0) > 0 && (
            <div className="border rounded-lg divide-y">
              {studentSearchResults?.map((student: StudentSearchResult) => (
                <button
                  key={student.id}
                  onClick={() => {
                    onSelectStudent(student)
                    setSearchQuery("")
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">{student.id_number}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{student.grade_level}</div>
                </button>
              ))}
            </div>
          )}

        {selectedStudent && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Selected Student</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {selectedStudent.full_name}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {selectedStudent.id_number}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onClearStudent}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
