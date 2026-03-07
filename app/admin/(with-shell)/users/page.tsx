"use client";

import { Card } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage system users and permissions
        </p>
      </div>

      {/* Placeholder */}
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">User management coming soon</p>
        </div>
      </Card>
    </div>
  );
}
