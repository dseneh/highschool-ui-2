# EzySchool UI v2 - Design System & Development Guide

> **Mission:** Build a professional, consistent, and intuitive school management system that surpasses v1 in every aspect.

---

## 🎯 Core Principles

### 1. **User-Centric Design**
- Every feature should solve a real user problem
- Minimize clicks to complete common tasks
- Provide clear feedback for all actions
- Design for both novice and power users

### 2. **Visual Hierarchy**
- Important actions should stand out
- Group related information
- Use whitespace effectively
- Maintain consistent spacing (4px, 8px, 12px, 16px, 24px, 32px, 48px)

### 3. **Performance First**
- Lazy load heavy components
- Implement skeleton loaders for all async data
- Optimize images and assets
- Use React Query for intelligent caching

### 4. **Accessibility**
- All interactive elements keyboard accessible
- Proper ARIA labels
- Sufficient color contrast (WCAG AA minimum)
- Screen reader friendly

### 5. **Mobile-Responsive**
- Mobile-first approach
- Touch-friendly targets (44px minimum)
- Responsive tables with horizontal scroll
- Collapsible sidebars

---

## 🎨 Design Tokens

### Colors

```typescript
// Primary - Brand Identity
primary: 'hsl(221.2 83.2% 53.3%)'        // #2563eb (blue-600)
primary-foreground: 'hsl(210 40% 98%)'  // White text on primary

// Semantic Colors
destructive: 'hsl(0 84.2% 60.2%)'       // Red for delete/danger
success: 'hsl(142.1 76.2% 36.3%)'       // Green for success
warning: 'hsl(38 92% 50%)'              // Amber for warnings
info: 'hsl(199 89% 48%)'                // Blue for info

// Neutral Palette
background: 'hsl(0 0% 100%)'            // Body background
foreground: 'hsl(222.2 84% 4.9%)'       // Primary text
card: 'hsl(0 0% 100%)'                  // Card backgrounds
card-foreground: 'hsl(222.2 84% 4.9%)'  // Text on cards
muted: 'hsl(210 40% 96.1%)'             // Subtle backgrounds
muted-foreground: 'hsl(215.4 16.3% 46.9%)' // Subtle text
border: 'hsl(214.3 31.8% 91.4%)'        // Borders
```

### Typography

```typescript
// Font Families
font-sans: 'Inter, system-ui, -apple-system, sans-serif'
font-mono: 'ui-monospace, Menlo, Monaco, monospace'

// Font Sizes
text-xs: '12px / 16px'      // Labels, captions
text-sm: '14px / 20px'      // Body text, secondary info
text-base: '16px / 24px'    // Primary text
text-lg: '18px / 28px'      // Subheadings
text-xl: '20px / 28px'      // Section headers
text-2xl: '24px / 32px'     // Page titles
text-3xl: '30px / 36px'     // Hero titles

// Font Weights
font-normal: 400    // Body text
font-medium: 500    // Emphasized text
font-semibold: 600  // Headings
font-bold: 700      // Strong emphasis
```

### Spacing

```typescript
// Base: 4px
space-1: '4px'    // Tight spacing
space-2: '8px'    // Small gaps
space-3: '12px'   // Medium gaps
space-4: '16px'   // Default spacing
space-5: '20px'   // Section padding
space-6: '24px'   // Large spacing
space-8: '32px'   // Extra large
space-12: '48px'  // Section breaks
space-16: '64px'  // Major divisions
```

### Border Radius

```typescript
rounded-sm: '4px'   // Subtle rounding
rounded: '6px'      // Default (buttons, inputs)
rounded-md: '8px'   // Cards
rounded-lg: '12px'  // Dialogs
rounded-xl: '16px'  // Feature cards
rounded-2xl: '24px' // Hero elements
```

### Shadows

```typescript
shadow-sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
shadow-md: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
shadow-lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
shadow-xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
```

---

## 🧩 Component Architecture

### Component Organization

