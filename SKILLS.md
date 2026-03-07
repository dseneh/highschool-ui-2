# EzySchool v2 - AI Development Skills

> **Quick reference guide for AI-assisted development. Patterns, conventions, and quality standards.**

---

## 🎯 Project Context

- **Framework:** Next.js 14+ App Router
- **Language:** TypeScript (strict mode, no `any`)
- **UI:** React 19 + Tailwind CSS + shadcn/ui
- **State:** React Query v5 for server state, URL params for filters
- **API:** Axios with tenant headers (localhost:8000/api/v1)
- **Multi-tenancy:** Subdomain-based routing (`[subdomain]` dynamic route)

---

## 📁 File Organization

### V1 Folder Structure (Reference)
```
src/app/
  ├── (auth-pages)/             # Public auth routes
  ├── (public-pages)/           # Public routes
  ├── (protected-pages)/        # Protected routes
  │   ├── a/                    # Admin routes (/a/dashboard)
  │   │   └── (main)/
  │   │       ├── dashboard/
  │   │       ├── configuration/
  │   │       └── schools/
  │   └── s/                    # School/workspace routes (/s/schoolname/students)
  │       └── [workspace]/      # Dynamic workspace
  │           ├── (main)/       # Main layout group
  │           │   ├── students/
  │           │   │   ├── page.tsx           # List page
  │           │   │   ├── types.ts           # Co-located types
  │           │   │   ├── api.ts             # Co-located API
  │           │   │   ├── _components/       # Private folder
  │           │   │   └── [studentId]/       # Detail routes
  │           │   │       ├── layout.tsx     # Tabs layout
  │           │   │       ├── overview/page.tsx
  │           │   │       └── billing/page.tsx
  │           │   ├── employees/
  │           │   └── finance/
  │           └── (public)/     # Public workspace routes
  └── api/                      # API routes
```

**V1 Approach:** Path-based multi-tenancy on single domain
- `/a/dashboard` → Platform admin
- `/s/schoolname/students` → School-specific
- **Why it existed:** Single domain, needed URL distinction

---

### V2 Folder Structure (Subdomain-Based)
```
app/
  ├── login/                    # Root login page
  ├── [subdomain]/              # Tenant-specific routes
  │   ├── (with-shell)/         # Authenticated layout
  │   │   ├── dashboard/
  │   │   │   └── page.tsx              # schoolname.ezyschool.com/dashboard
  │   │   ├── students/
  │   │   │   ├── page.tsx              # List page
  │   │   │   ├── layout.tsx            # Section layout
  │   │   │   └── [id]/
  │   │   │       ├── layout.tsx        # Tabs layout
  │   │   │       ├── page.tsx          # Redirect to overview
  │   │   │       ├── overview/page.tsx
  │   │   │       ├── details/page.tsx
  │   │   │       ├── billing/page.tsx
  │   │   │       ├── grades/page.tsx
  │   │   │       ├── attendance/page.tsx
  │   │   │       └── settings/page.tsx
  │   │   ├── employees/
  │   │   ├── finance/
  │   │   ├── staff/
  │   │   └── schools/          # Admin only (permission-guarded)
  │   └── login/
  └── api/

components/
  ├── ui/                       # shadcn/ui base components
  ├── shared/                   # Reusable components
  │   ├── data-table.tsx
  │   ├── page-header.tsx
  │   ├── empty-state.tsx
  │   └── error-display.tsx
  └── students/                 # Domain-specific
      ├── student-table.tsx
      ├── student-columns.tsx
      ├── student-form.tsx
      └── student-filters.tsx

lib/api/
  ├── student-types.ts          # DTOs, commands, params
  ├── student-service.ts        # API functions (pure)
  └── client.ts                 # Axios instance

hooks/
  └── use-student.ts            # React Query hooks
```

**V2 Approach:** Subdomain-based multi-tenancy + permissions
- `schoolname.ezyschool.com/students` → School routes
- `admin.ezyschool.com/schools` → Platform admin (different subdomain)
- OR same routes with permission guards (admin sees extra menu items)
- **No /a/ or /s/ needed** - subdomain handles separation

---

### Handling Admin vs School Routes

**Option 1: Separate Subdomains** (Recommended)
```
schoolname.ezyschool.com    → School features
admin.ezyschool.com         → Platform admin features
```

**Option 2: Same Routes + Permission Guards**
```typescript
// Same URL, different access
app/[subdomain]/(with-shell)/
  ├── students/         # All users with permission
  ├── finance/          # All users with permission
  └── schools/          # Admin only (PermissionGuard)

// In layout or page
<PermissionGuard requiredRole="platform_admin">
  <SchoolsManagement />
</PermissionGuard>
```

