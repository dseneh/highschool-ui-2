# API2 Migration - Comprehensive Summary

## What Has Been Done ✅

### 1. **Created useAxiosAuth Hook** 
   - File: `hooks/use-axios-auth.ts`
   - Purpose: Provide tenant-aware axios methods (get, post, put, patch, delete)
   - Features:
     - Automatically injects `X-Tenant` header from tenant store
     - Error handling with 401 redirect
     - Axios instance creation with request/response interceptors
     - Returns simple promise-based methods (not axios responses)

### 2. **Created Tenant Utilities**
   - File: `lib/api2/tenant-utils.ts`
   - Provides `useTenantAwareApi()` wrapper
   - Fallback for getting tenant from context

### 3. **Documentation Created**
   - `API2_MIGRATION_GUIDE.md` - High-level overview and migration patterns
   - `API2_MIGRATION_PLAN.md` - Detailed file-by-file changes needed
   - `API2_VERIFICATION_GUIDE.md` - Testing and verification procedures

---

## Tenant Handling Architecture

### Flow Diagram
```
┌─────────────────────────────────────────┐
│  Component/Hook (Client Component)      │
│  const { get } = useAxiosAuth()         │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────▼──────────┐
         │  useAxiosAuth()    │
         │  (hooks/use-axios) │
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────────────┐
         │ Get Tenant from Store      │
         │ useTenantStore()           │
         │ → tenant.subdomain ("eco") │
         └─────────┬──────────────────┘
                   │
         ┌─────────▼──────────────────────┐
         │ Create Axios Instance          │
         │ baseURL: "/api/v1"             │
         │ timeout: 30000ms               │
         └─────────┬──────────────────────┘
                   │
         ┌─────────▼──────────────────────┐
         │ Request Interceptor            │
         │ Add Header:                    │
         │ X-Tenant: eco                  │
         └─────────┬──────────────────────┘
                   │
         ┌─────────▼──────────────────────┐
         │ Send Request                   │
         │ GET /api/v1/grading/...        │
         │ Headers: X-Tenant: eco         │
         └─────────┬──────────────────────┘
                   │
         ┌─────────▼──────────────────────┐
         │ Response Interceptor           │
         │ Handle errors (401, etc)       │
         └─────────┬──────────────────────┘
                   │
         ┌─────────▼──────────────────────┐
         │ Return Data                    │
         │ to Component/Hook              │
         └────────────────────────────────┘
```

### Key Points
1. **Automatic**: No need to pass subdomain as parameter
2. **Centralized**: Tenant context managed from single store
3. **Consistent**: All API calls include X-Tenant header
4. **Reactive**: Switching tenant automatically updates all future requests

---

## How API2 Works

### Before (lib/api):
```typescript
// 1. Get subdomain and pass it everywhere
const subdomain = useTenantSubdomain();

// 2. Call service function with subdomain
getSectionFinalGrades(subdomain, sectionId, params)

// 3. Service function adds with context manually
export async function getSectionFinalGrades(
  subdomain: string,
  sectionId: string,
  params?: {...}
) {
  const { data } = await apiClient.get(...)
  return data;
}

// 4. apiClient has general interceptor (not tenant-specific)
```

### After (lib/api2):
```typescript
// 1. Component just calls hook
const { data } = useGrading().getSectionFinalGrades(...)

// 2. useGrading hook calls useGradingApi
export function useGrading() {
  const api = useGradingApi()
  ...
}

// 3. useGradingApi calls useAxiosAuth
export const useGradingApi = () => {
  const { get, post, ... } = useAxiosAuth()  // ← Tenant injected here
  ...
}

// 4. useAxiosAuth automatically injects X-Tenant from store
export function useAxiosAuth() {
  const tenant = useTenantStore(...)  // Get from store
  // Create axios with interceptor that adds X-Tenant header
}
```

---

## Next Steps - Implementation Order

### **PHASE 1: Verify & Test (Start Here)**
- [ ] Test useAxiosAuth hook works
  - Navigate to gradebook page
  - Open DevTools Network tab
  - Check if X-Tenant header is present
  - Should see no 404 errors
  
- [ ] Verify tenant switching works
  - Change tenant in store
  - Make new API call
  - Confirm X-Tenant header changed

- [ ] Run verification guide tests
  - Use test component in browser console
  - Check all verification steps pass

### **PHASE 2: Migrate Grading Module (High Priority)**

**Files to Create/Update in Order:**

1. **Update hooks/use-grading.ts**
   - Replace with wrapper around `useGrading()` from api2
   - OR delete and update all imports to use `lib/api2/grading`

2. **Update components/grading/grade-entry-table.tsx**
   - Import `useGrading` from `lib/api2/grading` instead of `use-grading`
   - Call `useGrading().useSectionFinalGrades(...)` instead of `useSectionFinalGrades(...)`
   - Remove `useTenantSubdomain` usage

3. **Update components/grading/gradebook-nav.tsx**
   - Similar changes to grade-entry-table.tsx

4. **Update components/grading/create-assessment-dialog.tsx**
   - Update to use `useGrading()` from api2

5. **Update app pages**
   - `app/[subdomain]/(with-shell)/grading/gradebooks/page.tsx`
   - `app/[subdomain]/(with-shell)/grading/gradebooks/[id]/page.tsx`

