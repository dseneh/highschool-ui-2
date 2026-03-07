# Menu Configuration System

## Overview
The EzySchool navigation system uses a state-based approach to manage menu display based on the current route. The system automatically shows the appropriate menu (main, student, or staff) depending on the page you're viewing.

## Files Structure

```
config/
├── menu.config.json      # Menu configuration data
└── menu.schema.json      # JSON Schema for validation

types/
└── menu.types.ts         # TypeScript type definitions

components/dashboard/
└── sidebar.tsx           # Main sidebar component with menu logic
```

## Menu Types

### 1. Main Menu (Accordion)
- **Type**: `accordion`
- **Shown**: On all non-detail pages
- **Structure**: Collapsible sections organized by function
  - ACADEMIC (Students, Grading, Attendance, Classes)
  - ADMINISTRATION (Staff, Academic Setup)
  - FINANCIAL (Transactions, Billing, Reports)
  - SYSTEM (Notifications)

### 2. Student Menu (List)
- **Type**: `list`
- **Shown**: On student detail pages (`/students/[id]`)
- **Items**: Overview, Details, Grades, Billing, Attendance, Schedule, Reports, Settings

### 3. Staff Menu (List)
- **Type**: `list`
- **Shown**: On staff detail pages (`/staff/[id]`)
- **Items**: Overview, Details, Classes, Schedule, Payroll, Settings

## State Logic

### Automatic Menu Detection

```typescript
// Route → Menu mapping
/students/123      → student menu (automatic)
/staff/456         → staff menu (automatic)
/dashboard         → main menu (automatic)
/grading          → main menu (automatic)
```

### Menu State Flow

```mermaid
graph TD
    A[User navigates] --> B{Is detail page?}
    B -->|Yes /students/[id]| C[Set activeMenu = student]
    B -->|Yes /staff/[id]| D[Set activeMenu = staff]
    B -->|No| E[Set activeMenu = main]
    C --> F[Render student menu]
    D --> G[Render staff menu]
    E --> H[Render main menu]
    F --> I{Toggle clicked?}
    G --> I
    I -->|Yes| J[Switch to main menu]
    J --> K{Toggle again?}
    K -->|Yes| F
```

### Toggle Button Behavior

**On Detail Pages:**
- Showing context menu → Button says **"Back to Main Menu"** (left arrow)
- Showing main menu → Button says **"Student Menu"** or **"Staff Menu"** (right arrow)

**Not on Detail Pages:**
- No toggle button shown

## Configuration Format

### Adding a New Menu Item

Edit `config/menu.config.json`:

```json
{
  "menus": {
    "main": {
      "sections": [
        {
          "id": "section-name",
          "title": "SECTION TITLE",
          "items": [
            {
              "id": "unique-id",
              "label": "Display Name",
              "path": "/route-path",
              "icon": "IconComponentName",
              "badge": "optional",
              "description": "Optional tooltip"
            }
          ]
        }
      ]
    }
  }
}
```

### Menu Item Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `label` | string | ✅ | Display text |
| `path` | string | ✅ | Navigation route (use `{id}` for dynamic) |
| `icon` | string | ✅ | Icon component name from @hugeicons |
| `badge` | string | ❌ | Badge text (e.g., "9+") |
| `description` | string | ❌ | Tooltip or aria-label |

## Code Implementation

### State Management

```typescript
// activeMenu state determines which menu is displayed
const [activeMenu, setActiveMenu] = useState<"main" | "student" | "staff">("main");

// Auto-update based on route
useEffect(() => {
  if (isOnStudentDetail) {
    setActiveMenu("student");
  } else if (isOnStaffDetail) {
    setActiveMenu("staff");
  } else {
    setActiveMenu("main");
  }
}, [isOnStudentDetail, isOnStaffDetail, params.id]);
```

### Menu Configuration Object

```typescript
const menuConfig = {
  main: {
    isActive: activeMenu === "main",
    items: primaryNavSections,
    type: "accordion" as const,
  },
  student: {
    isActive: activeMenu === "student",
    items: contextNavItems || [],
    type: "list" as const,
  },
  staff: {
    isActive: activeMenu === "staff",
    items: contextNavItems || [],
    type: "list" as const,
  },
};
```

### Rendering Logic

```typescript
{/* Show student/staff menu when on detail page and type is list */}
{isOnDetailPage && menuConfig[activeMenu].type === "list" && (
  <StudentStaffMenu />
)}

{/* Show main menu when activeMenu is "main" */}
{menuConfig.main.isActive && (
  <MainAccordionMenu />
)}
```

## Key Features

### ✅ URL-Based State
- Menu state derives from URL (no need for localStorage)
- Refresh-safe: Always shows correct menu for current page

### ✅ Type-Safe
- Full TypeScript support with `menu.types.ts`
- JSON Schema validation for config file

### ✅ Smooth Animations
- 300ms fade/slide transitions between menu switches
- Staggered animations for list items
- Accordion collapse/expand animations

### ✅ Flexible Configuration
- Easy to add/remove menu items via JSON
- Supports dynamic paths with `{id}` placeholder
- Section-based organization for main menu

## Extending the System

### Adding a New Context Menu (e.g., Parent)

1. **Update menu.config.json:**
```json
{
  "menus": {
    "parent": {
      "id": "parent",
      "label": "Parent Menu",
      "type": "list",
      "contextType": "parent",
      "items": [...]
    }
  }
}
```

2. **Update sidebar.tsx:**
```typescript
const [activeMenu, setActiveMenu] = useState<"main" | "student" | "staff" | "parent">("main");

// Add detection logic
const isOnParentDetail = !!params.id && pathname?.includes('/parents/');

// Update effect
useEffect(() => {
  if (isOnStudentDetail) {
    setActiveMenu("student");
  } else if (isOnStaffDetail) {
    setActiveMenu("staff");
  } else if (isOnParentDetail) {
    setActiveMenu("parent");
  } else {
    setActiveMenu("main");
  }
}, [isOnStudentDetail, isOnStaffDetail, isOnParentDetail, params.id]);
```

3. **Update menu.types.ts:**
```typescript
export type ActiveMenu = "main" | "student" | "staff" | "parent";
```

## Testing

### Manual Testing Checklist

- [ ] Navigate to `/students/1` → Student menu shows
- [ ] Click "Back to Main Menu" → Main accordion shows, button changes to "Student Menu"
- [ ] Click "Student Menu" → Student menu returns
- [ ] Refresh page while on student detail → Correct menu persists
- [ ] Navigate to different student → Menu resets to student menu
- [ ] Navigate away from detail page → Main menu shows, toggle button disappears
- [ ] Repeat for staff pages
- [ ] Test all accordion sections expand/collapse
- [ ] Verify animations are smooth

## Troubleshooting

### Menu not switching on route change
- Check that `params.id` is being read correctly
- Verify pathname includes checking is accurate
- Ensure useEffect dependencies include `params.id`

### Toggle button not showing
- Verify `isOnDetailPage` returns true
- Check that route matches pattern `/students/[id]` or `/staff/[id]`

### Icons not displaying
- Ensure icon name matches component export from @hugeicons
- Check that icon is imported in navigation.ts

---

**Last Updated:** February 10, 2026  
**Version:** 1.0.0
