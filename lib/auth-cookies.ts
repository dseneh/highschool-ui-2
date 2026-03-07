/**
 * Clear all portable-auth cookies from the browser.
 * Called by the sidebar logout flow to ensure a clean state.
 */
export function clearAuthCookies(domain?: string): void {
  if (typeof document === "undefined") return;

  const cookieNames = ["pa_session", "ezy:tenant"];
  const paths = ["/"];
  
  // Try multiple domain variations to ensure complete cleanup
  const domains: (string | undefined)[] = [undefined];
  if (domain) {
    domains.push(domain);
    domains.push(`.${domain}`);
    
    // Also try the current host domain
    const currentHost = window.location.hostname;
    if (currentHost !== domain) {
      domains.push(currentHost);
      domains.push(`.${currentHost}`);
    }
  }

  for (const name of cookieNames) {
    for (const path of paths) {
      for (const d of domains) {
        const parts = [
          `${name}=`,
          "expires=Thu, 01 Jan 1970 00:00:00 GMT",
          `path=${path}`,
        ];
        if (d) parts.push(`domain=${d}`);
        document.cookie = parts.join("; ");
      }
    }
  }
}

/**
 * Clear ALL cookies from the browser.
 * Nuclear option for complete session cleanup.
 */
export function clearAllCookies(): void {
  if (typeof document === "undefined") return;
  
  const cookies = document.cookie.split(";");
  
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    
    // Try to delete with various domain/path combinations
    const domains = [
      undefined,
      window.location.hostname,
      `.${window.location.hostname}`,
    ];
    
    const paths = ["/", ""];
    
    for (const domain of domains) {
      for (const path of paths) {
        const parts = [
          `${name}=`,
          "expires=Thu, 01 Jan 1970 00:00:00 GMT",
        ];
        if (path) parts.push(`path=${path}`);
        if (domain) parts.push(`domain=${domain}`);
        document.cookie = parts.join("; ");
      }
    }
  }
}
