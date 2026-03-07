# Technical Implementation Patterns

> **Purpose:** Document v1 patterns and their v2 adaptations for consistent, high-quality implementation.

---

## 📁 Folder Structure Comparison

### V1 Structure
```
src/
├── app/
│   └── (protected-pages)/
│       └── [branchId]/
│           └── students/
│               ├── page.tsx
│               ├── types.ts
│               ├── api.ts
│               ├── _components/
│               │   ├── ListTable.tsx
│               │   └── EnrollDialog.tsx
│               ├── _store/
│               │   └── useStudentStore.ts
│               └── [studentId]/
│                   └── page.tsx
├── @types/
│   └── index.ts
└── api/
    └── student/
        └── index.ts
```

### V2 Structure (Improved)
```
app/
└── [subdomain]/
    └── (with-shell)/
        └── students/
            ├── page.tsx
            ├── layout.tsx
            └── [id]/
                ├── layout.tsx
                ├── overview/
                ├── details/
                ├── grades/
                └── billing/

components/
└── students/
    ├── student-table.tsx
    ├── student-form.tsx
    ├── student-filters.tsx
    ├── enroll-dialog.tsx
    └── ...

lib/
├── api/
│   ├── student-types.ts
│   ├── student-service.ts
│   └── student-hooks.ts (NEW: separate hooks)
└── store/
    └── student-store.ts

hooks/
└── use-student.ts (alternate location)
```

**Key Improvements:**
- ✅ Hooks separated from services (better tree-shaking)
- ✅ Components in shared folder (reusable across app)
- ✅ Layout files for nested routes
- ✅ API organized by concern (types, service, hooks)

---

## 🔄 API Pattern Evolution

### V1 Pattern
```typescript
// src/api/student/index.ts
import { fetcher } from 'src/api'
import { useApiQuery, useApiMutation } from 'src/hooks/useApi'

export const useStudents = () => {
  return useApiQuery<Student[]>({
    queryKey: ['students'],
    queryFn: () => fetcher.get('/students/'),
  })
}

export const useCreateStudent = () => {
  return useApiMutation({
    mutationFn: (data: StudentCreateType) => 
      fetcher.post('/students/', data),
    invalidateQueries: ['students'],
  })
}
```

### V2 Pattern (Improved)
```typescript
// lib/api/student-service.ts
import { apiClient } from '@/lib/api-client'
import type { StudentDto, CreateStudentCommand } from './student-types'

export async function listStudents(
  subdomain: string,
  params?: ListStudentsParams
): Promise<PaginatedResponse<StudentDto>> {
  const response = await apiClient.get<PaginatedResponse<StudentDto>>(
    `/students/`,
    {
      params,
      headers: { 'x-tenant': subdomain }
    }
  )
  return response.data
}

export async function createStudent(
  subdomain: string,
  data: CreateStudentCommand
): Promise<StudentDto> {
  const response = await apiClient.post<StudentDto>(
    `/students/`,
    data,
    {
      headers: { 'x-tenant': subdomain }
    }
  )
  return response.data
}

// hooks/use-student.ts (SEPARATE FILE)
import { useQuery, useMutation, getQueryClient } from '@tanstack/react-query'
import { useTenantSubdomain } from '@/hooks/use-tenant-subdomain'
import * as studentService from '@/lib/api/student-service'

export function useStudents(params?: ListStudentsParams) {
  const subdomain = useTenantSubdomain()
  
  return useQuery({
    queryKey: ['students', subdomain, params],
    queryFn: () => studentService.listStudents(subdomain, params),
    enabled: Boolean(subdomain),
  })
}

export function useStudentMutations() {
  const subdomain = useTenantSubdomain()
  const queryClient = getQueryClient()
  
  const create = useMutation({
    mutationFn: (data: CreateStudentCommand) => 
      studentService.createStudent(subdomain, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', subdomain] })
      toast.success('Student created successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    }
  })
  
  return { create }
}
```

