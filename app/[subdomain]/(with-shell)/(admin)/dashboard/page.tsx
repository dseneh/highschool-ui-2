"use client";

import PageLayout from "@/components/dashboard/page-layout";
import { Card } from "@/components/ui/card";
import StatCard from "@/components/admin/stat-card";
import { Building2, Users, Settings, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <PageLayout
      title="Dashboard"
      description="Overview of your multi-tenant system"
    >

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value="—"
          icon={Building2}
          description="All organizations"
        />
        <StatCard
          title="Active"
          value="—"
          icon={Activity}
          description="Currently active"
        />
        <StatCard
          title="Users"
          value="—"
          icon={Users}
          description="Total users"
        />
        <StatCard
          title="System Health"
          value="100%"
          icon={Settings}
          description="All systems operational"
        />
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Activity tracking coming soon
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Quick actions coming soon
        </div>
      </Card>
    </PageLayout>
  );
}
