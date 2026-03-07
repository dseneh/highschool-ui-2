# Grading Workflow Settings Implementation

**Date:** 2024
**Feature:** Settings-aware grading workflow with configurable review and approval steps

---

## Quick Reference

### Key Features
✅ Dynamic workflow based on two settings: `require_grade_review` and `require_grade_approval`  
✅ Automatic grade state migration when settings change  
✅ Settings-aware status transitions in backend  
✅ Adaptive UI that shows only relevant actions  
✅ Full backward compatibility

### Automatic Migration
- **Disable Approval:** Submitted → Approved (auto)
- **Disable Review:** Pending/Reviewed → Submitted/Approved (auto)
- **Disable Both:** All transitional grades → Approved (auto)

### API Endpoint
```
PATCH /api/v1/settings/grading/
Body: { "require_grade_approval": false }
Response: includes grade_migrations stats
```

---

## Overview

This implementation adds support for configurable grading workflows based on two key settings:
- `require_grade_review`: Controls whether grades need to go through a review step
- `require_grade_approval`: Controls whether grades need approval before being finalized

## Workflow States

### Status Progression

**Full Workflow (both settings = true):**
```
draft → pending → reviewed → submitted → approved
```

**Without Review (require_grade_review = false):**
```
draft → pending → submitted → approved
```

**Without Approval (require_grade_approval = false):**
```
draft → pending → reviewed → submitted (final)
```

**Without Both (both settings = false):**
```
draft → pending → submitted (final)
```

---

## Backend Changes

### 1. Updated `is_valid_transition()` Function
**File:** `/backend-2/grading/utils.py`

Added parameters to make transitions settings-aware:
```python
def is_valid_transition(
    current: str, 
    target: str, 
    require_review: bool = True, 
    require_approval: bool = True
) -> bool:
```

**Key Logic Changes:**
- FROM PENDING: If review not required, allow direct transition to SUBMITTED (skip REVIEWED)
- FROM SUBMITTED: Only allow transition to APPROVED if approval is required
- Maintains backward compatibility (defaults to requiring both)

### 2. Added Helper Functions
**File:** `/backend-2/grading/utils.py`

```python
def get_grading_settings():
    """Get grading settings for current tenant"""
    
def get_workflow_settings():
    """Get workflow settings (require_review, require_approval)"""
```

### 3. Updated Status Transition Views
**Files:** `/backend-2/grading/views/grade.py`

Updated these views to use workflow settings:
- `SectionGradeStatusTransitionView`: Bulk status updates for section
- `StudentMarkingPeriodGradeStatusTransitionView`: Student-specific status updates  
- `run_validation_checks()`: Validation now respects workflow settings

**Changes:**
```python
# Get workflow settings
workflow_settings = get_workflow_settings()
require_review = workflow_settings["require_grade_review"]
require_approval = workflow_settings["require_grade_approval"]

# Use in validation
if not is_valid_transition(grade.status, target, require_review, require_approval):
    # Handle invalid transition
```

---

## Frontend Changes

### 1. Grade Entry Table
**File:** `/ezyschool-ui/components/grading/grade-entry-table.tsx`

**Changes:**
- Submit mutation now checks `require_grade_review` setting
- If review not required, submits directly to "submitted" status
- Dynamic dialog text based on workflow settings
- Dynamic button labels ("Submit for Review" vs "Submit Grades")
- Dynamic success messages

**Key Code:**
```tsx
const targetStatus = !requireReview ? "submitted" : "pending";

// Dynamic UI text
{requireReview ? "Submit for Review" : "Submit Grades"}
{requireReview 
  ? "Once submitted, the grades will be pending review."
  : requireApproval 
    ? "Once submitted, the grades will be pending approval."
    : "Once submitted, the grades will be finalized."}
```

### 2. Final Grades Table  
**File:** `/ezyschool-ui/components/grading/final-grades-table.tsx`

**Changes:**
- Added `requireReview` and `requireApproval` from grading config
- Conditionally show/hide review actions based on `require_grade_review`
- Conditionally show/hide approval actions based on `require_grade_approval`
- Updated bulk action buttons to respect settings
- Show "N/A" in Actions column when feature is disabled

**Key Code:**
```tsx
const requireReview = gradingConfig?.require_grade_review ?? true;
const requireApproval = gradingConfig?.require_grade_approval ?? true;

// Conditional rendering
{type === "review" && requireReview && (
  // Review buttons
)}

{type === "approve" && requireApproval && (
  // Approval buttons
)}
```

---

## Settings Configuration

### Grading Settings Model
**Location:** Backend `/backend-2/settings/models.py`

**Fields:**
```python
require_grade_review = models.BooleanField(
    default=True, 
    help_text="Require explicit review before grades are finalized"
)

require_grade_approval = models.BooleanField(
    default=True, 
    help_text="Require explicit approval before grades are finalized"
)
```

