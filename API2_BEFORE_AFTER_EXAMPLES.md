# API2 Migration - Before/After Examples

## Most Common Changes

### Example 1: Using Section Final Grades in grade-entry-table.tsx

**BEFORE (lib/api):**
```typescript
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSectionFinalGrades, useUpdateGrade } from "@/hooks/use-grading";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

interface GradeEntryTableProps {
  gradebook: GradebookDto;
  markingPeriodId?: string | null;
  canEdit: boolean;
}

export function GradeEntryTable({
  gradebook,
  markingPeriodId,
  canEdit,
}: GradeEntryTableProps) {
  // ❌ Need to get subdomain and pass it
  const subdomain = useTenantSubdomain();
  const updateGradeMutation = useUpdateGrade();
  
  const sectionId = gradebook.section.id;
  const academicYearId = gradebook.academic_year.id;
  const subjectId = gradebook.subject.id;

  // ❌ Complex hook with many parameters
  const { data, isLoading } = useSectionFinalGrades(sectionId, {
    academic_year: academicYearId,
    marking_period: markingPeriodId || undefined,
    data_by: "subject",
    subject: subjectId,
    include_assessment: true,
    include_average: false,
    status: "any",
  });

  const students = data?.students || [];
  // ... rest of component
}
```

**AFTER (lib/api2):**
```typescript
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useGrading } from "@/lib/api2/grading";

interface GradeEntryTableProps {
  gradebook: GradebookDto;
  markingPeriodId?: string | null;
  canEdit: boolean;
}

export function GradeEntryTable({
  gradebook,
  markingPeriodId,
  canEdit,
}: GradeEntryTableProps) {
  // ✅ No need for subdomain
  const grading = useGrading();
  
  const sectionId = gradebook.section.id;
  const academicYearId = gradebook.academic_year.id;
  const subjectId = gradebook.subject.id;

  // ✅ Simpler hook call - tenant is automatic
  const { data, isLoading } = grading.getSectionFinalGrades(
    academicYearId,
    sectionId,
    markingPeriodId || "",
    subjectId,
    "subject"
  );

  const students = data?.students || [];
  // ... rest of component (unchanged)
}
```

**Changes:**
- `-` Remove `import { useTenantSubdomain }`
- `-` Remove `import { useSectionFinalGrades }` 
- `+` Add `import { useGrading } from "@/lib/api2/grading"`
- `-` Remove `const subdomain = useTenantSubdomain()`
- `+` Add `const grading = useGrading()`
- Change `useSectionFinalGrades(sectionId, {...})` to `grading.getSectionFinalGrades(...)`
- Remove nested params object, use direct parameters

---

### Example 2: Creating an Assessment in create-assessment-dialog.tsx

**BEFORE (lib/api):**
```typescript
import { useCreateAssessment } from "@/hooks/use-grading";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradebookId: string;
}

export function CreateAssessmentDialog({
  open,
  onOpenChange,
  gradebookId,
}: CreateAssessmentDialogProps) {
  const subdomain = useTenantSubdomain();
  const createAssessmentMutation = useCreateAssessment();

  const onSubmit = async (data: CreateAssessmentCommand) => {
    try {
      await createAssessmentMutation.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      // Error handling
    }
  };

  return (
    <DialogBox open={open} onOpenChange={onOpenChange}>
      <Form onSubmit={onSubmit}>
        {/* Form fields */}
      </Form>
    </DialogBox>
  );
}
```

**AFTER (lib/api2):**
```typescript
import { useGrading } from "@/lib/api2/grading";

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradebookId: string;
}

export function CreateAssessmentDialog({
  open,
  onOpenChange,
  gradebookId,
}: CreateAssessmentDialogProps) {
  const grading = useGrading();
  const createAssessmentMutation = grading.useCreateAssessment(gradebookId);

  const onSubmit = async (data: CreateAssessmentCommand) => {
    try {
      await createAssessmentMutation.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      // Error handling (unchanged)
    }
  };

  return (
    <DialogBox open={open} onOpenChange={onOpenChange}>
      <Form onSubmit={onSubmit}>
        {/* Form fields (unchanged) */}
      </Form>
    </DialogBox>
  );
}
```

**Changes:**
- `-` Remove `import { useCreateAssessment }`
- `-` Remove `import { useTenantSubdomain }`
- `+` Add `import { useGrading } from "@/lib/api2/grading"`
- `-` Remove `const subdomain = ...`
- `+` Add `const grading = useGrading()`
- Change mutation hook call

---

### Example 3: Gradebook Navigation Hook

**BEFORE (hooks/use-grading.ts):**
```typescript
export function useSectionFinalGrades(
  sectionId: string | undefined,
  params?: {
    academic_year?: string;
    marking_period?: string;
    data_by?: "subject" | "all_subjects";
    subject?: string;
    include_assessment?: boolean;
    include_average?: boolean;
    status?: "any" | GradeStatusType;
    student?: string;
  }
) {
  const subdomain = useTenantSubdomain();

  return useQuery<SectionFinalGradesSubjectResponse>({
    queryKey: gradingKeys.sectionFinalGrades(subdomain, sectionId ?? "", params),
    queryFn: () => getSectionFinalGrades(subdomain, sectionId!, params),
    enabled: Boolean(subdomain) && Boolean(sectionId) && Boolean(params?.academic_year),
  });
}
```