```
components/
├── ui/                      # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── students/                # Domain-specific components
│   ├── student-card.tsx
│   ├── student-form.tsx
│   ├── student-table.tsx
│   └── student-filters.tsx
├── shared/                  # Reusable components
│   ├── data-table.tsx
│   ├── empty-state.tsx
│   ├── error-boundary.tsx
│   └── page-header.tsx
└── layouts/                 # Layout components
    ├── dashboard-layout.tsx
    └── auth-layout.tsx
```

### Component Patterns

#### 1. **Page Component**
```tsx
// app/[subdomain]/(with-shell)/students/page.tsx
export default function StudentsPage() {
  const { data, isLoading, error } = useStudents()
  
  if (isLoading) return <StudentsSkeleton />
  if (error) return <ErrorDisplay error={error} />
  
  return (
    <PageLayout>
      <PageHeader 
        title="Students"
        action={<AddStudentButton />}
      />
      <StudentFilters />
      <StudentTable data={data} />
    </PageLayout>
  )
}
```

#### 2. **Data Table Component**
```tsx
// components/students/student-table.tsx
interface StudentTableProps {
  data: PaginatedResponse<StudentDto>
  onRowClick?: (student: StudentDto) => void
}

export function StudentTable({ data, onRowClick }: StudentTableProps) {
  const columns = useStudentColumns()
  
  return (
    <DataTable
      columns={columns}
      data={data.results}
      pageCount={Math.ceil(data.count / data.page_size)}
      onRowClick={onRowClick}
    />
  )
}
```

#### 3. **Form Component**
```tsx
// components/students/student-form.tsx
interface StudentFormProps {
  student?: StudentDto
  onSuccess: (student: StudentDto) => void
}

export function StudentForm({ student, onSuccess }: StudentFormProps) {
  const form = useForm<StudentFormData>({
    defaultValues: student,
    resolver: zodResolver(studentSchema)
  })
  
  const { mutate, isPending } = useStudentMutations()
  
  const onSubmit = (data: StudentFormData) => {
    mutate(data, {
      onSuccess: (result) => {
        toast.success('Student saved successfully')
        onSuccess(result)
      }
    })
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <FormActions isLoading={isPending} />
      </form>
    </Form>
  )
}
```

---

## 📊 Data Management

### React Query Patterns

```typescript
// hooks/use-students.ts
export function useStudents(params?: ListStudentsParams) {
  return useQuery<PaginatedResponse<StudentDto>>({
    queryKey: ['students', params],
    queryFn: () => listStudents(subdomain, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: Boolean(subdomain),
  })
}

export function useStudentMutations() {
  const queryClient = getQueryClient()
  
  const create = useMutation({
    mutationFn: (data: CreateStudentCommand) => createStudent(subdomain, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('Student created successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    }
  })
  
  return { create, update, remove }
}
```

### URL State Management

```typescript
// Use URL params for filters, pagination, sorting
const searchParams = useSearchParams()
const router = useRouter()

const updateFilters = (newFilters: Partial<Filters>) => {
  const params = new URLSearchParams(searchParams)
  Object.entries(newFilters).forEach(([key, value]) => {
    if (value) params.set(key, String(value))
    else params.delete(key)
  })
  router.push(`?${params.toString()}`)
}
```

---

## 🎭 UI/UX Guidelines

### Loading States

```tsx
// Always provide skeleton loaders
function StudentsPage() {
  const { data, isLoading } = useStudents()
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  
  return <StudentTable data={data} />
}
```

### Empty States

```tsx
// Provide helpful empty states
function EmptyStudents() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <UsersIcon className="size-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No students yet</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Get started by adding your first student
      </p>
      <Button>
        <PlusIcon className="size-4 mr-2" />
        Add Student
      </Button>
    </div>
  )
}
```

### Error States

```tsx
// Clear error messages with recovery options
function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {getErrorMessage(error)}
      </AlertDescription>
      <Button variant="outline" onClick={onRetry} className="mt-4">
        Try Again
      </Button>
    </Alert>
  )
}
```

### Toast Notifications

