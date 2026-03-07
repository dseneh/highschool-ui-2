# Dashboard Frontend Implementation Guide (ezyschool-ui)

## Quick Start

The dashboard in ezyschool-ui is fully functional and ready to use. It automatically:
1. Fetches data from backend `/students/summary/`, `/students/`, and `/finance/billing/summary/`
2. Renders statistics cards, financial chart, and recent activity
3. Handles loading states and errors gracefully
4. Caches data for 5 minutes using React Query

## File Structure

```
ezyschool-ui/
├── app/[subdomain]/(with-shell)/
│   ├── page.tsx                    # Main dashboard page
│   └── student/
│       └── page.tsx                # Student portal dashboard
│
├── lib/api2/dashboard/
│   ├── api.ts                      # Axios API functions
│   ├── index.ts                    # React Query hooks (useDashboard)
│   └── types.ts                    # TypeScript types (DashboardData, etc)
│
├── components/dashboard/
│   ├── content.tsx                 # Main layout container
│   ├── stats-cards.tsx             # 4 stat cards grid
│   ├── financial-overview.tsx      # Chart component
│   ├── recent-activity.tsx         # Student activity table
│   ├── quick-actions.tsx           # Action buttons
│   ├── loading-skeleton.tsx        # Loading state UI
│   ├── dashboard-shell.tsx         # Shell layout wrapper
│   ├── page-layout.tsx             # Page layout wrapper
│   └── ...                         # Other dashboard components
│
└── store/
    └── dashboard-store.ts          # Zustand dashboard state (filters, layout)
```

## How It Works

### 1. Dashboard Page (`page.tsx`)

Entry point for the dashboard. Handles:
- Authentication checks
- User role detection (student vs. admin/staff)
- Data fetching from backend
- Routing to student portal for student users

```typescript
// Pseudo code flow
export default function DashboardPage() {
  const { user } = useAuth()
  const isStudent = user?.account_type === "STUDENT"
  
  if (isStudent) {
    return <StudentPortal />  // Different dashboard for students
  }
  
  // Admin/Staff dashboard
  const summary = useDashboard().getDashboardSummary()
  const students = useDashboard().getRecentStudents()
  const finance = useDashboard().getFinancialSummary()
  
  return <DashboardContent data={transformData(...)} />
}
```

### 2. API Layer (`lib/api2/dashboard/`)

Three-tier API architecture:

#### Tier 1: Raw API Calls (api.ts)
```typescript
const getDashboardSummary = async () => {
  return get(`/students/summary/`)  // Returns DashboardStats
}
```

#### Tier 2: React Query Hooks (index.ts)
```typescript
const getDashboardSummary = (options = {}) =>
  useApiQuery(
    ['dashboard', 'summary'],  // Cache key
    () => api.getDashboardSummary(),
    options
  )
```

#### Tier 3: Page Component
Uses the hooks directly and handles data transformation

### 3. Components

**StatsCards** - 4 cards showing key metrics:
- Total Students
- Pending Bills
- Attendance %
- Active Classes

**FinancialOverview** - Line/Bar chart of income vs expenses by month

**RecentActivity** - Table of 5 most recently added students

**QuickActions** - Buttons linking to common actions

## Data Transformation

The dashboard page transforms raw API responses into a DashboardData structure:

```typescript
// From API
{
  "total_students": 150,
  "pending_bills": 45000.50,
  "avg_attendance": 85.5,
  "active_sections": 12
}

// Transformed to
{
  stats: [
    { title: "Total Students", value: "150", subtitle: "enrolled", iconKey: "users" },
    { title: "Pending Bills", value: "45000.5", subtitle: "outstanding", iconKey: "dollar-sign" },
    { title: "Attendance", value: "85.5%", subtitle: "average", iconKey: "check-circle" },
    { title: "Active Classes", value: "12", subtitle: "sections", iconKey: "book" }
  ]
}
```

## Customization Guide

### Changing Cache Duration

Edit `/app/[subdomain]/(with-shell)/page.tsx`:

```typescript
// Currently 5 minutes
const summaryQuery = dashboard.getDashboardSummary({
  staleTime: 5 * 60 * 1000  // Change milliseconds here
})
```

### Adding New Stat Cards

1. Add API endpoint to backend
2. Create new React Query hook in `lib/api2/dashboard/index.ts`
3. Fetch data in `page.tsx`
4. Add to `stats` array in transformation

