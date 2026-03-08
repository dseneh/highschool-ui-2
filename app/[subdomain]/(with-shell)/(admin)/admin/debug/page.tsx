"use client";

import { useAuthStore } from "@/store/auth-store";
import PageLayout from "@/components/dashboard/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Mail, Key } from "lucide-react";

export default function AdminAuthDebugPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <PageLayout
      title="Authentication Debug"
      description="Check your authentication status and user information"
    >

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Authenticated</p>
              <Badge variant={isAuthenticated ? "success" : "destructive"}>
                {isAuthenticated ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">User Role</p>
              <Badge variant={user?.role === "superadmin" ? "success" : "secondary"}>
                {user?.role || "No role"}
              </Badge>
            </div>
          </div>

          {user && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold">User Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-mono">{user.username || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono">{user.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Key className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-mono">{user.role || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="mb-2 font-semibold">Raw User Object</h3>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="flex gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
              Go to Dashboard
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>To access the admin interface, you need:</p>
          <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
            <li>
              <code className="rounded bg-muted px-1 py-0.5">isAuthenticated</code> must be{" "}
              <code className="rounded bg-muted px-1 py-0.5">true</code>
            </li>
            <li>
              <code className="rounded bg-muted px-1 py-0.5">user.role</code> must be{" "}
              <code className="rounded bg-muted px-1 py-0.5">&quot;superadmin&quot;</code>
            </li>
          </ul>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
