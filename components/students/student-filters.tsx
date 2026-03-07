"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface StudentFiltersProps {
  search?: string
  gradeLevel?: string
  enrollmentStatus?: string
  onSearchChange: (value: string) => void
  onGradeLevelChange: (value: string) => void
  onEnrollmentStatusChange: (value: string) => void
  onReset: () => void
}

export function StudentFilters({
  search,
  gradeLevel,
  enrollmentStatus,
  onSearchChange,
  onGradeLevelChange,
  onEnrollmentStatusChange,
  onReset,
}: StudentFiltersProps) {
  const hasFilters = search || gradeLevel || enrollmentStatus

  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="Search students..."
        value={search || ""}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />

      <Select value={gradeLevel || ""} onValueChange={(value) => onGradeLevelChange(value || "")}>
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Grade Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Grades</SelectItem>
          <SelectItem value="1">Grade 1</SelectItem>
          <SelectItem value="2">Grade 2</SelectItem>
          <SelectItem value="3">Grade 3</SelectItem>
          <SelectItem value="4">Grade 4</SelectItem>
          <SelectItem value="5">Grade 5</SelectItem>
          <SelectItem value="6">Grade 6</SelectItem>
          <SelectItem value="7">Grade 7</SelectItem>
          <SelectItem value="8">Grade 8</SelectItem>
          <SelectItem value="9">Grade 9</SelectItem>
          <SelectItem value="10">Grade 10</SelectItem>
          <SelectItem value="11">Grade 11</SelectItem>
          <SelectItem value="12">Grade 12</SelectItem>
        </SelectContent>
      </Select>

      <Select value={enrollmentStatus || ""} onValueChange={(value) => onEnrollmentStatusChange(value || "")}>
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="withdrawn">Withdrawn</SelectItem>
          <SelectItem value="graduated">Graduated</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" onClick={onReset} size="sm" icon={<X />}>
          Reset
        </Button>
      )}
    </div>
  )
}
