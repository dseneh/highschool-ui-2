export type TenantContext = {
  /** A human-friendly workspace identifier, e.g. "dujar" */
  workspace: string;
  /** Optional schema/domain/etc */
  domain?: string;
};

export type JwtPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = Record<string, any>;

export type AuthSession = {
  tenant: TenantContext;
  user: AuthUser | null;
  tokens: JwtPair | null;
  /** Unix seconds when access token expires (if decodable) */
  accessExp?: number | null;
};

export type LoginInput = {
  workspace: string;
  /** Anything your backend needs: email/password, username/password, OTP, etc. */
  credentials: Record<string, any>;
};

export type BackendAuthConfig = {
  /** Your backend base URL, e.g. https://api.example.com */
  baseUrl: string;
  /** Path for workspace lookup, e.g. /api/v1/tenants/ */
  tenantLookupPath?: string;
  /** Path for login, e.g. /api/v1/auth/login/ */
  loginPath: string;
  /** Path for refresh, e.g. /api/v1/auth/refresh/ */
  refreshPath: string;
  /** Path for logout (optional) */
  logoutPath?: string;

  /**
   * Build request headers for the backend (e.g., tenant header).
   * Called on server-side calls from route handlers.
   */
  buildHeaders?: (tenant: TenantContext) => Record<string, string>;

  /**
   * Parse backend login response into {tokens, user}.
   * You MUST return tokens. User is optional.
   */
  parseLoginResponse: (data: any) => { tokens: JwtPair; user?: AuthUser | null };

  /**
   * Parse backend refresh response into tokens.
   */
  parseRefreshResponse: (data: any) => { tokens: JwtPair };
};

export type CookieSecurity = {
  /** Cookie name. Default: "pa_session" */
  name?: string;
  /**
   * Secret used to encrypt cookie content. Must be long & random.
   * Recommend 32+ chars.
   */
  secret: string;
  /** Cookie domain, if needed (e.g. ".example.com" for subdomains). */
  domain?: string;
  /** Default: "/" */
  path?: string;
  /** Default: true in production. */
  secure?: boolean;
  /** Default: true */
  httpOnly?: boolean;
  /** Default: "Lax" */
  sameSite?: "Lax" | "Strict" | "None";
  /**
   * Max age in seconds. Default: 30 days.
   * Note: actual session validity is driven by refresh token lifetime.
   */
  maxAgeSeconds?: number;
};

export type PortableAuthConfig = {
  backend: BackendAuthConfig;
  cookie: CookieSecurity;

  /**
   * If your frontend is multi-tenant by subdomain, you can provide a resolver.
   * If not provided, tenant is taken from LoginInput.workspace and stored in session.
   */
  resolveTenantFromRequest?: (req: Request) => Promise<TenantContext | null> | TenantContext | null;

  /**
   * Called after successful login & session creation, to normalize user payload.
   * e.g. map backend fields into the shape your app expects.
   */
  normalizeUser?: (user: AuthUser | null, tenant: TenantContext) => AuthUser | null;

  /**
   * Called on every session read. Lets you enforce tenant status, user status, etc.
   * Throw to reject session.
   */
  validateSession?: (session: AuthSession) => Promise<void> | void;
};
