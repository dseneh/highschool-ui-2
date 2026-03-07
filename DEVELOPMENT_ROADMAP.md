# EzySchool v2 - Development Roadmap

> **Goal:** Build a complete, production-ready school management system that exceeds v1 in quality, performance, and user experience.

---

## 📅 Phased Implementation

### ✅ Phase 1: Foundation & Navigation (COMPLETED)

**Status:** ✓ Complete

- [x] Next.js 14 app router setup
- [x] Multi-tenant subdomain routing
- [x] Context-aware navigation system
- [x] Accordion sidebar with smooth animations
- [x] URL-based menu persistence
- [x] Authentication flow (public search → tenant selection → login)
- [x] Multi-field login (email/phone/ID)
- [x] API client configuration (localhost:8000/api/v1)
- [x] Tenant context management

---

### ✅ Phase 2: Core Student Management (NEARLY COMPLETE)

**Current Status:** ~95% Complete

#### ✅ Completed
- [x] Student type definitions (StudentDto, commands, params)
- [x] Student API service (CRUD + relationships)
- [x] React Query hooks (useStudents, useStudentDetail, mutations)
- [x] Basic student list page with API integration
- [x] Student detail page with header
- [x] Student overview tab component
- [x] **Enhanced Student List Table**
  - [x] DataTable with columns, sorting, pagination
  - [x] Search/filter functionality (StudentFilters)
  - [x] Row actions dropdown (view, enroll, delete, fix enrollment)
  - [x] Skeleton loading state (StudentTableSkeleton)
  - [x] Empty state with CTA (EmptyStudents)
- [x] **Student Forms**
  - [x] 4-step wizard form with Zod validation (student-form.tsx)
  - [x] Create + Edit modes
  - [x] Photo upload component
  - [x] Reusable form selects (GradeLevelSelect, SectionSelect, BaseDataSelect)
  - [x] Date picker integration
- [x] **Enrollment System**
  - [x] Enrollment types, service, hooks
  - [x] EnrollmentDialog (enroll + re-enroll modes)
  - [x] EnrollmentAlert + EnrollmentForm
  - [x] Fix Enrollment in student settings page
- [x] **Student Detail Tabs** (all 8 nested pages built)
  - [x] Overview tab (stats cards, charts, personal info)
  - [x] Details tab (editable fields)
  - [x] Grades tab (marking period selector, dual chart cards, Excel-style table)
  - [x] Billing tab (fees, payments)
  - [x] Attendance tab
  - [x] Schedule tab
  - [x] Reports tab
  - [x] Settings tab (with danger zone + fix enrollment)
- [x] **Student Actions**
  - [x] Delete student dialog
  - [x] Enroll / Fix enrollment actions
  - [x] useStudentPageActions hook
- [x] **Shared UI Components Built**
  - [x] EmptyState (reusable, icon + message + CTA)
  - [x] PageHeader (title, description, action slot)
  - [x] Styled toast helper (showToast with success/error/warning/info)
  - [x] Searchable combobox (BaseDataSelect with searchable prop)

#### ✅ Recently Wired (This Sprint)
- [x] **Attendance tab** — wired to `students/<enrollment_id>/attendance/` (uses enrollment ID, not student ID)
- [x] **Billing tab** — wired to `students/<id>/bills/` + `bill-summary/` + `transactions/students/<id>/`
- [x] **Reports tab** — wired with PDF report card download via grading API
- [x] **Enrollment dialog** — checkbox confirmation for re-enrollment

#### ✅ Backend + Frontend Wired (This Sprint)
- [x] **Contacts tab** — Django `StudentContact` model + serializer + views + full CRUD frontend page
- [x] **Guardians tab** — Django `StudentGuardian` model + serializer + views + full CRUD frontend page
- [x] **Schedule tab** — Fixed `SectionScheduleSerializer` (nested objects) + real schedule page with weekly columns
- [x] **Sidebar navigation** — Added Contacts + Guardians nav items to student detail context

#### 🔄 Remaining
- [ ] **Student Actions — Remaining** (Priority: MEDIUM)
  - [ ] Withdraw student dialog
  - [ ] Print student ID card
  - [ ] Export student data
  - [ ] Send notification
  - [ ] Bulk selection with actions

---

### 📌 Phase 3: Shared Components Library

**Status:** Partially Complete (many built during Phase 2)

- [x] **Core Components (Built)**
  - [x] PageHeader (title, description, actions)
  - [x] EmptyState (icon, message, CTA)
  - [x] SkeletonLoader (table variant: StudentTableSkeleton)
  - [x] ConfirmDialog (delete dialog)
  - [x] SearchInput (in student filters)
  - [x] DatePicker (shadcn calendar integration)
  - [x] BaseDataSelect (searchable combobox)
  - [x] Styled toast system (showToast helper)

- [ ] **Core Components (Remaining)**
  - [ ] DataTable as a fully generic reusable component
  - [ ] ErrorDisplay (with retry)
  - [ ] DateRangePicker
  - [ ] MultiSelect

- [x] **Layout Components (Built)**
  - [x] PageContent / PageHeader
  - [x] Dashboard shell with sidebar