### Settings UI
**Location:** Frontend `/ui-2/src/app/.../grading/settings/_components/general-settings-tab.tsx`

**Toggles Available:**
- ✅ Require Grade Review
- ✅ Require Grade Approval

---

## API Response Structure

The grading configuration is included in grade data responses:

```typescript
{
  config: {
    require_grade_review: boolean,
    require_grade_approval: boolean,
    display_grade_status: boolean,
    use_letter_grades: boolean,
    // ... other settings
  }
}
```

---

## Testing Scenarios

### Scenario 1: Review Disabled (With Automatic Migration)
1. Create grades and move some to "pending" and "reviewed" status
2. Set `require_grade_review = false` in settings
3. **Expected:** All "pending" and "reviewed" grades automatically move to "submitted"
4. Teacher clicks "Submit Grades" on new grades
5. **Expected:** Grades skip from draft → pending → submitted directly
6. Review page should show "N/A" in Actions column
7. Admin can still approve if `require_grade_approval = true`

### Scenario 2: Approval Disabled (With Automatic Migration)
1. Create grades and move some to "submitted" status (awaiting approval)
2. Set `require_grade_approval = false` in settings
3. **Expected:** All "submitted" grades automatically move to "approved" (finalized)
4. Follow normal workflow: draft → pending → reviewed → submitted
5. **Expected:** Submitted becomes the final status
6. Approval page should show "N/A" in Actions column

### Scenario 3: Both Disabled (With Automatic Migration)
1. Create grades in various states: "pending", "reviewed", "submitted"
2. Set both `require_grade_review = false` and `require_grade_approval = false`
3. **Expected:**
   - All "pending" and "reviewed" grades → "approved"
   - All "submitted" grades → "approved"
4. Teacher submits new grades: draft → pending → submitted (final)
5. Both review and approval pages show "N/A"
6. No additional approvals needed

### Scenario 4: Both Enabled (Default)
1. Both settings set to `true`
2. Full workflow: draft → pending → reviewed → submitted → approved
3. All review and approval buttons visible
4. Complete multi-step workflow

### Scenario 5: Sequential Changes
1. Start with both settings enabled, have grades in "pending" status
2. Disable review first: `require_grade_review = false`
3. **Expected:** Pending grades → submitted
4. Then disable approval: `require_grade_approval = false`
5. **Expected:** Submitted grades → approved

