/**
 * Centralized status color utility.
 *
 * Ported from ui-2 `statusClass` — provides consistent color mapping
 * for every status string used across students, employees, payrolls,
 * academic years, etc.
 */

/* ------------------------------------------------------------------ */
/*  Badge-style classes  (bg + text, light + dark)                     */
/* ------------------------------------------------------------------ */

const statusBadge: Record<string, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  new: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  enrolled:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  received:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",

  inactive:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  deleted:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  blocked:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  disabled:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  rejected:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  canceled:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  terminated:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  withdrawn:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  dropped:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  failed:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",

  "not enrolled":
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  suspended:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "on leave":
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  onhold:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",

  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  processed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",

  graduated:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  returning:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  reviewed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  probation:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",

  expelled:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  transferred:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  submitted:
    "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-300",

  draft:
    "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

/* ------------------------------------------------------------------ */
/*  Solid-bg dot / indicator color                                     */
/* ------------------------------------------------------------------ */

const statusDot: Record<string, string> = {
  active: "bg-green-500",
  new: "bg-green-500",
  enrolled: "bg-green-500",
  approved: "bg-green-500",
  completed: "bg-green-500",
  received: "bg-green-500",

  inactive: "bg-red-500",
  deleted: "bg-red-500",
  blocked: "bg-red-500",
  disabled: "bg-red-500",
  rejected: "bg-red-500",
  canceled: "bg-red-500",
  terminated: "bg-red-500",
  withdrawn: "bg-red-500",
  dropped: "bg-red-500",
  failed: "bg-red-500",

  "not enrolled": "bg-orange-500",
  suspended: "bg-orange-500",
  "on leave": "bg-amber-500",
  onhold: "bg-amber-500",

  pending: "bg-yellow-500",
  processed: "bg-blue-500",

  graduated: "bg-blue-500",
  returning: "bg-blue-500",
  reviewed: "bg-blue-500",
  probation: "bg-blue-500",

  expelled: "bg-purple-500",
  transferred: "bg-purple-500",
  submitted: "bg-purple-500",

  draft: "bg-gray-500",
}

/* ------------------------------------------------------------------ */
/*  Text-only color                                                    */
/* ------------------------------------------------------------------ */

const statusText: Record<string, string> = {
  active: "text-green-600 dark:text-green-400",
  new: "text-green-600 dark:text-green-400",
  enrolled: "text-green-600 dark:text-green-400",
  approved: "text-green-600 dark:text-green-400",
  completed: "text-green-600 dark:text-green-400",
  received: "text-green-600 dark:text-green-400",

  inactive: "text-red-600 dark:text-red-400",
  deleted: "text-red-600 dark:text-red-400",
  blocked: "text-red-600 dark:text-red-400",
  disabled: "text-red-600 dark:text-red-400",
  rejected: "text-red-600 dark:text-red-400",
  canceled: "text-red-600 dark:text-red-400",
  terminated: "text-red-600 dark:text-red-400",
  withdrawn: "text-red-600 dark:text-red-400",
  dropped: "text-red-600 dark:text-red-400",
  failed: "text-red-600 dark:text-red-400",

  "not enrolled": "text-orange-600 dark:text-orange-400",
  suspended: "text-orange-600 dark:text-orange-400",
  "on leave": "text-amber-600 dark:text-amber-400",
  onhold: "text-amber-600 dark:text-amber-400",

  pending: "text-yellow-600 dark:text-yellow-400",
  processed: "text-blue-600 dark:text-blue-400",

  graduated: "text-blue-600 dark:text-blue-400",
  returning: "text-blue-600 dark:text-blue-400",
  reviewed: "text-blue-600 dark:text-blue-400",
  probation: "text-blue-600 dark:text-blue-400",

  expelled: "text-purple-600 dark:text-purple-400",
  transferred: "text-purple-600 dark:text-purple-400",
  submitted: "text-purple-600 dark:text-purple-400",

  draft: "text-gray-600 dark:text-gray-400",
}

/* ------------------------------------------------------------------ */
/*  Border color                                                       */
/* ------------------------------------------------------------------ */

const statusBorder: Record<string, string> = {
  active: "border-green-300 dark:border-green-700",
  enrolled: "border-green-300 dark:border-green-700",
  approved: "border-green-300 dark:border-green-700",
  completed: "border-green-300 dark:border-green-700",
  received: "border-green-300 dark:border-green-700",

  inactive: "border-red-300 dark:border-red-700",
  deleted: "border-red-300 dark:border-red-700",
  blocked: "border-red-300 dark:border-red-700",
  terminated: "border-red-300 dark:border-red-700",
  withdrawn: "border-red-300 dark:border-red-700",
  dropped: "border-red-300 dark:border-red-700",
  failed: "border-red-300 dark:border-red-700",

  "not enrolled": "border-orange-300 dark:border-orange-700",
  suspended: "border-orange-300 dark:border-orange-700",
  "on leave": "border-amber-300 dark:border-amber-700",
  onhold: "border-amber-300 dark:border-amber-700",

  pending: "border-yellow-300 dark:border-yellow-700",
  processed: "border-blue-300 dark:border-blue-700",

  graduated: "border-blue-300 dark:border-blue-700",
  returning: "border-blue-300 dark:border-blue-700",
  probation: "border-blue-300 dark:border-blue-700",

  expelled: "border-purple-300 dark:border-purple-700",
  transferred: "border-purple-300 dark:border-purple-700",

  draft: "border-gray-300 dark:border-gray-700",
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_BADGE  = "bg-muted text-muted-foreground"
const DEFAULT_DOT    = "bg-muted-foreground"
const DEFAULT_TEXT   = "text-muted-foreground"
const DEFAULT_BORDER = "border-border"

/* ------------------------------------------------------------------ */
/*  Public helpers                                                     */
/* ------------------------------------------------------------------ */

function normalize(status: string | undefined | null): string {
  return (status ?? "").toLowerCase().trim()
}

/** Badge-style class string (bg + text, light + dark) */
export function getStatusBadgeClass(status: string | undefined | null): string {
  return statusBadge[normalize(status)] ?? DEFAULT_BADGE
}

/** Solid dot / indicator color */
export function getStatusDotClass(status: string | undefined | null): string {
  return statusDot[normalize(status)] ?? DEFAULT_DOT
}

/** Text-only color */
export function getStatusTextClass(status: string | undefined | null): string {
  return statusText[normalize(status)] ?? DEFAULT_TEXT
}

/** Border color */
export function getStatusBorderClass(status: string | undefined | null): string {
  return statusBorder[normalize(status)] ?? DEFAULT_BORDER
}

/** Combined: badge bg+text + border (for outlined status pills) */
export function getStatusPillClass(status: string | undefined | null): string {
  const s = normalize(status)
  return `${statusBadge[s] ?? DEFAULT_BADGE} ${statusBorder[s] ?? DEFAULT_BORDER}`
}