- [ ] **Permission Components**
  - [ ] PermissionGuard (route protection)
  - [ ] PermissionButton (show/hide based on permissions)
  - [ ] usePermission hook

---

### 👥 Phase 4: Staff Management

**Status:** Not Started

- [ ] Staff type definitions
- [ ] Staff API service
- [ ] Staff hooks
- [ ] Staff list with table
- [ ] Staff detail pages
- [ ] Staff forms (create/edit)
- [ ] Role assignment
- [ ] Permission management
- [ ] Staff attendance tracking
- [ ] Salary management

---

### ⚙️ Phase 4.5: Academic Configuration & Setup

**Status:** In Progress

#### ✅ Completed
- [x] **Grade Level Management**
  - [x] Grade Level types (Create/Update commands)
  - [x] Grade Level service (CRUD operations)
  - [x] Grade Level hooks with mutations
  - [x] Grade Level tab component
  - [x] Grade Level list page with DataTable
  - [x] Create/Edit/Delete dialogs

#### 🔄 Next Modules
- [ ] **Section Management**
  - [ ] Section types and commands
  - [ ] Section service functions
  - [ ] Section mutation hooks
  - [ ] Section tab component with CRUD UI
  
- [ ] **Subject Management**
  - [ ] Subject types and commands
  - [ ] Subject service functions
  - [ ] Subject mutation hooks
  - [ ] Subject tab component
  
- [ ] **Academic Year Management**
  - [ ] Academic Year types and commands
  - [ ] Academic Year service functions
  - [ ] Academic Year mutation hooks
  - [ ] Academic Year tab component
  
- [ ] **Semester Management**
  - [ ] Semester types and commands
  - [ ] Semester service functions
  - [ ] Semester mutation hooks
  - [ ] Semester tab component
  
- [ ] **Marking Period Management**
  - [ ] Marking Period types and commands
  - [ ] Marking Period service functions
  - [ ] Marking Period mutation hooks
  - [ ] Marking Period tab component
  
- [ ] **Payment Installment Management**
  - [ ] Installment types and commands
  - [ ] Installment service functions
  - [ ] Installment mutation hooks
  - [ ] Installment tab component
  
- [ ] **Payment Method Management**
  - [ ] Payment Method types and commands
  - [ ] Payment Method service functions  
  - [ ] Payment Method mutation hooks
  - [ ] Payment Method tab component
  
- [ ] **Transaction Type Management**
  - [ ] Transaction Type types and commands
  - [ ] Transaction Type service functions
  - [ ] Transaction Type mutation hooks
  - [ ] Transaction Type tab component

---

### 💰 Phase 5: Finance & Billing

**Status:** Partially Started (General Fees implemented)

- [x] **General Fee Management**
  - [x] Fee structure setup
  - [x] Fee creation/editing
  - [x] Fee synchronization to sections
  
- [ ] **Remaining Finance**
  - [ ] Fee category management
  - [ ] Student fee assignment
  - [ ] Bulk fee application
  
- [ ] **Transactions**
  - [ ] Payment recording
  - [ ] Invoice generation
  - [ ] Receipt printing
  - [ ] Payment history
  - [ ] Outstanding balances
  
- [ ] **Financial Reports**
  - [ ] Revenue reports
  - [ ] Outstanding fees report
  - [ ] Payment trends
  - [ ] Expense tracking
  
- [ ] **Payroll** (if applicable)
  - [ ] Salary structure
  - [ ] Payroll processing
  - [ ] Payslip generation

---

### 📚 Phase 6: Advanced Academic Management

**Status:** Not Started

- [ ] **Subjects & Curriculum**
  - [ ] Curriculum planning
  - [ ] Learning standards
  
- [ ] **Grading System**
  - [ ] Grade input interface
  - [ ] Grade calculation rules
  - [ ] Report card generation
  - [ ] Progress tracking
  
- [ ] **Timetable**
  - [ ] Schedule builder
  - [ ] Period management
  - [ ] Room allocation
  - [ ] Teacher assignments

---

### 📊 Phase 7: Analytics & Reports

**Status:** Not Started

- [ ] **Dashboard**
  - [ ] Enrollment statistics
  - [ ] Financial overview
  - [ ] Attendance trends
  - [ ] Academic performance metrics
  
- [ ] **Reports**
  - [ ] Student reports
  - [ ] Academic reports
  - [ ] Financial reports
  - [ ] Attendance reports
  - [ ] Custom report builder
  
- [ ] **Data Visualization**
  - [ ] Charts and graphs
  - [ ] Interactive dashboards
  - [ ] Export capabilities (PDF, Excel)

---

### ⚙️ Phase 8: System Administration

**Status:** Not Started

- [ ] **Tenant Management**
  - [ ] Tenant settings
  - [ ] Multi-school support
  - [ ] Branding customization
  
- [ ] **User Management**
  - [ ] User accounts
  - [ ] Role management
  - [ ] Permission matrix
  - [ ] Activity logs
  
- [ ] **System Settings**
  - [ ] Academic year setup
  - [ ] Term/semester configuration
  - [ ] Holidays calendar
  - [ ] Notification templates
  