### API Migration Response Testing
When settings change triggers migration, verify response includes:
```json
{
  "grade_migrations": {
    "performed": true,
    "grades_migrated": 42,
    "approval_migration": { ... },
    "review_migration": { ... }
  }
}

---

## Automatic Grade State Migration

### Overview
When workflow settings are changed, the system automatically migrates existing grades that are in transitional states. This ensures grades don't get "stuck" in workflow steps that are no longer required.

### Migration Logic

#### 1. Disabling Approval Requirement
**Trigger:** `require_grade_approval` changes from `true` to `false`

**Action:** All grades in "submitted" status are automatically transitioned to "approved"

**Reason:** If approval is no longer required, submitted grades should be considered finalized.

```python
# Backend automatically performs:
Grade.objects.filter(status=Grade.Status.SUBMITTED).update(
    status=Grade.Status.APPROVED,
    updated_by=request.user
)
```

#### 2. Disabling Review Requirement
**Trigger:** `require_grade_review` changes from `true` to `false`

**Action:** All grades in "pending" or "reviewed" status are automatically transitioned

**Target Status:**
- If `require_grade_approval` is still `true`: Move to "submitted" (awaiting approval)
- If `require_grade_approval` is also `false`: Move directly to "approved" (finalized)

**Reason:** If review is no longer required, grades should bypass the review step and move to the next appropriate state.

```python
# Backend automatically performs:
target_status = Grade.Status.APPROVED if not new_require_approval else Grade.Status.SUBMITTED
Grade.objects.filter(
    status__in=[Grade.Status.PENDING, Grade.Status.REVIEWED]
).update(
    status=target_status,
    updated_by=request.user
)
```

### API Response
When automatic migration occurs, the settings update API returns additional information:

```json
{
  "success": true,
  "message": "Settings updated successfully with automatic grade state migration",
  "data": {
    // ... settings data
  },
  "grade_migrations": {
    "performed": true,
    "approval_disabled": true,
    "review_disabled": false,
    "grades_migrated": 42,
    "approval_migration": {
      "grades_auto_approved": 42,
      "reason": "Approval requirement disabled - submitted grades automatically approved"
    }
  }
}
```

### User Experience

#### Backend Behavior
- ✅ Automatic: No user intervention required
- ✅ Transactional: All grades updated atomically with settings change
- ✅ Auditable: `updated_by` field tracks who changed the settings
- ✅ Informative: API response includes migration statistics

#### Frontend Display (Recommended)
After settings save, show success notification with migration details:

```tsx
// Example notification message
"Settings updated successfully. 42 grades were automatically approved 
since approval is no longer required."
```

### Migration Scenarios

**Scenario 1: Disable Approval Only**
- Setting change: `require_grade_approval: true → false`
- Grades affected: All "submitted" grades
- Result: Submitted → Approved

**Scenario 2: Disable Review Only (with approval still on)**
- Setting change: `require_grade_review: true → false`
- Grades affected: All "pending" and "reviewed" grades
- Result: Pending/Reviewed → Submitted

**Scenario 3: Disable Both Settings**
- Setting changes: Both `require_grade_review` and `require_grade_approval: true → false`
- Grades affected: All "pending", "reviewed", and "submitted" grades
- Result: 
  - Pending/Reviewed → Approved
  - Submitted → Approved

**Scenario 4: Disable Review First, Then Approval**
- First change: `require_grade_review: true → false`
  - Pending/Reviewed → Submitted
- Second change: `require_grade_approval: true → false`
  - Submitted → Approved

### Future Enhancements

### 1. Migration Confirmation Dialog (Optional)
**Location:** Settings page (before saving changes)

### 2. Workflow History
- Track status changes with timestamps
- Show audit trail for grade status transitions
- Helpful for compliance and transparency

### 3. Conditional Notifications
- Notify teachers when review is skipped
- Notify admins when approval is skipped
- Workflow-aware email templates

---

## Backward Compatibility

✅ **Full backward compatibility maintained:**
- Default values for both settings are `true` (existing behavior)
- `is_valid_transition()` has default parameters
- Frontend gracefully handles missing config (defaults to `true`)
- No breaking changes to existing APIs

---

### Files Modified

### Backend
1. `/backend-2/grading/utils.py`
   - Updated `is_valid_transition()` function
   - Added `get_grading_settings()` helper
   - Added `get_workflow_settings()` helper

2. `/backend-2/grading/views/grade.py`
   - Updated `SectionGradeStatusTransitionView`
   - Updated `StudentMarkingPeriodGradeStatusTransitionView`
   - Updated `run_validation_checks()` function
   - Added `get_workflow_settings` import

3. `/backend-2/settings/views/grading.py` ⭐ NEW
   - Added automatic grade state migration in `GradingSettingsView.patch()`
   - Migrates "submitted" grades to "approved" when approval disabled
   - Migrates "pending"/"reviewed" grades when review disabled
   - Returns migration statistics in API response

### Frontend
1. `/ezyschool-ui/components/grading/grade-entry-table.tsx`
   - Updated submit mutation to check settings
   - Dynamic dialog text and button labels
   - Settings-aware status transitions

2. `/ezyschool-ui/components/grading/final-grades-table.tsx`
   - Added `requireReview` and `requireApproval` extraction
   - Conditional rendering of review/approval actions
   - Updated bulk action buttons
   - Added dependency array fixes

---

## Configuration Example

```typescript
// Example grading config in API response
{
  "config": {
    "grading_style": "multiple_entry",
    "require_grade_review": false,      // ← Review disabled
    "require_grade_approval": true,     // ← Approval enabled
    "display_grade_status": true,
    "use_letter_grades": true,
    "allow_teacher_override": true,
    // ...
  }
}
```

**Result:** Workflow becomes `draft → pending → submitted → approved`

---

## Status

✅ **Backend Implementation:** Complete  
✅ **Backend Workflow Logic:** Complete  
✅ **Backend Automatic Migration:** Complete ⭐ NEW
✅ **Frontend Grade Entry:** Complete  
✅ **Frontend Final Grades:** Complete  
✅ **Automatic Grade State Migration:** Complete ⭐ NEW
⏳ **Settings Migration Notification (Frontend):** Recommended (future enhancement)  
⏳ **Testing:** Ready for QA

### Recent Updates
**2024 - Automatic Grade State Migration Added:**
- When `require_grade_approval` is disabled, all "submitted" grades are automatically approved
- When `require_grade_review` is disabled, all "pending"/"reviewed" grades are automatically transitioned
- API returns migration statistics showing how many grades were affected
- No user intervention required - happens automatically when settings are saved

---

## Notes

- All changes maintain full backward compatibility
- Settings default to `true` (existing behavior)
- UI gracefully adapts to workflow configuration
- No database migrations required (fields already exist)
- Ready for production deployment

---

## Support

For questions or issues, refer to:
- `SKILLS.md` - General coding patterns
- `DESIGN_SYSTEM.md` - UI/UX standards
- `TECHNICAL_PATTERNS.md` - Implementation examples