**AFTER (lib/api2/grading/index.ts):**
```typescript
// Already exists! Just use it:
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
    
    // ... more hooks
    return { getSectionFinalGrades, ... }
}
```

**Changes:**
- ✅ api2 module already does all this work
- Just import and use `useGrading()` from `lib/api2/grading`
- Delete the old `hooks/use-grading.ts` (or keep as wrapper)

---

### Example 4: Service Function

**BEFORE (lib/api/grading-service.ts):**
```typescript
export async function getSectionFinalGrades(
  subdomain: string,
  sectionId: string,
  params?: {
    academic_year?: string;
    marking_period?: string;
    data_by?: "subject" | "all_subjects";
    subject?: string;
    include_assessment?: boolean;
    include_average?: boolean;
    status?: GradeStatusType | "any";
    student?: string;
  }
) {
  const { data } = await apiClient.get<
    SectionFinalGradesResponse | SectionFinalGradesSubjectResponse
  >(
    `grading/sections/${sectionId}/final-grades/`,
    { params }
  );
  return data;
}
```

**AFTER (lib/api2/grading/api.ts):**
```typescript
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
        return get(`/grading/sections/${sectionId}/final-grades/`, { params: q })
    }
    
    return { getSectionFinalGradesApi, ... }
}
```

**Changes:**
- ✅ useAxiosAuth automatically adds X-Tenant header
- ✅ No need for subdomain parameter
- ✅ Cleaner function signature
- ✅ Wrapped in React hook for React Query integration

---

## Summary Table

| Aspect | Before (lib/api) | After (lib/api2) |
|--------|-----------------|------------------|
| **Subdomain Parameter** | ❌ Required everywhere | ✅ Automatic via store |
| **Tenant Header** | Manual in service | ✅ Auto via useAxiosAuth |
| **React Query** | Manual in hooks | ✅ Already integrated |
| **Boilerplate Code** | 📏 High | ✅ Minimal |
| **Number of Imports** | Multiple | Single (useGrading) |
| **useTenantSubdomain** | Everywhere | ❌ Not needed |
| **apiClient** | Generic | ✅ Tenant-aware |
| **Error Handling** | Manual | ✅ Interceptor-based |

---

## Step-by-Step Migration for a Component

### Original Component Using lib/api:
```typescript
// OLD
import { useSectionFinalGrades } from "@/hooks/use-grading";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

export function GradesList() {
  const subdomain = useTenantSubdomain();
  const { data, isLoading } = useSectionFinalGrades(sectionId, {...params});
  
  return <div>{/* render data */}</div>;
}
```

### Migration Steps:

**Step 1: Update imports**
```typescript
// Change from:
// import { useSectionFinalGrades } from "@/hooks/use-grading";
// import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

// To:
import { useGrading } from "@/lib/api2/grading";
```

**Step 2: Update hook usage**
```typescript
export function GradesList() {
  // Remove: const subdomain = useTenantSubdomain();
  
  const grading = useGrading();
  const { data, isLoading } = grading.getSectionFinalGrades(
    academicYearId,
    sectionId,
    markingPeriodId,
    subjectId,
    "subject"
  );
  
  return <div>{/* render data */}</div>;
}
```

**Step 3: Test**
- Open DevTools Network tab
- Make request
- Verify X-Tenant header present
- Data loads correctly

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Still using old hooks
```typescript
// WRONG
import { useSectionFinalGrades } from "@/hooks/use-grading";
```

✅ **Fix:**
```typescript
// CORRECT
import { useGrading } from "@/lib/api2/grading";
const data = useGrading().getSectionFinalGrades(...)
```

### ❌ Mistake 2: Passing subdomain parameter
```typescript
// WRONG
getSectionFinalGrades(subdomain, sectionId, params)
```

✅ **Fix:**
```typescript
// CORRECT
grading.getSectionFinalGrades(
  academicYearId,
  sectionId,
  markingPeriodId,
  subjectId,
  "subject"
)
```

### ❌ Mistake 3: Forgetting "use client" directive
```typescript
// WRONG - Server component
import { useGrading } from "@/lib/api2/grading"

export function MyComponent() {
  const grading = useGrading() // ❌ Error: hooks in server component
}
```

✅ **Fix:**
```typescript
// CORRECT - Client component
"use client"

import { useGrading } from "@/lib/api2/grading"

export function MyComponent() {
  const grading = useGrading() // ✅ Works
}
```

### ❌ Mistake 4: Using old query keys
```typescript
// WRONG
queryKey: gradingKeys.sectionFinalGrades(subdomain, sectionId, params)
```

✅ **Fix:**
```typescript
// CORRECT - api2 handles this
// Just use the hook, React Query keys are managed automatically
const { data } = grading.getSectionFinalGrades(...)
```
