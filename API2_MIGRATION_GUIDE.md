# API2 Migration Guide

## Overview
We're deprecating `lib/api` in favor of `lib/api2` which is the battle-tested API layer from the v1 project and works more efficiently.

## Key Differences

### Old Approach (lib/api)
```typescript
// lib/api/grading-service.ts
export async function getSectionFinalGrades(
  _subdomain: string,
  sectionId: string,
  params?: {...}
) {
  const { data } = await apiClient.get<...>(
    `grading/sections/${sectionId}/final-grades/`,
    { params }
  );
  return data;
}

// Usage in hooks/use-grading.ts
export function useSectionFinalGrades(sectionId: string | undefined, params?: {...}) {
  const subdomain = useTenantSubdomain();
  return useQuery<...>({
    queryKey: gradingKeys.sectionFinalGrades(subdomain, sectionId ?? "", params),
    queryFn: () => getSectionFinalGrades(subdomain, sectionId!, params),
    enabled: Boolean(subdomain) && Boolean(sectionId) && Boolean(params?.academic_year),
  });
}

// Usage in components
const { data, isLoading } = useSectionFinalGrades(sectionId, params);
```

### New Approach (lib/api2)
```typescript
// lib/api2/grading/api.ts - already uses useAxiosAuth
export const useGradingApi = () => {
    const { get, post, put, patch, delete: del } = useAxiosAuth()
    const getSectionFinalGradesApi = async (
        academicYearId: string,
        sectionId: string,
        markingPeriodId: string,
        subjectId: string,
        data_by: string,
    ) => {
        const q = {
            academic_year: academicYearId,
            marking_period: markingPeriodId,
            subject: subjectId,
            data_by,
        }
        return get(`${baseUrl}/sections/${sectionId}/final-grades/`, { params: q })
    }
    ...
}

// lib/api2/grading/index.ts - hooks already handle React Query
export function useGrading() {
    const api = useGradingApi()
    
    const getSectionFinalGrades = (
        academicYearId: string,
        sectionId: string,
        markingPeriodId: string,
        subjectId: string,
        data_by: string,
        options = {}
    ) =>
        useQuery({
            queryKey: ['sectionFinalGrades', sectionId, markingPeriodId, subjectId],
            queryFn: () =>
                api.getSectionFinalGradesApi(
                    academicYearId,
                    sectionId,
                    markingPeriodId,
                    subjectId,
                    data_by
                ),
            ...options,
        })
    ...
}

// Usage in components
const { data, isLoading } = useGrading().getSectionFinalGrades(
    academicYearId,
    sectionId,
    markingPeriodId,
    subjectId,
    'subject'
);
```

## Benefits
1. **Automatic Tenant Handling**: `useAxiosAuth` hook automatically injects `X-Tenant` header
2. **No Need for Subdomain Parameter**: Tenant is extracted from store automatically
3. **Simpler Service Functions**: Less boilerplate in service files
4. **React Query Integration**: Hooks in api2 already handle caching and state management
5. **Better Type Safety**: Modules are organized by domain (grading, enrollment, etc.)
6. **v1-tested**: This is battle-tested code from the v1 project

## Tenant Handling

### Automatic Tenant Injection
The `useAxiosAuth` hook automatically handles tenant context:

```typescript
// hooks/use-axios-auth.ts
export function useAxiosAuth() {
  const tenant = useTenantStore((state) => state.tenant);
  
  // axios instance with interceptor that injects X-Tenant header
  const axiosInstance = useMemo<AxiosInstance>(() => {
    const instance = axios.create({
      baseURL: "/api/v1",
      timeout: 30000,
    });

    instance.interceptors.request.use((config) => {
      if (typeof window !== "undefined" && tenant?.subdomain) {
        config.headers = config.headers ?? {};
        config.headers["X-Tenant"] = tenant.subdomain;
      }
      return config;
    });

    return instance;
  }, [tenant?.subdomain]);
  
  // Returns: { get, post, put, patch, delete }
}
```

### Tenant Flow
1. Component calls `useGrading().getSectionFinalGrades(...)`
2. Hook wraps it with React Query
3. API function calls `get()` from `useAxiosAuth()`
4. Interceptor automatically adds `X-Tenant` header from store
5. Request sent with proper tenant context

## Migration Checklist

### Step 1: Update Imports
- [ ] Replace `import { useSectionFinalGrades } from "@/hooks/use-grading"` with `import { useGrading } from "@/lib/api2/grading"`
- [ ] Replace all `lib/api/*-service` imports with `lib/api2/*` imports

### Step 2: Update Hook Calls
- [ ] Change API calls to use api2 modules
- [ ] Update query key structures if needed
- [ ] Remove subdomain parameter usage

### Step 3: Test Tenant Injection
- [ ] Verify `X-Tenant` header is sent in network requests
- [ ] Verify tenant switching works correctly
- [ ] Check console for any axios interceptor errors

### Step 4: Remove Old APIs
- [ ] Delete `lib/api/*` files (after confirming no usage)
- [ ] Delete old hooks that used `lib/api`
- [ ] Delete `useTenantSubdomain` hook if no longer needed

## Common Migration Patterns

### Pattern 1: Simple Data Fetch
```typescript
// OLD
import { useSectionFinalGrades } from "@/hooks/use-grading";

const { data, isLoading } = useSectionFinalGrades(sectionId, {
  academic_year: yearId,
  marking_period: mpId,
  data_by: "subject",
  subject: subjectId,
  include_assessment: true,
});

// NEW
import { useGrading } from "@/lib/api2/grading";

const { data, isLoading } = useGrading().getSectionFinalGrades(
  yearId,
  sectionId,
  mpId,
  subjectId,
  "subject"
);
```

### Pattern 2: Query with Mutation
```typescript
// OLD
const updateGradeMutation = useUpdateGrade();
const result = await updateGradeMutation.mutateAsync({...});

// NEW
const { useUpdateGrade } = useGrading();
const mutation = useUpdateGrade();
const result = await mutation.mutateAsync({...});
```

### Pattern 3: Multiple Queries
```typescript
// OLD
const { data: gradebook } = useGradebook(id);
const { data: assessments } = useAssessments(id);
const { data: grades } = useGrades(assessmentId);

// NEW
const grading = useGrading();
const { data: gradebook } = grading.useGradeBook(id);
const { data: assessments } = grading.useAssessments(id);
const { data: grades } = grading.useGrades(assessmentId);
```

## API2 Modules Available
- `/lib/api2/grading` - Grading/Gradebook operations
- `/lib/api2/enrollment` - Enrollment management
- `/lib/api2/marking-period` - Marking periods
- `/lib/api2/section` - Sections
- `/lib/api2/subject` - Subjects
- `/lib/api2/academic-year` - Academic years
- ... (see `/lib/api2/index.ts` for full list)

## Troubleshooting

### Issue: "X-Tenant header not being sent"
- Verify tenant is set: `console.log(useTenantStore.getState().tenant)`
- Check if tenant has subdomain: `tenant?.subdomain`
- Verify hook is used in client component (not server component)

### Issue: "404 from API"
- Verify backend endpoint exists
- Check query parameters match backend expectations
- Ensure x-tenant header is present in network tab

### Issue: "useQuery cache not working"
- Check queryKey structure matches what's expected
- Verify React Query provider is set up
- Check browser devtools React Query panel

## Files to Update
The following directories/files use `lib/api` and need updating:
1. `hooks/use-*.ts` files
2. `components/*/` files
3. `app/` pages
4. Any files importing from `lib/api/`

See MIGRATION_PLAN.md for detailed file-by-file changes needed.
