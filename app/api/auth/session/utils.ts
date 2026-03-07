import {buildPortableAuthConfig} from '@/lib/portable-auth-config';
import {createSessionRoute} from '@/components/portable-auth/src/server';

export async function parseCookies(req: Request, getSetCookieValues: any){
     const host = req.headers.get("host") ?? "";
        const authConfig = buildPortableAuthConfig(host);
        const sessionHandler = createSessionRoute(authConfig);
        const response = await sessionHandler(req);
    
        // Extract set-cookie header(s) if present (for token refresh)
        let setCookieValues = getSetCookieValues(response);
    
        if (setCookieValues.length > 0) {
          // Remove Domain=.localhost from the cookie string in development
          if (process.env.NODE_ENV === "development") {
            setCookieValues = setCookieValues.map((value: string) =>
              value.replace(/;\s*Domain=\.localhost/gi, ""),
            );
          }
        }
        return setCookieValues;
}