**Option 3: Route Groups for Organization** (Clean codebase)
```
app/[subdomain]/(with-shell)/
  ├── (school-features)/    # Route group - no URL impact
  │   ├── students/         → /students
  │   ├── finance/          → /finance
  │   └── dashboard/        → /dashboard
  └── (admin-features)/     # Route group - no URL impact
      ├── schools/          → /schools (admin only)
      └── configuration/    → /configuration (admin only)
```

All render as `schoolname.ezyschool.com/students`, just organized in code.

---

### Key Patterns from V1
- ✅ **Route Groups with ()** - Organize without affecting URL
- ✅ **Private Folders with _** - Not included in routing (_components, _store)
- ✅ **Co-located Files** - types.ts, api.ts next to page.tsx
- ✅ **Tab Routes** - Subdirectories for detail tabs

### V2 Improvements
- ✅ **No Path Prefixes** - Clean URLs with subdomain separation
- ✅ **Separated Concerns** - Services, hooks, types in lib/ not co-located
- ✅ **Simpler Paths** - `/students` vs `/s/[workspace]/(main)/students`
- ✅ **Shared Components** - In components/ not per-page _components/
- ✅ **Permission-Based Access** - Same routes, middleware controls visibility
- ✅ **Better Tree-Shaking** - Hooks separate from services

### Naming Conventions
- **Components:** PascalCase (`StudentTable.tsx`)
- **Hooks:** camelCase with `use` prefix (`use-student.ts`)
- **Types:** PascalCase with suffix (`StudentDto`, `CreateStudentCommand`)
- **API functions:** camelCase (`listStudents`, `createStudent`)
- **Files:** kebab-case (`student-table.tsx`)
- **Private Folders:** Underscore prefix (`_components/`, `_store/`)
- **Route Groups:** Parentheses `(with-shell)`, `(main)` - not in URL
- **Co-located Files:** `types.ts`, `api.ts` next to `page.tsx` (V1 pattern)

---

## � Authentication Pattern

### Username Field (Multi-Format)
```typescript
// Accept email, username, OR ID number in single field
<Input
  id="username"
  type="text"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  placeholder="you@school.com, ID123, or your username"
  autoComplete="username"
/>

// Login submission
await login({
  workspace: subdomain,
  credentials: { username: username.trim(), password },
  user: { username: username.trim() },
})
```

**Rules:**
- ✅ Single field accepts multiple formats (email, ID, username)
- ✅ Use `type="text"` NOT `type="email"` (allows all formats)
- ✅ Clear placeholder showing all accepted formats
- ✅ Backend handles detection of format type
- ✅ Store last used value for convenience
- ✅ Real Django backend at `localhost:8000/api/v1/auth/login/`
- ✅ Portable-auth handles API calls + session cookies
- ✅ JWT tokens (access + refresh) stored in encrypted cookie

### Backend Configuration
```typescript
// lib/portable-auth-config.ts
backend: {
  baseUrl: "http://localhost:8000",              // Django backend
  loginPath: "/api/v1/auth/login/",              // POST username + password
  refreshPath: "/api/v1/auth/token/refresh/",    // Token refresh
  buildHeaders: (tenant) => ({
    "X-Tenant": tenant.workspace,                 // Required header (matches Django CORS)
  }),
  parseLoginResponse: (data) => ({
    tokens: {
      accessToken: data.access,                   // Django: { access, refresh, user }
      refreshToken: data.refresh,
    },
    user: data.user,
  }),
}
```

### Auth Persistence & API Calls (V1 Pattern)

**Authentication Flow:**
1. User logs in → JWT tokens stored in encrypted HttpOnly cookie
2. Client axios calls `/api/auth/token` → returns access token from session
3. Axios interceptor adds `Authorization: Bearer {token}` to API requests
4. Django backend validates token + tenant header

**Token Endpoint** (`/api/auth/token`):
```typescript
// app/api/auth/token/route.ts
export async function GET(req: Request) {
  const { session } = await getServerSession(authConfig, req);
  if (!session?.tokens?.accessToken) {
    return NextResponse.json({ accessToken: null }, { status: 401 });
  }
  return NextResponse.json({
    accessToken: session.tokens.accessToken,
    user: session.user,
  });
}
```

