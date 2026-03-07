# Multi-Tenant Header Configuration Fix

## Problem
When accessing the API via IP address (e.g., `http://127.0.0.1:8000`), the backend rejects requests with:
```
"detail": "No tenant for hostname \"127.0.0.1\""
```

This happens because:
1. The backend's multi-tenant middleware uses hostname-based tenant detection
2. IP addresses (127.0.0.1) are not recognized as valid tenant hostnames
3. The `x-tenant` header wasn't being sent as a fallback

## Solution
Updated the `useAxiosAuth` hook to support **Option 2: Tenant Header Strategy**.

### Changes Made

**File:** `hooks/use-axios-auth.ts`

**What Changed:**
- Added import for `useAuth()` hook to access the authenticated user's tenant/workspace
- Updated the request interceptor to send `x-tenant` header using a fallback strategy:
  1. First priority: Tenant from Zustand store (subdomain-based)
  2. Fallback: Tenant from auth response (workspace field)

**Before:**
```typescript
if (tenant?.subdomain) {
  headers['x-tenant'] = tenant.subdomain
}
```

**After:**
```typescript
const { tenant: authTenant } = useAuth()

// Get tenant from store, fallback to auth workspace (for option 2: x-tenant header support)
// Priority: tenant.subdomain > authTenant?.workspace
const tenantId = tenant?.subdomain || authTenant?.workspace
if (tenantId) {
  headers['x-tenant'] = tenantId
}
```

## How It Works

### For Subdomain-Based Access (e.g., `school1.localhost:3000`)
1. URL contains subdomain: `school1`
2. Dashboard identifies subdomain and sets tenant in Zustand store
3. API requests use `x-tenant: school1` header
4. Backend receives header and switches to appropriate schema

### For IP-Based Access (e.g., `http://127.0.0.1:3000`)
1. User logs in - authentication provides `workspace` field
2. Axios hook uses `authTenant?.workspace` as fallback
3. API requests automatically include `x-tenant: <workspace>` header
4. Backend receives header and switches to appropriate schema

## Testing

### Local Development (IP-Based)
```
1. Visit: http://127.0.0.1:3000/login
2. Login with valid credentials
3. Frontend receives workspace ID from auth response
4. Subsequent API requests automatically include x-tenant header
5. Backend can now process requests using header-based tenant detection
```

### Local Development (Subdomain-Based)
```
1. Add to /etc/hosts: 127.0.0.1 school1.localhost
2. Visit: http://school1.localhost:3000/login
3. Subdomain detected and stored in tenant store
4. API requests include x-tenant header from subdomain
```

## Benefits
✅ Works with IP-based localhost access (development)
✅ Works with subdomain-based access (staging/production)
✅ Automatic fallback - no manual configuration needed
✅ Respects backend's multi-tenant architecture
✅ Maintains backward compatibility

## Related Files
- Backend: `api/core/middleware.py` - TenantMiddleware with header support
- Frontend: `hooks/use-axios-auth.ts` - HTTP client with tenant header
- Store: `store/tenant-store.ts` - Zustand tenant state management
- Auth: `components/portable-auth/src/client.ts` - Authentication context

## Notes
- The `x-tenant` header is now always sent when authenticated (if tenant ID is available)
- Both subdomain and workspace strategies are supported
- The header-based approach works with any hostname/IP configuration
