# API2 Migration - Quick Start Guide for Developers

## 30-Second Summary
- **Old Way**: Pass subdomain to every service function
- **New Way**: `useAxiosAuth` hook automatically injects X-Tenant header
- **Result**: Cleaner code, less boilerplate, same functionality

---

## Before You Start

✅ Prerequisites:
- [ ] Backend is running
- [ ] Tenant is set in store (`useTenantStore`)
- [ ] Component has `"use client"` directive (if using hooks)

---

## 3-Step Migration Process

### Step 1️⃣: Update Imports (30 seconds)

**Change FROM:**
```typescript
import { useSectionFinalGrades } from "@/hooks/use-grading";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
```

**Change TO:**
```typescript
import { useGrading } from "@/lib/api2/grading";
```

### Step 2️⃣: Update Hook Calls (1 minute)

**Change FROM:**
```typescript
const subdomain = useTenantSubdomain();
const { data, isLoading } = useSectionFinalGrades(sectionId, {
  academic_year: academicYearId,
  marking_period: markingPeriodId,
  data_by: "subject",
  subject: subjectId,
  include_assessment: true,
});
```

**Change TO:**
```typescript
const grading = useGrading();
const { data, isLoading } = grading.getSectionFinalGrades(
  academicYearId,
  sectionId,
  markingPeriodId,
  subjectId,
  "subject"
);
```

### Step 3️⃣: Test in Browser (2 minutes)

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Make API request**
4. **Find any `/api/v1/*` request**
5. **Check Headers**
6. **Look for**: `X-Tenant: eco` (or your tenant)
7. **Done!** ✅

---

## Module-by-Module Breakdown

### 🎓 Grading
```typescript
import { useGrading } from "@/lib/api2/grading";
// Usage: useGrading().getGradeBooks(yearId)
```

### 📚 Enrollment
```typescript
import { useEnrollment } from "@/lib/api2/enrollment";
// Usage: useEnrollment().getStudents(...)
```

### 👥 Students
```typescript
import { useStudent } from "@/lib/api2/student";
// Usage: useStudent().getStudent(studentId)
```

### 💰 Finance/Billing
```typescript
import { useBilling } from "@/lib/api2/billing";
// Usage: useBilling().getTransactions()
```

### 📅 Marking Period
```typescript
import { useMarkingPeriod } from "@/lib/api2/marking-period";
// Usage: useMarkingPeriod().getMarkingPeriods()
```

### 📖 Semester
```typescript
import { useSemester } from "@/lib/api2/semester";
// Usage: useSemester().getSemesters()
```

---

## Common Hook Patterns

### 📖 Read Data (Query)
```typescript
const { data, isLoading, error } = useGrading().getGradeBooks(yearId);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{JSON.stringify(data)}</div>;
```

### ✏️ Modify Data (Mutation)
```typescript
const mutation = useGrading().useUpdateGrade();

const handleUpdate = async () => {
  try {
    await mutation.mutateAsync({ id: gradeId, score: 85 });
    // Success! Re-fetch automatically handled by React Query
  } catch (error) {
    console.error("Failed to update:", error);
  }
};

return <button onClick={handleUpdate} disabled={mutation.isPending}>
  {mutation.isPending ? "Updating..." : "Update Grade"}
</button>;
```

### 🔄 Pre-defined Options
```typescript
const { data, refetch } = useGrading().getSectionFinalGrades(
  academicYearId,
  sectionId,
  markingPeriodId,
  subjectId,
  "subject",
  {
    enabled: true,        // Auto-fetch on mount
    staleTime: 5 * 60000, // Cache for 5 minutes
    gcTime: 10 * 60000,   // Keep in cache for 10 minutes
  }
);

// Manual refetch
<button onClick={() => refetch()}>Refresh</button>
```

---

## Troubleshooting Checklist

| Problem | Cause | Solution |
|---------|-------|----------|
| ❌ Hook error | Not in client component | Add `"use client"` at top |
| ❌ 404 Error | Missing data | Check network → X-Tenant header |
| ❌ Multiple imports | Old path | Use `@/lib/api2/grading` |
| ❌ `is not a function` | Wrong hook | Use `useGrading()` not `useSectionFinalGrades` |
| ❌ No X-Tenant header | Tenant not set | Check tenant store |

---

## Architecture Diagram (Simple)