**Axios Client with Interceptors** (`lib/api-client.ts`):
```typescript
// Fetch token from session endpoint
async function getAccessToken(): Promise<string | null> {
  const res = await fetch("/api/auth/token", {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  return data?.accessToken ?? null;
}

// Request interceptor
apiClient.interceptors.request.use(async (config) => {
  // Add Authorization header
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  // Add tenant header
  const subdomain = getSubdomainFromWindow();
  if (subdomain) {
    config.headers["X-Tenant"] = subdomain;
  }
  
  return config;
});
```

**Why This Pattern:**
- ✅ Tokens stay in HttpOnly cookie (secure, can't be stolen by XSS)
- ✅ Client-side axios can still make authenticated API calls
- ✅ Token refresh handled automatically by portable-auth
- ✅ Works with Django's Bearer token authentication
- ✅ Persistent sessions across page reloads

---

## �🔄 API Pattern (CRITICAL)

### Service Layer (Pure Functions)
```typescript
// lib/api/student-service.ts
export async function listStudents(
  subdomain: string,
  params?: ListStudentsParams
): Promise<PaginatedResponse<StudentDto>> {
  const response = await apiClient.get<PaginatedResponse<StudentDto>>(
    `/students/`,
    { params, headers: { 'x-tenant': subdomain } }
  )
  return response.data
}
```

### Hook Layer (React Query)
```typescript
// hooks/use-student.ts
export function useStudents(params?: ListStudentsParams) {
  const subdomain = useTenantSubdomain()
  return useQuery({
    queryKey: ['students', subdomain, params],
    queryFn: () => listStudents(subdomain, params),
    enabled: Boolean(subdomain),
  })
}

export function useStudentMutations() {
  const subdomain = useTenantSubdomain()
  const queryClient = getQueryClient()
  
  const create = useMutation({
    mutationFn: (data: CreateStudentCommand) => 
      createStudent(subdomain, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', subdomain] })
      toast.success('Student created successfully')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    }
  })
  
  return { create, update, remove, withdraw }
}
```

**Rules:**
- ✅ Services are pure functions (no hooks)
- ✅ Hooks in separate file from services
- ✅ Always include subdomain in queryKey
- ✅ Toast notifications in onSuccess/onError
- ✅ Invalidate queries after mutations

---

## 📊 DataTable Pattern

### Column Definitions (Separate File)
```typescript
// components/students/student-columns.tsx
export const studentColumns: ColumnDef<StudentDto>[] = [
  {
    accessorKey: 'studentNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student #" />
    ),
    cell: ({ row }) => (
      <span className="font-mono">{row.getValue('studentNumber')}</span>
    ),
  },
  {
    accessorKey: 'fullName',
    header: 'Full Name',
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
    id: 'actions',
    cell: ({ row }) => <StudentRowActions student={row.original} />,
  },
]
```

### Table Component
```typescript
// components/students/student-table.tsx
export function StudentTable({ data }: { data: PaginatedResponse<StudentDto> }) {
  return (
    <DataTable
      columns={studentColumns}
      data={data.results}
      pageCount={Math.ceil(data.count / data.page_size)}
    />
  )
}
```

**Rules:**
- ✅ Columns in separate file
- ✅ Rich cell rendering (Avatar, Badge, etc.)
- ✅ Row actions in dropdown menu
- ✅ Sortable headers

---

## 📝 Form Pattern

### With Zod Validation
```typescript
const studentSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  gradeLevel: z.string().min(1, 'Grade level required'),
})

type StudentFormData = z.infer<typeof studentSchema>

export function StudentForm({ student, onSuccess }: StudentFormProps) {
  const { create, update } = useStudentMutations()
  const isEditing = Boolean(student)
  
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student || {}
  })
  
  const onSubmit = (data: StudentFormData) => {
    const mutation = isEditing 
      ? update.mutateAsync({ id: student!.id, ...data })
      : create.mutateAsync(data)
    
    mutation.then(onSuccess)
  }
  
  const isPending = create.isPending || update.isPending
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields */}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 animate-spin" />}
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  )
}
```

**Rules:**
- ✅ Zod schema for validation
- ✅ Type inference from schema
- ✅ Support create/edit modes
- ✅ Show loading state
- ✅ Handle success callback

---

## 🎨 UI Patterns

### Page Structure
```typescript
export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage student enrollment"
        action={<Button>Add Student</Button>}
      />
      <Suspense fallback={<Skeleton />}>
        <StudentList />
      </Suspense>
    </div>
  )
}
```

### Loading States
```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

### Empty States
```typescript
<div className="flex flex-col items-center py-12">
  <UsersIcon className="size-16 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No students yet</h3>
  <p className="text-sm text-muted-foreground mb-6">
    Get started by adding your first student
  </p>
  <Button>Add Student</Button>
</div>
```

### Error States
```typescript
<Alert variant="destructive">
  <AlertCircleIcon className="size-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>{getErrorMessage(error)}</AlertDescription>
  <Button variant="outline" onClick={onRetry}>Try Again</Button>
</Alert>
```

---

## 🔍 Search & Filter Pattern

### URL-Based State
```typescript
export function StudentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set('page', '1') // Reset to page 1
    router.push(`?${params.toString()}`)
  }
  
  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateFilter('search', value)
  }, 300)
  
  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search..."
        defaultValue={searchParams.get('search') || ''}
        onChange={(e) => debouncedSearch(e.target.value)}
      />
      <Select
        value={searchParams.get('grade') || ''}
        onValueChange={(v) => updateFilter('grade', v)}
      >
        {/* Options */}
      </Select>
    </div>
  )
}
```

**Rules:**
- ✅ Use URL params for all filters
- ✅ Debounce search input (300ms)
- ✅ Reset to page 1 on filter change
- ✅ Read params in data hooks

---

## 💰 Currency Display Pattern

### Always Use Dynamic Currency from API
```typescript
// ✅ CORRECT - Use currency from payload, default to '$'
const currency = student.billing_summary?.currency || '$'
return <span>{currency}{amount.toLocaleString()}</span>

