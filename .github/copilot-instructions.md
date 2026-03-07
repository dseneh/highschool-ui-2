# GitHub Copilot Workspace Instructions

## Project Overview
EzySchool v2 - Multi-tenant school management system built with Next.js 14, React 19, TypeScript, and Tailwind CSS.

## Key Guidelines
- **Always reference SKILLS.md** for coding patterns and conventions
- **Follow DESIGN_SYSTEM.md** for UI/UX standards
- **Check DEVELOPMENT_ROADMAP.md** for current priorities
- **Review TECHNICAL_PATTERNS.md** for implementation examples

## Quality Standards
- No `any` types - full TypeScript coverage
- All async operations need loading states
- All lists need empty states
- All mutations need error handling
- All forms need Zod validation

## Architecture
- Service layer: Pure functions in `lib/api/*-service.ts`
- Hook layer: React Query in `hooks/use-*.ts`
- Components: Domain-specific in `components/[domain]/*`
- Multi-tenant: Subdomain-based with `x-tenant` header

## Current Focus
Phase 2: Enhanced Student Management - implementing DataTable with filters, sorting, pagination


## Component Library
- Using Shadcn UI components with custom theming

### Specific Note on Components

#### Button Component
The <Button></Button> component has, in addition to other props: 
  - icon
  - iconRight
  - iconLeft
  - loading
  - loadingText
  Please use them accordingly for a better ui implementation