**Key Improvements:**
- ✅ Service functions are pure (no hooks) - testable
- ✅ Hooks in separate file - only imports in React components
- ✅ Subdomain auto-injected via hook
- ✅ Better error handling with toast feedback
- ✅ Type-safe with proper generics

---

## 📊 DataTable Pattern

### V1 Implementation
```typescript
// V1: src/app/.../students/_components/ListTable.tsx
'use client'

export function StudentListTable() {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page') || '1')
  const limit = Number(searchParams.get('limit') || '10')
  
  const { data, isLoading } = useStudents({ page, limit })
  const { selectedIds, toggleSelection } = useStudentStore()
  
  const columns = [
    // ... column definitions
  ]
  
  return (
    <DataTable
      columns={columns}
      data={data?.results || []}
      pageCount={data?.totalPages || 0}
      selectedIds={selectedIds}
      onSelectionChange={toggleSelection}
    />
  )
}
```

### V2 Implementation (Enhanced)
```typescript
// components/students/student-table.tsx
'use client'

import { useDataTable } from '@/hooks/use-data-table'
import { DataTable } from '@/components/shared/data-table'
import { studentColumns } from './student-columns'

interface StudentTableProps {
  data: PaginatedResponse<StudentDto>
  isLoading?: boolean
}

export function StudentTable({ data, isLoading }: StudentTableProps) {
  const table = useDataTable({
    data: data.results,
    columns: studentColumns,
    pageCount: Math.ceil(data.count / data.page_size),
    // Auto-syncs with URL
  })
  
  if (isLoading) {
    return <StudentTableSkeleton />
  }
  
  return (
    <DataTable
      table={table}
      columns={studentColumns}
      searchPlaceholder="Search students..."
      onRowClick={(row) => {
        router.push(`/students/${row.id}`)
      }}
    />
  )
}

// components/students/student-columns.tsx
export const studentColumns: ColumnDef<StudentDto>[] = [
  {
    accessorKey: 'studentNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student #" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('studentNumber')}</span>
    ),
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Name" />
    ),
    cell: ({ row }) => {
      const student = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={student.photoUrl} />
            <AvatarFallback>
              {student.firstName[0]}{student.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{student.fullName}</div>
            <div className="text-sm text-muted-foreground">
              {student.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'gradeLevel',
    header: 'Grade',
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue('gradeLevel')}</Badge>
    ),
  },
  {
    accessorKey: 'enrollmentStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('enrollmentStatus') as string
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <StudentRowActions student={row.original} />,
  },
]
```

**Key Improvements:**
- ✅ Columns in separate file (reusable, testable)
- ✅ Rich cell rendering with Avatar, Badge
- ✅ Row actions dropdown
- ✅ Sortable headers out of the box
- ✅ Type-safe column definitions

---

## 📝 Form Pattern

### V2 Implementation
```typescript
// components/students/student-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const studentFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gradeLevel: z.string().min(1, 'Please select a grade level'),
  section: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentFormSchema>

interface StudentFormProps {
  student?: StudentDto
  onSuccess?: (student: StudentDto) => void
  onCancel?: () => void
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const isEditing = Boolean(student)
  const { create, update } = useStudentMutations()
  
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: student ? {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      phoneNumber: student.phoneNumber || '',
      dateOfBirth: student.dateOfBirth,
      gradeLevel: student.gradeLevel,
      section: student.section || '',
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      gradeLevel: '',
      section: '',
    }
  })
  
  const onSubmit = (data: StudentFormData) => {
    const mutation = isEditing
      ? update.mutateAsync({ id: student!.id, ...data })
      : create.mutateAsync(data)
    
    mutation.then((result) => {
      onSuccess?.(result)
    })
  }
  
  const isPending = create.isPending || update.isPending
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="john.doe@example.com" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Optional. Used for student portal access.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Birth</FormLabel>
              <DatePicker
                date={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="gradeLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Grade 1</SelectItem>
                  <SelectItem value="2">Grade 2</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  {/* ... more grades */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Student' : 'Create Student'}
          </Button>
          
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
```

