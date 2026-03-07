# API2 Tenant Handling Verification Guide

## Testing Setup

### Prerequisites
- Backend running with tenant support
- Frontend with tenant provider initialized
- At least one tenant configured

### Test Environment
```
Tenant Subdomain: eco
API Base URL: http://localhost:8000/api/v1
Expected Header: X-Tenant: eco
```

---

## Verification Steps

### Step 1: Verify Tenant Store Setup
```typescript
// In browser console:
import { useTenantStore } from "@/store/tenant-store"
const state = useTenantStore.getState()
console.log(state.tenant) // Should show { subdomain: "eco", ... }
```

Expected output:
```
{
  identifier: "eco",
  name: "Eco Bank",
  subdomain: "eco",
  adminEmail: "admin@eco.com",
  isActive: true,
  ...
}
```

---

### Step 2: Verify useAxiosAuth Hook
Create a simple test component:

```typescript
// components/debug/api-test.tsx
"use client";

import { useAxiosAuth } from "@/hooks/use-axios-auth";
import { useEffect } from "react";

export function ApiTest() {
  const { get } = useAxiosAuth();

  useEffect(() => {
    // Test a simple endpoint
    get("/students/").then((data) => {
      console.log("API Response:", data);
    });
  }, [get]);

  return <div>Check console for API response</div>;
}
```

**Expected Result:**
- Console shows successful response
- Network tab shows `X-Tenant: eco` header
- No 401 or tenant-related errors

---

### Step 3: Network Request Inspection
1. Open DevTools → Network tab
2. Filter for API calls
3. Click on any `/api/v1/*` request
4. Check Headers tab
5. Verify `X-Tenant: eco` is present

**Expected Headers:**
```
GET /api/v1/students/ HTTP/1.1
Host: localhost:3000
X-Tenant: eco
Authorization: Bearer <token>
Content-Type: application/json
```

---

### Step 4: Test Grading Module
```typescript
// In a component
import { useGrading } from "@/lib/api2/grading";

export function GradingTest() {
  const grading = useGrading();
  
  // Test getSectionFinalGrades
  const { data, isLoading, error } = grading.getSectionFinalGrades(
    "2025-2026-year-id",
    "section-id",
    "marking-period-id",
    "subject-id",
    "subject"
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

**Expected Behavior:**
- Data loads successfully
- Network tab shows X-Tenant header
- No "404 No gradebook found" errors
- Response matches SectionFinalGradesSubjectResponse type

---

### Step 5: Test Tenant Switching
1. Change tenant in store: `useTenantStore.setState({ tenant: <newTenant> })`
2. Make new API call
3. Verify new tenant's X-Tenant header is sent
4. Verify data is for correct tenant

```typescript
// Test script
import { useTenantStore } from "@/store/tenant-store";
import { useAxiosAuth } from "@/hooks/use-axios-auth";

const { get } = useAxiosAuth();
const studentData = await get("/students/");
console.log("Current tenant students:", studentData);

// Switch tenant
useTenantStore.setState({ tenant: { subdomain: "other", ... } });

// Make another call
const otherStudentData = await get("/students/");
console.log("Other tenant students:", otherStudentData);

// Verify they're different
console.assert(studentData.length !== otherStudentData.length, "Data should differ");
```

---

## Common Issues and Debugging

### Issue 1: X-Tenant Header Not Sent
**Symptoms:** 401 Unauthorized or tenant-related 403 errors

**Debug:**
```typescript
// Check interceptor
const { useTenantStore } = require("@/store/tenant-store");
console.log("Tenant:", useTenantStore.getState().tenant);

// Check if it's a client component
// (hooks don't work in server components)
"use client" // Must be at top of file
```

**Solution:**
- Ensure component has `"use client"` directive
- Verify tenant is actually set in store
- Check browser console for React errors

---

### Issue 2: useTenantStore is undefined
**Symptoms:** `TypeError: useTenantStore is undefined`

**Debug:**
```typescript
// Ensure correct import
import { useTenantStore } from "@/store/tenant-store"