```
┌─────────────┐
│ Component   │
└──────┬──────┘
       │ useGrading()
       ▼
┌──────────────────┐
│ useGrading()     │ ← Provides hooks
│ lib/api2/grading │
└──────┬───────────┘
       │ grading.getSectionFinalGrades(...)
       ▼
┌──────────────────┐
│ useGradingApi()  │ ← API functions
│ lib/api2/grading │
└──────┬───────────┘
       │ useAxiosAuth()
       ▼
┌─────────────────────────────────────┐
│ useAxiosAuth()                      │ ← Tenant-aware
│ hooks/use-axios-auth                │
│                                     │
│ 1. Get tenant from store            │
│ 2. Create axios instance            │
│ 3. Add X-Tenant header interceptor  │
└──────┬──────────────────────────────┘
       │ GET /api/v1/grading/... + X-Tenant: eco
       ▼
┌─────────────────────┐
│ Backend API         │
│ (With tenant check) │
└─────────────────────┘
```

---

## Real Example: Grade Entry Table

### Complete Before→After

**BEFORE:**
```typescript
"use client";
import { useSectionFinalGrades } from "@/hooks/use-grading";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export function GradeEntryTable({ gradebook, markingPeriodId, canEdit }) {
  const subdomain = useTenantSubdomain();
  const { data, isLoading } = useSectionFinalGrades(gradebook.section.id, {
    academic_year: gradebook.academic_year.id,
    marking_period: markingPeriodId,
    data_by: "subject",
    subject: gradebook.subject.id,
    include_assessment: true,
    include_average: false,
    status: "any",
  });
  
  return <table>{/* ... */}</table>;
}
```

**AFTER:**
```typescript
"use client";
import { useGrading } from "@/lib/api2/grading";

export function GradeEntryTable({ gradebook, markingPeriodId, canEdit }) {
  const grading = useGrading();
  const { data, isLoading } = grading.getSectionFinalGrades(
    gradebook.academic_year.id,
    gradebook.section.id,
    markingPeriodId,
    gradebook.subject.id,
    "subject"
  );
  
  return <table>{/* ... */}</table>;
}
```

**Changes:**
- Removed 2 imports
- Removed 1 line (`useTenantSubdomain`)
- Changed 1 hook call structure
- Everything else stays the same ✅

---

## Verify It Worked

### Method 1: Browser DevTools
```
F12 → Network → Find API call → Check Headers
Should see: X-Tenant: eco (or your tenant)
```

### Method 2: Console Test
```javascript
// In browser console:
const tenant = useTenantStore.getState().tenant
console.log(tenant.subdomain) // Should show "eco"
```

### Method 3: Component Props
Add temporary debug output:
```typescript
{/* In component */}
<div>Tenant: {useTenantStore((s) => s.tenant?.subdomain)}</div>
```

---

## File Reference

### 📚 Documentation
- `API2_MIGRATION_GUIDE.md` - Full overview
- `API2_MIGRATION_PLAN.md` - File-by-file details
- `API2_VERIFICATION_GUIDE.md` - Testing procedures
- `API2_BEFORE_AFTER_EXAMPLES.md` - Code samples
- `API2_IMPLEMENTATION_SUMMARY.md` - Technical details

### 💻 Code Files
- `hooks/use-axios-auth.ts` - Tenant-aware axios hook
- `lib/api2/tenant-utils.ts` - Utilities
- `lib/api2/*/` - All API modules

### 🚀 Tenant Store
- `store/tenant-store.ts` - Manages tenant context

---

## Common Commands

```bash
# Search for old imports
grep -r "use-grading" components/
grep -r "use-tenant-subdomain" components/

# Find all files to update
grep -r "useSectionFinalGrades" .
grep -r "useTenantSubdomain" .

# Check if migration is complete
grep -r "lib/api/grading" . # Should be empty
grep -r "@/lib/api/" . | grep -v node_modules # Should be empty
```

---

## Need Help?

1. **Can't find a function?**
   - Check `lib/api2/<module>/api.ts` for all available functions
   - Look at `lib/api2/<module>/index.ts` for hooks

2. **Getting 404?**
   - Check X-Tenant header in network tab
   - Verify backend supports the endpoint

3. **Getting "Cannot read property"?**
   - Check data structure matches what component expects
   - Use browser DevTools to inspect network response

4. **TypeScript errors?**
   - Check types in `lib/api2` modules
   - Verify parameter names and order
   - Use IntelliSense (Ctrl+Space) for autocomplete

---

## Success Looks Like

✅ Component renders without errors
✅ X-Tenant header present in Network tab
✅ API returns correct data
✅ No console warnings
✅ Matches expected behavior from before migration

---

**Ready to migrate? Start with a single component and use this guide as reference!**
