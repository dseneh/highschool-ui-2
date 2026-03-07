"use client";

import { Card } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings
        </p>
      </div>

      {/* Placeholder */}
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">System settings coming soon</p>
        </div>
      </Card>
    </div>
  );
}