```tsx
// Consistent toast messages
toast.success('Student created successfully')
toast.error('Failed to delete student')
toast.loading('Uploading file...')
toast.info('No changes detected')
```

---

## 📝 Form Patterns

### Form Structure

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const studentSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email').optional(),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  gradeLevel: z.string().min(1, 'Grade level required'),
})

type StudentFormData = z.infer<typeof studentSchema>

export function StudentForm() {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    }
  })
  
  return (
    <Form {...form}>
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
    </Form>
  )
}
```

---

## 🗂️ File Structure Standards

### Feature-Based Organization

```
app/[subdomain]/(with-shell)/students/
├── page.tsx                    # List page
├── layout.tsx                  # Students section layout
├── [id]/
│   ├── layout.tsx              # Detail layout with tabs
│   ├── page.tsx                # Overview (redirect)
│   ├── overview/
│   │   └── page.tsx
│   ├── details/
│   │   └── page.tsx
│   ├── grades/
│   │   └── page.tsx
│   └── billing/
│       └── page.tsx

components/students/
├── student-card.tsx
├── student-form.tsx
├── student-table.tsx
├── student-filters.tsx
├── student-detail-header.tsx
├── student-overview-tab.tsx
└── student-billing-tab.tsx

lib/api/
├── student-types.ts
├── student-service.ts
└── student-hooks.ts
```

---

## 🔒 Security & Permissions

### Permission Guards

```tsx
// Wrap protected routes
<PermissionGuard requiredPermissions={['students.view']}>
  <StudentsPage />
</PermissionGuard>

// Conditional rendering
{hasPermission('students.edit') && (
  <Button>Edit Student</Button>
)}
```

---

## ✅ Quality Checklist

Before shipping any feature, ensure:

- [ ] **TypeScript** - No `any` types, full type coverage
- [ ] **Loading States** - Skeleton loaders for all async data
- [ ] **Error Handling** - Try/catch with user-friendly messages
- [ ] **Empty States** - Helpful messages and CTAs
- [ ] **Responsive** - Works on mobile, tablet, desktop
- [ ] **Accessible** - Keyboard navigation, ARIA labels
- [ ] **Performance** - React Query caching, lazy loading
- [ ] **Validation** - Zod schemas for all forms
- [ ] **Feedback** - Success/error toasts for mutations
- [ ] **Naming** - Clear, consistent naming conventions
- [ ] **Comments** - Complex logic documented
- [ ] **Tests** - Critical paths covered (when possible)

---

## 📐 Layout Patterns

### Page Header

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold mb-2">Students</h1>
    <p className="text-muted-foreground">
      Manage student enrollment and records
    </p>
  </div>
  <Button>
    <PlusIcon className="size-4 mr-2" />
    Add Student
  </Button>
</div>
```

### Card Layout

```tsx
<div className="rounded-xl border bg-card p-6">
  <h2 className="text-sm font-semibold mb-4">Personal Information</h2>
  <dl className="space-y-3">
    <div className="flex items-center justify-between">
      <dt className="text-sm text-muted-foreground">Full Name</dt>
      <dd className="text-sm font-medium">{student.fullName}</dd>
    </div>
  </dl>
</div>
```

---

## 🚀 Performance Optimization

1. **Code Splitting** - Lazy load heavy components
2. **Image Optimization** - Use Next.js Image component
3. **Query Caching** - React Query with appropriate stale times
4. **Debounced Search** - Wait 300ms before API call
5. **Virtual Scrolling** - For large lists (1000+ items)
6. **Pagination** - Server-side pagination for all lists
7. **Optimistic Updates** - Update UI before API response

---

## 🎯 Success Metrics

- **Page Load** - < 2s on 3G
- **Time to Interactive** - < 3s
- **Lighthouse Score** - > 90
- **Zero Console Errors** - Clean console
- **Accessibility Score** - > 95

---

## 📚 Reference Links

- [shadcn/ui Components](https://ui.shadcn.com)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)
- [Zod Validation](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)

---

**Last Updated:** February 10, 2026
**Version:** 2.0.0
