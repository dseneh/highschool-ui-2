/**
 * Utility functions for subdomain and tenant handling
 */

// Vercel platform domains that should be treated as root domains (no subdomain extraction)
const VERCEL_PLATFORM_DOMAINS = ['.vercel.app', '.vercel.sh', '.now.sh']

function isVercelPlatformDomain(hostname: string): boolean {
    return VERCEL_PLATFORM_DOMAINS.some((domain) => hostname.endsWith(domain))
}

/**
 * Extract subdomain from hostname
 */
export function extractSubdomain(hostname: string): string | null {
    // Ignore Vercel platform domains - treat them as root domains
    // e.g., project-name.vercel.app should NOT extract "project-name" as subdomain
    if (isVercelPlatformDomain(hostname)) {
        return null
    }

    if (hostname.includes('localhost')) {
        const parts = hostname.split('.')
        if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
            return parts[0]
        }
    } else {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/^https?:\/\//, '') || ''
        if (rootDomain && hostname.endsWith(`.${rootDomain}`)) {
            const sub = hostname.replace(`.${rootDomain}`, '')
            if (sub && sub !== 'www') {
                return sub
            }
        }
    }

    return null
}

/**
 * Extract subdomain from NextRequest (for middleware)
 */
export function extractSubdomainFromRequest(request: { headers: Headers; url: string }): string | null {
    const host = request.headers.get('host') || ''
    const hostname = host.split(':')[0]

    // Handle Vercel preview deployments (tenant---branch-name.vercel.app)
    if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
        const parts = hostname.split('---')
        return parts.length > 0 ? parts[0] : null
    }

    return extractSubdomain(hostname)
}

/**
 * Extract workspace from URL path
 */
export function extractWorkspaceFromPath(pathname: string): string | null {
    const match = pathname.match(/^\/s\/([a-z0-9-]+)(?:\/|$)/i)
    return match ? match[1].toLowerCase() : null
}

/**
 * Build subdomain URL from workspace and path (for middleware)
 */
export function buildSubdomainUrl(workspace: string, pathname: string, request: { url: string; headers: Headers }): string {
    const url = new URL(request.url)
    const host = request.headers.get('host') || ''
    const hostname = host.split(':')[0]
    const port = host.includes(':') ? host.split(':')[1] : ''

    // Remove /s/[workspace] prefix from pathname
    const cleanPath = pathname.replace(`/s/${workspace}`, '') || '/'

    // Local development
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        const protocol = url.protocol
        const baseHost = hostname.includes('.localhost')
            ? hostname.split('.')[1] || 'localhost'
            : 'localhost'
        const subdomainHost = port
            ? `${workspace}.${baseHost}:${port}`
            : `${workspace}.${baseHost}`
        return `${protocol}//${subdomainHost}${cleanPath}${url.search}`
    }

    // Production
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ''
    const rootDomainFormatted = rootDomain.split(':')[0].replace(/^https?:\/\//, '')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    return `${protocol}://${workspace}.${rootDomainFormatted}${cleanPath}${url.search}`
}

/**
 * Build main domain URL (removes subdomain) - returns URL object for middleware
 */
export function buildMainDomainUrl(pathname: string, request: { url: string; headers: Headers }): URL {
    const url = new URL(request.url)
    const host = request.headers.get('host') || ''
    const hostname = host.split(':')[0]
    const port = host.includes(':') ? host.split(':')[1] : ''

    // Local development
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        const protocol = url.protocol
        let baseHost = 'localhost'

        if (hostname.includes('.localhost')) {
            const parts = hostname.split('.')
            if (parts.length > 1) {
                baseHost = parts.slice(1).join('.') || 'localhost'
            }
        }

        const mainHost = port ? `${baseHost}:${port}` : baseHost
        const mainUrl = new URL(pathname, `${protocol}//${mainHost}`)
        mainUrl.search = url.search
        return mainUrl
    }

    // Production
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ''
    const rootDomainFormatted = rootDomain.split(':')[0].replace(/^https?:\/\//, '')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const mainUrl = new URL(pathname, `${protocol}://${rootDomainFormatted}`)
    mainUrl.search = url.search
    return mainUrl
}

/**
 * Extract subdomain from current window location (client-side)
 */
export function getSubdomainFromWindow(): string | null {
    if (typeof window === 'undefined') return null

    const host = window.location.host
    const hostname = host.split(':')[0]
    return extractSubdomain(hostname)
}

/**
 * Extract subdomain from request headers (server-side)
 */
export async function getSubdomainFromHeaders(): Promise<string | null> {
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const hostname = host.split(':')[0]
    return extractSubdomain(hostname)
}

/**
 * Build main domain URL from current host (client-side)
 */
export function buildDomainUrlFromWindow(path: string): string {
    if (typeof window === 'undefined') return path

    const host = window.location.host
    const hostname = host.split(':')[0]
    const port = window.location.port ? `:${window.location.port}` : ''
    const protocol = window.location.protocol

    let mainHost = 'localhost'
    if (hostname.includes('localhost')) {
        if (hostname.includes('.localhost')) {
            const parts = hostname.split('.')
            if (parts.length > 1) {
                mainHost = parts.slice(1).join('.') || 'localhost'
            }
        }
    } else {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/^https?:\/\//, '') || hostname
        mainHost = rootDomain
    }

    return `${protocol}//${mainHost}${port}${path}`
}

/**
 * Build main domain URL from headers (server-side)
 */
export async function buildDomainUrlFromHeaders(path: string): Promise<string> {
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const hostname = host.split(':')[0]
    const port = host.includes(':') ? host.split(':')[1] : ''

    let mainHost = 'localhost'
    if (hostname.includes('localhost')) {
        if (hostname.includes('.localhost')) {
            const parts = hostname.split('.')
            if (parts.length > 1) {
                mainHost = parts.slice(1).join('.') || 'localhost'
            }
        }
    } else {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/^https?:\/\//, '') || hostname
        mainHost = rootDomain
    }

    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    return `${protocol}://${mainHost}${port ? `:${port}` : ''}${path}`
}

