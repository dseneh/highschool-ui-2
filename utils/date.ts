/**
 * Format an ISO date string to a localized date format
 * @param dateString ISO date string
 * @param locale Locale to use for formatting (default: 'en-US')
 * @returns Formatted date string or 'N/A' if invalid
 */
export function formatDate(
  dateString: string | null | undefined,
  locale: string = "en-US"
): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "N/A";
  }
}

/**
 * Format an ISO datetime string to a localized datetime format
 * @param dateString ISO datetime string
 * @param locale Locale to use for formatting (default: 'en-US')
 * @returns Formatted datetime string or 'N/A' if invalid
 */
export function formatDateTime(
  dateString: string | null | undefined,
  locale: string = "en-US"
): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "N/A";
  }
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param dateString ISO date string
 * @param locale Locale to use for formatting (default: 'en-US')
 * @returns Relative time string or 'N/A' if invalid
 */
export function formatRelativeTime(
  dateString: string | null | undefined,
  locale: string = "en-US"
): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, "second");
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (Math.abs(diffInMinutes) < 60) {
      return rtf.format(-diffInMinutes, "minute");
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (Math.abs(diffInHours) < 24) {
      return rtf.format(-diffInHours, "hour");
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (Math.abs(diffInDays) < 30) {
      return rtf.format(-diffInDays, "day");
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (Math.abs(diffInMonths) < 12) {
      return rtf.format(-diffInMonths, "month");
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return rtf.format(-diffInYears, "year");
  } catch {
    return "N/A";
  }
}