### **PHASE 3: Migrate Other Modules (Medium Priority)**
- Enrollment
- Student  
- Finance/Billing
- Employee

### **PHASE 4: Cleanup (Low Priority)**
- Delete `lib/api` directory
- Delete unused hooks
- Remove `useTenantSubdomain` hook
- Update any imports

---

## Key Implementation Details

### 1. Hook Structure with api2
```typescript
// The pattern all api2 modules follow:
export const useGradingApi = () => {
  const { get, post, put, patch, delete: del } = useAxiosAuth()
  
  // Define API functions
  const getStudentsApi = async (...) => get(...)
  const updateGradeApi = async (...) => put(...)
  
  return { getStudentsApi, updateGradeApi, ... }
}

// Then wrapped with React Query
export function useGrading() {
  const api = useGradingApi()
  
  const getStudents = (options = {}) => useQuery({
    queryKey: ['students'],
    queryFn: () => api.getStudentsApi(),
    ...options,
  })
  
  return { getStudents, ... }
}

// Usage in component:
export function MyComponent() {
  const { data, isLoading } = useGrading().getStudents()
  return <div>{data}</div>
}
```

### 2. Error Handling
api2 methods throw errors which are caught by React Query:
```typescript
try {
  const data = await useGrading().getSectionFinalGrades(...)
} catch (error) {
  if (error.response?.status === 404) {
    console.log("Not found")
  } else if (error.response?.status === 401) {
    // useAxiosAuth interceptor handles this
    // User will be redirected to login
  }
}
```

### 3. Query Caching
React Query handles caching automatically:
```typescript
// First call - hits API
const { data: data1 } = useGrading().getStudents()

// Second call - uses cache (no API call)
const { data: data2 } = useGrading().getStudents()

// data1 === data2 (same reference)

// Force refetch
data2.refetch()
```

---

## Testing Strategy

### Unit Tests
- Test useAxiosAuth hook in isolation
- Verify X-Tenant header injection
- Test error handling

### Integration Tests
- Test with actual tenant store
- Verify tenant switching works
- Test multiple simultaneous requests

### E2E Tests
- Test full user flow
- Verify gradebook operations
- Test across multiple tenants

---

## Potential Issues & Solutions

### Issue 1: "Cannot use hooks in server components"
**Solution:** Ensure component has `"use client"` directive

### Issue 2: "X-Tenant header not being sent"
**Solution:** 
- Check tenant is set in store
- Verify component is client component
- Check browser console for React errors

### Issue 3: "404 gradebook not found" (from backend)
**Solution:** 
- This was fixed in backend - section/subject queries now use denormalized fields
- Verify backend deployment

### Issue 4: "useGradingApi called multiple times"
**Solution:**
- This is expected with useMemo dependency changes
- Won't cause issues, just re-creation of axios instance
- Can optimize with React Context if becomes problem

---

## Success Metrics

You'll know migration is successful when:

✅ **Functionality**
- All grading operations work (create, read, update, delete)
- Tenant switching works
- Multi-tenant data isolation works

✅ **Technical**
- X-Tenant header present on all requests
- No tenant-related 404 errors
- No React hook warnings
- Console is clean

✅ **Performance**
- Same or better response times
- No memory leaks from multiple axios instances
- React Query caching working

✅ **Code Quality**
- Less boilerplate code
- Consistent error handling
- Centralized tenant management

---

## Files Ready for Use

✅ **New Files Created:**
- `hooks/use-axios-auth.ts` - Tenant-aware axios hook
- `lib/api2/tenant-utils.ts` - Tenant utilities
- `API2_MIGRATION_GUIDE.md` - High-level guide
- `API2_MIGRATION_PLAN.md` - Detailed plan
- `API2_VERIFICATION_GUIDE.md` - Testing guide
- `API2_IMPLEMENTATION_SUMMARY.md` - This file

✅ **Existing Files Ready:**
- `lib/api2/*` - All API modules with hooks
- `store/tenant-store.ts` - Tenant management
- `app/[subdomain]/layout.tsx` - Tenant provider setup

---

## Quick Reference

### Import Pattern
```typescript
// Use this:
import { useGrading } from "@/lib/api2/grading"

// NOT this:
import { useSectionFinalGrades } from "@/hooks/use-grading"
```

### Hook Usage Pattern
```typescript
"use client"

import { useGrading } from "@/lib/api2/grading"

export function MyComponent() {
  const grading = useGrading()
  
  // All query hooks are available
  const { data: gradebooks } = grading.getGradeBooks(yearId)
  const { data: assessments } = grading.getAssessments(gradebookId)
  
  return <div>{/* render data */}</div>
}
```

### Tenant Verification
```typescript
// In console, verify tenant:
const tenant = useTenantStore.getState().tenant
console.log(tenant.subdomain) // Should show "eco" or your tenant

// Then verify any API call shows X-Tenant in network tab
```

---

## Questions?

Refer to:
1. `API2_MIGRATION_GUIDE.md` - General approach
2. `API2_MIGRATION_PLAN.md` - File-by-file details
3. `API2_VERIFICATION_GUIDE.md` - Testing procedures

All files in workspace at `/Users/dewardseneh/workdir/ezyschool-ui/`