Example:
```typescript
// Step 2: Add hook
const getEnrollmentStats = (options = {}) =>
  useApiQuery(['dashboard', 'enrollment'], 
    () => api.getEnrollmentStats(), options)

// Step 3: Fetch in page
const enrollmentQuery = dashboard.getEnrollmentStats()

// Step 4: Add to stats
stats: [
  ...existingStats,
  {
    title: "Active Enrollments",
    value: String(enrollmentQuery.data?.active || 0),
    subtitle: "current",
    iconKey: "users"
  }
]
```

### Customizing Chart Data

Edit `FinancialOverview` component or modify data in transformation:

```typescript
chart: financialSummaryQuery.data || [
  // Fallback data structure
  { month: "Jan", moneyIn: 0, moneyOut: 0, moneyInChange: 0, moneyOutChange: 0 }
]
```

### Adding Filters/Filters

Use `dashboard-store.ts` to manage dashboard state:

```typescript
// Add to DashboardState interface
filters: {
  academicYear?: string
  section?: string
}

setFilters: (filters: any) => void
```

## API Endpoints Expected

The dashboard expects these backend endpoints to exist:

### 1. `/students/summary/` (GET)
**Returns**: DashboardStats with all 8 fields
```json
{
  "total_students": number,
  "total_staff": number,
  "academic_year": string,
  "total_enrolled": number,
  "pending_bills": number,
  "total_courses": number,
  "active_sections": number,
  "avg_attendance": number
}
```

### 2. `/students/` (GET)
**Query Params**: `limit=5` (for recent activity)
**Returns**: Paginated student list
```json
{
  "count": number,
  "next": string | null,
  "previous": string | null,
  "results": [StudentDto, ...]
}
```

### 3. `/finance/billing/summary/` (GET)
**Returns**: Array of monthly financial data (optional - gracefully handles 404)
```json
[{
  "month": "2024-12",
  "moneyIn": number,
  "moneyOut": number,
  "moneyInChange": number,
  "moneyOutChange": number
}]
```

## Troubleshooting

### Dashboard shows "Unable to load dashboard data"
1. Check browser network tab for API errors
2. Inspect error in console
3. Verify `/students/summary/` endpoint works
4. Check authentication token is valid
5. Verify user has permission (StudentAccessPolicy)

### Stats show 0 or NaN
1. Check if response data exists
2. Verify null coalescing: `summary.total_students || 0`
3. Check data transformation logic
4. Verify backend returns correct data types

### Chart shows no data
1. Verify `/finance/billing/summary/` returns data
2. Check endpoint gracefully handles errors (returns [] or null)
3. Inspect FinancialOverview component for chart configuration
4. Verify date format matches expected (YYYY-MM)

### Slow loading
1. Check React Query cache configuration
2. Verify backend query performance
3. Use browser DevTools Network tab to identify slow endpoint
4. Consider reducing staleTime if data needs to be fresher

### Student users see wrong dashboard
1. Check `useAuth()` returns correct `account_type`
2. Verify student portal page exists at `/student/page.tsx`
3. Check routing logic in dashboard page

## Performance Notes

- **React Query**: Deduplicates requests, caches for 5 minutes
- **Database**: Backend uses `select_related` and `prefetch_related`
- **Pagination**: Only fetches 5 recent students
- **Build**: Dashboard components are split for code-splitting

## TypeScript Types

Key types defined in `lib/api2/dashboard/types.ts`:

```typescript
type DashboardStats = {
  total_students?: number
  total_staff?: number
  academic_year?: string
  total_enrolled?: number
  pending_bills?: number
  total_courses?: number
  active_sections?: number
  avg_attendance?: number
}

type FinanceDataPoint = {
  month: string
  moneyIn: number
  moneyOut: number
  moneyInChange: number
  moneyOutChange: number
}

type SummaryCard = {
  title: string
  value: string
  subtitle: string
  iconKey: string
}

type DashboardData = {
  alert: { pendingLeaves: number; overtimeApprovals: number }
  stats: SummaryCard[]
  chart: FinanceDataPoint[]
  employees: StudentDto[]
}
```

## Environment Variables

No special environment variables needed. Uses:
- `NEXT_PUBLIC_API_BASE_URL` (from parent config)
- Tenant context for multi-tenant routing
- Auth token from portable-auth

## Related Documentation

- See `/backend-2/DASHBOARD_IMPLEMENTATION.md` for backend details
- See `/SKILLS.md` for project conventions
- See `/DESIGN_SYSTEM.md` for UI/UX standards
- See `/TECHNICAL_PATTERNS.md` for implementation patterns