// ❌ WRONG - Hardcoded currency symbol
return <span>₦{amount.toLocaleString()}</span>
return <span>${amount.toLocaleString()}</span>
```

**Rules:**
- ✅ Always read currency from API payload
- ✅ Default to `$` if currency field is null/missing
- ✅ Never hardcode currency symbols (₦, €, £, ¥, etc.)
- ✅ Currency field should be at the same level as amount
- ✅ Format: `{currency}{amount}` without space

---

## 🎨 Student Detail Page Design Pattern

### Modern Profile Header
```typescript
// Clean header with large avatar + info badges
<div className="rounded-xl border bg-card">
  {/* Back button + actions */}
  <div className="px-6 pt-6 pb-4">
    <Button variant="ghost" onClick={onBack}>Back</Button>
  </div>

  Note: The <Button></Button> component has, in addition to other props: 
  - icon
  - iconRight
  - iconLeft
  - loading
  - loadingText
  Please use them accordingly for a better ui implementation
  
  {/* Profile section */}
  <div className="px-6 pb-6">
    <Avatar className="size-24 ring-4 ring-background" />
    <h1 className="text-2xl font-bold">{name}</h1>
    <p className="text-sm text-muted-foreground">ID: {id}</p>
    
    {/* Status badges */}
    <div className="flex gap-2">
      <Badge variant="default">Enrolled</Badge>
      <Badge variant="secondary">Grade 12</Badge>
    </div>
    
    {/* Contact info with icons */}
    <div className="flex gap-4 text-sm">
      <Icon /> Age: {age} years
      <Icon /> {email}
      <Icon /> {phone}
    </div>
  </div>
</div>
```

### Metrics Cards with Progress Indicators
```typescript
// 3-column grid with circular progress
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>
    <p className="text-sm text-muted-foreground">Subjects</p>
    <p className="text-3xl font-bold">8</p>
    <CircularProgress value={100} />
  </Card>
  
  <Card>
    <p className="text-sm">Grade Average</p>
    <p className="text-3xl font-bold">72.4%</p>
    <CircularProgress value={72.4} />
  </Card>
  
  <Card>
    <p className="text-sm">Balance Due</p>
    <p className="text-3xl font-bold">${21,100}</p>
    <CircularProgress value={44} className="text-amber-500" />
  </Card>
</div>
```

### Bill Summary Table
```typescript
// Clean table with separator lines
<Card className="p-6">
  <h2 className="text-lg font-semibold mb-6">Bill Summary</h2>
  
  {rows.map(row => (
    <>
      <div className="flex justify-between py-3">
        <span className="text-sm font-medium">{row.label}</span>
        <span className="text-sm font-semibold">{currency}{row.value}</span>
      </div>
      <Separator />
    </>
  ))}
  
  {/* Highlighted balance */}
  <div className="flex justify-between py-3">
    <span className="font-semibold">Balance Due</span>
    <span className="text-lg font-bold text-destructive">{currency}{balance}</span>
  </div>