- [ ] **Data Management**
  - [ ] Import/export tools
  - [ ] Bulk operations
  - [ ] Data cleanup
  - [ ] Backup/restore

---

### 🎨 Phase 9: Polish & Optimization

**Status:** Not Started

- [ ] **Performance**
  - [ ] Code splitting optimization
  - [ ] Image optimization
  - [ ] Bundle size analysis
  - [ ] Core Web Vitals optimization
  
- [ ] **Accessibility**
  - [ ] Keyboard navigation audit
  - [ ] Screen reader testing
  - [ ] ARIA labels review
  - [ ] Color contrast fixes
  
- [ ] **Mobile Experience**
  - [ ] Responsive layout review
  - [ ] Touch interactions
  - [ ] Mobile navigation
  - [ ] PWA capabilities
  
- [ ] **Error Handling**
  - [ ] Global error boundary
  - [ ] 404 page
  - [ ] 500 page
  - [ ] Network error handling
  
- [ ] **Documentation**
  - [ ] User guide
  - [ ] Admin manual
  - [ ] API documentation
  - [ ] Component storybook

---

## 🎯 Current Sprint: Backend Models for Contacts/Guardians + Staff Module Prep

### Immediate Priorities

#### 1. Backend: Create Missing Models (Priority: HIGH — blocks frontend)
- [ ] **Contact model** — `students/models.py` needs `StudentContact` (name, relationship, phone, email, is_emergency, is_primary)
- [ ] **Guardian model** — `students/models.py` needs `StudentGuardian` (name, relationship, phone, email, occupation, address)
- [ ] **Contact/Guardian API** — serializers, views, URL routes
- [ ] **Schedule serializer** — rewrite to return nested objects (subject name, period, room) instead of raw UUIDs

#### 2. Frontend: Wire Contacts/Guardians/Schedule (Priority: HIGH — after backend)
- [ ] **Contacts tab** — types, service, hooks, CRUD UI
- [ ] **Guardians tab** — types, service, hooks, CRUD UI
- [ ] **Schedule tab** — types, service, hooks, timetable display

#### 3. Student Bulk Actions (Priority: MEDIUM)
- [ ] Bulk selection checkboxes in student table
- [ ] Bulk delete action
- [ ] Bulk export to CSV/Excel

#### 4. Staff Module Kickoff (Priority: MEDIUM)
- [ ] Staff type definitions
- [ ] Staff API service
- [ ] Staff React Query hooks
- [ ] Staff list page with table
- [ ] Staff detail pages (reuse sidebar context nav pattern)

---

## 📊 Success Metrics

### Technical Metrics
- **Type Coverage:** 100% (no `any` types)
- **Test Coverage:** > 80%
- **Lighthouse Score:** > 90
- **Bundle Size:** < 500KB initial load
- **API Response Time:** < 500ms p95

### User Experience Metrics
- **Time to First Byte:** < 600ms
- **First Contentful Paint:** < 1.8s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1

### Quality Metrics
- **TypeScript Errors:** 0
- **ESLint Warnings:** 0
- **Console Errors:** 0
- **Broken Links:** 0
- **Accessibility Score:** > 95

---

## 🚀 Deployment Strategy

### Environments

1. **Development** (localhost:3000)
   - Live reload
   - Debug tools enabled
   - Mock data available

2. **Staging** (staging.ezyschool.com)
   - Production build
   - Test data
   - QA testing

3. **Production** (ezyschool.com)
   - Optimized build
   - Real data
   - Monitoring enabled

### Release Cycle

- **Sprint Length:** 2 weeks
- **Release Frequency:** Bi-weekly
- **Hotfix Process:** < 24 hours for critical bugs

---

## 📝 Notes & Decisions

### Architecture Decisions
1. **React Query over Redux:** Simplifies server state management
2. **URL State for Filters:** Enables shareable links, back button support
3. **Feature-Based Folders:** Better organization than type-based
4. **Zod for Validation:** Type-safe schemas, reusable
5. **Server Components When Possible:** Better performance

### Design Decisions
1. **Accordion Navigation:** Cleaner than flat menu
2. **Context-Aware Menus:** Reduces cognitive load
3. **Inline Editing Where Possible:** Fewer clicks
4. **Optimistic Updates:** Faster perceived performance
5. **Progressive Disclosure:** Show key info first

### API Design Decisions
1. **RESTful Endpoints:** Standard CRUD operations
2. **Pagination:** Always paginate lists
3. **Filtering:** Query params for filters
4. **Sorting:** Sort param with field and direction
5. **Tenant Header:** x-tenant for multi-tenancy

---

## 🤝 Contributing Guidelines

1. **Branch Naming:** `feature/student-list`, `fix/login-bug`
2. **Commit Messages:** `feat(students): add bulk delete action`
3. **PR Template:** Description, screenshots, testing steps
4. **Code Review:** Required for all changes
5. **Testing:** Write tests for new features

---

**Last Updated:** February 15, 2026  
**Current Phase:** Phase 2 - Core Student Management (~90% complete)  
**Next Up:** Wire remaining student detail tabs → Staff module kickoff