// Verify file exists
ls -la /Users/dewardseneh/workdir/ezyschool-ui/store/tenant-store.ts
```

**Solution:**
- Check import path is correct
- Verify file exists at that location

---

### Issue 3: useAxiosAuth called in wrong context
**Symptoms:** 
```
"React Hook 'useAxiosAuth' cannot be called at the Top Level"
```

**Debug:**
```typescript
// ❌ WRONG: Calling hook outside of component
const { get } = useAxiosAuth();
export function MyComponent() { ... }

// ✅ CORRECT: Calling hook inside component
export function MyComponent() {
  const { get } = useAxiosAuth();
  ...
}

// ✅ CORRECT: Called within useGradingApi hook
export const useGradingApi = () => {
  const { get, post, ... } = useAxiosAuth()
  ...
}
```

**Solution:**
- Move hook call inside component/hook function
- Never call hooks conditionally

---

### Issue 4: 404 from Section Final Grades
**Symptoms:** `{"detail": "No gradebook found for this section/subject/year."}`

**This was the bug we fixed!**

**Debug:**
```typescript
// Check backend query - should use denormalized fields
// ✅ FIXED: 
GradeBook.objects.get(
  section=section,
  subject=subject,
  academic_year=academic_year,
)

// Verify the gradebook exists with:
// 1. Check section ID
// 2. Check subject ID  
// 3. Check academic year ID
// 4. Verify all three exist in database
```

---

## Load Testing Checklist

- [ ] Single user, single tenant
  - [ ] Get gradebooks
  - [ ] Get section final grades
  - [ ] Create assessment
  - [ ] Update grade

- [ ] Multiple API calls in parallel
  - [ ] Should all have correct X-Tenant header
  - [ ] No race conditions

- [ ] Tenant switching
  - [ ] After switching, API calls use new tenant
  - [ ] Old tenant data not mixed with new

- [ ] Error scenarios
  - [ ] Missing tenant → graceful fallback or error
  - [ ] Wrong tenant ID → 404 or 403
  - [ ] Expired token → redirect to login

---

## Performance Baseline

### Before Migration (lib/api)
- Subdomain parameter passed to every function
- Manual React Query setup in each hook
- Extra boilerplate code

### After Migration (lib/api2)
- Tenant injected automatically
- React Query setup centralized
- Cleaner function signatures

### Expected Improvements
- [ ] Faster development time (less parameters to pass)
- [ ] Fewer bugs (consistent tenant handling)
- [ ] Better maintainability (less duplicate code)
- [ ] Same or better API performance

---

## Monitoring

### Console Warnings to Watch For
1. ❌ "X-Tenant header not found" 
   - Check tenant store
2. ❌ "useAxiosAuth not in client component"
   - Add "use client" directive
3. ❌ "Multiple axios instances created"
   - This is expected if useMemo isn't working

### Browser DevTools Watch
1. Network tab → check X-Tenant header on all API calls
2. Application tab → check tenant in localStorage
3. Console tab → no React errors about hooks

---

## Rollback Procedures

If issues arise:

1. **Minor Issue (specific endpoint):**
   - Keep using lib/api for that endpoint
   - Fix in api2 then migrate

2. **Major Issue (tenant not injected):**
   - Revert useAxiosAuth hook
   - Go back to lib/api approach
   - Debug root cause

3. **Complete Rollback:**
   ```bash
   git revert <migration-commit>
   rm -f hooks/use-axios-auth.ts
   rm -f lib/api2/tenant-utils.ts
   # Restore lib/api usage
   ```

---

## Success Criteria

✅ Migration is successful when:
- All API calls include X-Tenant header
- No tenant-related 404 errors
- Tenant switching works correctly
- No React hook rule violations
- All existing functionality works
- Performance is equivalent or better
- Console is clean (no errors/warnings)