</Card>
```

**Key Design Elements:**
- ✅ Large avatar (96x96) with ring border
- ✅ Status badge with indicator dot for active states
- ✅ Icon + text rows for contact info
- ✅ Circular progress for visual metrics
- ✅ Color coding: green (paid), red (overdue), amber (partial)
- ✅ Clean separators between bill items
- ✅ Responsive grid layouts

---

## 🎨 Design Tokens

### Spacing
```typescript
space-1: 4px    // Tight
space-2: 8px    // Small
space-3: 12px   // Medium
space-4: 16px   // Default
space-6: 24px   // Large
space-8: 32px   // XL
```

### Typography
```typescript
text-xs: 12px   // Labels
text-sm: 14px   // Body
text-base: 16px // Primary
text-lg: 18px   // Subheading
text-xl: 20px   // Section header
text-2xl: 24px  // Page title
```

### Colors
```typescript
primary: blue-600        // Brand
destructive: red-500     // Danger
success: green-600       // Success
warning: amber-500       // Warning
muted: gray-100         // Subtle BG
muted-foreground: gray-600 // Subtle text
```

---

## ✅ Quality Checklist

Before any feature is complete:

- [ ] **TypeScript:** No `any`, full type coverage
- [ ] **Loading:** Skeleton loaders for async data
- [ ] **Error:** Try/catch with user messages
- [ ] **Empty:** Helpful empty states with CTAs
- [ ] **Responsive:** Mobile, tablet, desktop tested
- [ ] **Accessible:** Keyboard nav, ARIA labels
- [ ] **Performance:** React Query caching enabled
- [ ] **Validation:** Zod schemas for all forms
- [ ] **Feedback:** Toast messages for mutations
- [ ] **Naming:** Clear, consistent conventions

---

## 🚨 Common Mistakes to Avoid

1. ❌ **Don't mix hooks and services**
   - Services should be pure functions
   - Hooks import services, not vice versa

2. ❌ **Don't forget tenant context**
   - Always include `x-tenant` header
   - Always include subdomain in query keys

3. ❌ **Don't use any type**
   - Use proper interfaces/types
   - Use `unknown` if truly dynamic

4. ❌ **Don't forget loading states**
   - Every async operation needs loading UI
   - Use Skeleton components

5. ❌ **Don't skip error handling**
   - Wrap mutations in try/catch
   - Show user-friendly messages

6. ❌ **Don't hardcode strings**
   - Use constants for repeated values
   - Extract to config files

7. ❌ **Don't skip empty states**
   - Every list needs empty state
   - Provide clear CTAs

8. ❌ **Don't forget to invalidate queries**
   - After create/update/delete
   - Use correct query keys

---

## 🎯 Implementation Priority

### Current Sprint: Enhanced Student List
1. **DataTable component** (shared)
2. **Student columns** (with sorting)
3. **Student filters** (search + grade)
4. **Pagination** (URL-based)
5. **Loading/empty/error states**

### Next Sprint: Student Forms
1. **Create form** (with photo upload)
2. **Edit form** (pre-filled)
3. **Validation** (Zod schemas)
4. **Success handling** (redirect to detail)

---

## 📚 Quick Reference

### Import Paths
```typescript
// Components
import { Button } from '@/components/ui/button'
import { StudentTable } from '@/components/students/student-table'

// Hooks
import { useStudents } from '@/hooks/use-student'

// Services
import { listStudents } from '@/lib/api/student-service'

// Types
import type { StudentDto } from '@/lib/api/student-types'

// Utils
import { cn } from '@/lib/utils'
```

### Common Hooks
```typescript
useStudents(params)          // List with filters
useStudentDetail(id)         // Single student
useStudentMutations()        // { create, update, remove }
useTenantSubdomain()         // Current subdomain
useIsMobile()                // Responsive
useSearchParams()            // URL params
```

### Common Components
```typescript
<Button variant="default|outline|ghost" />
<Dialog />
<Sheet />
<Form />
<Input />
<Select />
<DataTable />
<Avatar />
<Badge />
<Skeleton />
```

---

## 🔄 Workflow

1. **Define types** in `lib/api/*-types.ts`
2. **Create service** in `lib/api/*-service.ts`
3. **Create hooks** in `hooks/use-*.ts`
4. **Create columns** in `components/*/columns.tsx`
5. **Create table** in `components/*/table.tsx`
6. **Create form** in `components/*/form.tsx`
7. **Create page** in `app/[subdomain]/(with-shell)/*/page.tsx`
8. **Add filters** if needed
9. **Test all states** (loading, error, empty, success)
10. **Accessibility review**

---

**Last Updated:** February 10, 2026  
**Version:** 2.0.0  
**Status:** Active Development - Phase 2
