"use client";

import PageLayout from "@/components/dashboard/page-layout";
import { Card } from "@/components/ui/card";

export default function AdminLogsPage() {
  return (
    <PageLayout
      title="Audit Logs"
      description="View system activity and audit trails"
    >
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">Audit logs coming soon</p>
        </div>
      </Card>
    </PageLayout>
  );
}
