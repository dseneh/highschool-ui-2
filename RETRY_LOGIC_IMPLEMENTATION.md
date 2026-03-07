# API Retry Logic Implementation

## Problem
Backend was receiving continuous repeated requests causing 404 errors. Console logs showed `/api/v1/grading/sections/.../final-grades/` being requested multiple times without stopping, putting unnecessary load on the backend.

**Root Cause**: React Query's default retry behavior with no limit and no status code awareness was retrying indefinitely on all errors, including 404s.

## Solution
Updated [lib/api2/utils.ts](lib/api2/utils.ts) with intelligent retry configuration:

### Configuration
```typescript
const DEFAULT_QUERY_OPTIONS = {
  retry: (failureCount: number, error: any) => {
    // Max 2 retries (3 total attempts)
    if (failureCount >= 2) return false;

    // Don't retry on 4xx client errors (except 408, 429)
    const status = error?.response?.status;
    if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }

    // Retry on 5xx server errors and network errors
    return true;
  },
  retryDelay: (attemptIndex: number) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attemptIndex), 8000);
  },
};
```

### Key Features

✅ **Max 2 Retries (3 Total Attempts)**
- Initial request + 2 retries = 3 total attempts
- Prevents infinite request loops

✅ **Smart Error Handling**
- **Aborts on 4xx Client Errors**: 404, 403, 400, 401, etc.
  - These indicate a fundamental request problem (missing resource, permission denied, etc.)
  - Retrying won't fix them
- **Retries 5xx Server Errors**: Temporary server issues may resolve on retry
- **Retries Network Errors**: Connection issues are transient
- **Special Cases**: Retries 408 (timeout) and 429 (rate limit) even though they're 4xx

✅ **Exponential Backoff**
- 1st retry: 1 second delay
- 2nd retry: 2 second delay  
- Max delay: 8 seconds
- Prevents overwhelming the backend with rapid retries

### Impact

| Scenario | Before | After |
|----------|--------|-------|
| Missing endpoint (404) | ∞ retries | 3 total attempts, stops after 1st attempt |
| Permission denied (403) | ∞ retries | 3 total attempts, stops after 1st attempt |
| Server error (500) | ∞ retries | 3 total attempts (1 + 2 retries) |
| Network timeout | ∞ retries | 3 total attempts (1 + 2 retries) |

### Files Modified
- [lib/api2/utils.ts](lib/api2/utils.ts) - Added DEFAULT_QUERY_OPTIONS to `useApiQuery`

### All API calls affected
All API queries using `useGrading()`, `useStudents()`, etc. automatically get:
- Maximum 2 retries per request
- Intelligent status code handling
- Exponential backoff delays
- No configuration needed per-component

### Testing
To verify the fix is working:

1. **Monitor backend logs**: Should see fewer 404 requests
2. **Check browser console**: Network tab shows max 3 attempts per failed endpoint
3. **Performance**: Backend should experience less load from retry storms

### Related Components
- `/app/[subdomain]/(with-shell)/grading/gradebooks/` - Was triggering continuous final-grades requests
- `components/grading/final-grades-table.tsx` - Makes failing API calls
- `lib/api2/grading/` - API hooks that use `useApiQuery`

### Future Enhancements
Consider adding:
- Per-query configurable retry limits
- Circuit breaker pattern for repeated failures
- Exponential backoff with jitter
- Metrics collection on retry attempts