**Key Features:**
- ✅ Zod schema validation
- ✅ Type-safe form data
- ✅ Create/Edit mode support
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility (labels, descriptions)
- ✅ Responsive layout

---

## 🎨 Page Layout Pattern

### V2 Implementation
```typescript
// app/[subdomain]/(with-shell)/students/page.tsx
import { Suspense } from 'react'
import { StudentList } from '@/components/students/student-list'
import { StudentListSkeleton } from '@/components/students/student-list-skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

export const metadata = {
  title: 'Students',
  description: 'Manage student enrollment and records',
}

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage student enrollment and records"
        action={
          <Button>
            <PlusIcon className="size-4 mr-2" />
            Add Student
          </Button>
        }
      />
      
      <Suspense fallback={<StudentListSkeleton />}>
        <StudentList />
      </Suspense>
    </div>
  )
}

// components/students/student-list.tsx
'use client'

export function StudentList() {
  const searchParams = useSearchParams()
  const params = {
    page: Number(searchParams.get('page') || '1'),
    page_size: Number(searchParams.get('page_size') || '20'),
    search: searchParams.get('search') || undefined,
    grade_level: searchParams.get('grade_level') || undefined,
  }
  
  const { data, isLoading, error } = useStudents(params)
  
  if (error) {
    return <ErrorDisplay error={error} />
  }
  
  if (isLoading) {
    return <StudentTableSkeleton />
  }
  
  if (!data || data.results.length === 0) {
    return <EmptyStudents />
  }
  
  return (
    <div className="space-y-4">
      <StudentFilters />
      <StudentTable data={data} />
    </div>
  )
}
```

---

## 🎯 Dialog/Modal Pattern

```typescript
// components/students/create-student-dialog.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StudentForm } from './student-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CreateStudentDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  
  const handleSuccess = (student: StudentDto) => {
    setOpen(false)
    router.push(`/students/${student.id}`)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student's information below.
          </DialogDescription>
        </DialogHeader>
        <StudentForm 
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🔍 Search & Filter Pattern

```typescript
// components/students/student-filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useDebouncedCallback } from 'use-debounce'

export function StudentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to page 1 when filtering
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }
  
  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateFilter('search', value)
  }, 300)
  
  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="Search students..."
        defaultValue={searchParams.get('search') || ''}
        onChange={(e) => debouncedSearch(e.target.value)}
        className="max-w-sm"
      />
      
      <Select
        value={searchParams.get('grade_level') || ''}
        onValueChange={(value) => updateFilter('grade_level', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Grade Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Grades</SelectItem>
          <SelectItem value="1">Grade 1</SelectItem>
          <SelectItem value="2">Grade 2</SelectItem>
          {/* ... */}
        </SelectContent>
      </Select>
    </div>
  )
}
```

---

## 📱 Responsive Pattern

```typescript
// Use mobile hook
import { useIsMobile } from '@/hooks/use-mobile'

export function StudentCard({ student }: { student: StudentDto }) {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <StudentCardMobile student={student} />
  }
  
  return <StudentCardDesktop student={student} />
}
```

---

## ✅ Summary

**Adoption Checklist:**

- [ ] Use service + hooks pattern (not combined)
- [ ] Separate column definitions from tables
- [ ] Implement Zod schemas for all forms
- [ ] Add skeleton loaders for all async content
- [ ] Use URL params for filters/pagination
- [ ] Implement empty states with CTAs
- [ ] Add error boundaries
- [ ] Use toast notifications consistently
- [ ] Make all interactions keyboard accessible
- [ ] Test mobile responsiveness

---

**Last Updated:** February 10, 2026
