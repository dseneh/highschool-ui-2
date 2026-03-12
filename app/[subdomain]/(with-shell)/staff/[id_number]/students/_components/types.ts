export type SectionItem = {
  id?: string
  name?: string
  grade_level?: { id?: string; name?: string } | string
  students_count?: number
}

export type Student = {
  id: string
  id_number: string
  first_name: string
  last_name: string
  full_name: string
  email?: string
  photo?: string
  gender?: string
  status?: string
  grade_average?: number | null
}