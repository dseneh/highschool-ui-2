# API2 Migration Plan - Detailed File Changes

## Summary
Migrate from `lib/api/*` to `lib/api2/*` for all API calls. The tenant context (X-Tenant header) will be automatically handled by the `useAxiosAuth` hook.

---

## Files to Update by Module

### 1. Grading Module ⭐ (Priority: HIGH)
Current issues: Using `lib/api/grading-service.ts` and hooks/use-grading.ts

#### Files to Update:
- `hooks/use-grading.ts` → Use `useGrading()` from `lib/api2/grading`
- `components/grading/grade-entry-table.tsx` → Update hook calls
- `components/grading/gradebook-nav.tsx` → Update hook calls
- `components/grading/create-assessment-dialog.tsx` → Update hook calls
- `app/[subdomain]/(with-shell)/grading/gradebooks/page.tsx` → Update hook calls
- `app/[subdomain]/(with-shell)/grading/gradebooks/[id]/page.tsx` → Update hook calls

#### Changes for Grading:
```typescript
// OLD: hooks/use-grading.ts
export function useSectionFinalGrades(sectionId: string | undefined, params?: {...}) {
  const subdomain = useTenantSubdomain();
  return useQuery<SectionFinalGradesSubjectResponse>({
    queryKey: gradingKeys.sectionFinalGrades(subdomain, sectionId ?? "", params),
    queryFn: () => getSectionFinalGrades(subdomain, sectionId!, params),
  });
}

// NEW: Use directly in components
import { useGrading } from "@/lib/api2/grading";

// Then in component:
const { data, isLoading } = useGrading().getSectionFinalGrades(
  academicYearId,
  sectionId,
  markingPeriodId,
  subjectId,
  'subject'
);
```

---

### 2. Enrollment Module (Priority: MEDIUM)
Files using `lib/api/enrollment-service.ts`:
- `hooks/use-enrollment.ts` → Delete, use `lib/api2/enrollment`
- `components/students/enrollment-dialog.tsx` - if exists
- Any pages importing enrollment hooks

---

### 3. Student Module (Priority: MEDIUM)
Files using `lib/api/student-service.ts`:
- `hooks/use-student.ts` → Update to use `lib/api2/student`
- `components/students/` - all components
- `app/[subdomain]/(with-shell)/students/` pages

---

### 4. Semester Module (Priority: LOW)
Files using `lib/api/semester-service.ts`:
- `hooks/use-semester.ts` → Update to use `lib/api2/semester`

---

### 5. Finance/Billing Module (Priority: MEDIUM)
Files using `lib/api/finance-service.ts` and `lib/api/billing-service.ts`:
- `hooks/use-finance.ts` → Delete, use `lib/api2/billing`
- `components/finance/` - all components
- `app/[subdomain]/(with-shell)/transactions/` pages

---

### 6. Employee Module (Priority: LOW)
Files using `lib/api/employee-service.ts`:
- `hooks/use-employee.ts` → Update to use `lib/api2/employee`

---

### 7. Other Modules (Priority: LOW)
- Academic Year → `lib/api2/academic-year`
- Grade Level → `lib/api2/grade-level`
- Section → `lib/api2/section`
- Subject → `lib/api2/subject`
- Marking Period → `lib/api2/marking-period`

---

## Migration Steps

### Phase 1: Setup and Verification (Current)
- [x] Create `useAxiosAuth` hook for tenant-aware API calls
- [x] Create tenant utilities
- [x] Verify api2 modules already use `useAxiosAuth`
- [ ] Test tenant injection in a simple api2 call

### Phase 2: High Priority (Grading)
- [ ] Update `hooks/use-grading.ts`
- [ ] Update grade-entry-table.tsx
- [ ] Update gradebook-nav.tsx
- [ ] Update create-assessment-dialog.tsx
- [ ] Update gradebook pages
- [ ] Test grading module thoroughly

### Phase 3: Conditional Logic Updates
- [ ] Review lib/api for any conditional/utility functions
- [ ] Port those to api2 if needed
- [ ] Update any query key factories

### Phase 4: Medium Priority (Student, Enrollment, Finance)
- [ ] Update student module
- [ ] Update enrollment module
- [ ] Update finance/billing module

### Phase 5: Low Priority (Others)
- [ ] Update remaining modules

### Phase 6: Cleanup
- [ ] Delete `lib/api` directory
- [ ] Delete old hooks that used lib/api
- [ ] Remove any useTenantSubdomain usage
- [ ] Update imports in shared utilities

---

## Tenant Handling Status

### ✅ Already Implemented
- `useAxiosAuth` hook creates axios instance with tenant interceptor
- Tenant is automatically injected via `X-Tenant` header
- Tenant comes from `useTenantStore`

### ✅ No Changes Needed
- Tenant store (`store/tenant-store.ts`) - working correctly
- Tenant provider - already sets up tenant context
- Authentication - already handled by existing middleware

### ⚠️ To Verify
- Test that X-Tenant header is sent in all api2 requests
- Test tenant switching works correctly
- Verify no "subdomain undefined" errors

---

## Testing Checklist After Migration

### For Grading Module:
- [ ] Load gradebook detail page
- [ ] Verify section final grades API returns data (not 404)
- [ ] Check network tab - X-Tenant header present
- [ ] Create assessment
- [ ] Update grade
- [ ] Filter by marking period

### For Each Module:
- [ ] List view works
- [ ] Detail view works
- [ ] Create/Edit works
- [ ] Delete works
- [ ] Filters work
- [ ] X-Tenant header present in network requests

---

## Known Issues to Watch For

1. **Query Key Changes**: api2 modules may use different query key structures
   - Solution: Check api2 module's queryKey format

2. **Response Format Differences**: api2 may return data differently
   - Solution: Review api2 hook return structure

3. **Missing Endpoints**: Some lib/api endpoints might not exist in api2
   - Solution: Check api2 modules, port if necessary

4. **Parameter Format Changes**: Parameter names or structures might differ
   - Solution: Review api2 function signatures

---

## Rollback Plan

If migration causes issues:
1. Keep `lib/api` intact initially
2. Test api2 in isolated modules first
3. Only delete `lib/api` after full module testing
4. Use git branches for safe experimentation

---

## Questions to Answer

1. Are all api2 modules returning data in the same format?
2. Do query keys in api2 match expected structures?
3. Are there any lib/api utilities that api2 doesn't have?
4. Should we create a compatibility layer initially?

---

## Timeline Estimate

- Phase 1: 2-3 hours ✓
- Phase 2: 4-6 hours (depends on testing)
- Phase 3: 1-2 hours
- Phase 4: 3-4 hours
- Phase 5: 2-3 hours
- Phase 6: 1 hour

**Total: 13-19 hours** (can be parallelized)
