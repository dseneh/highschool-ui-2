"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, FileText, ShieldCheck } from "lucide-react";
import { StatsCards, type StatsCardItem } from "@/components/shared/stats-cards";
import { EmployeeSubpageShell } from "@/components/employees/employee-subpage-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployeeDocuments } from "@/hooks/use-employee-documents";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

function formatDate(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmployeeDocumentsDetailPage() {
  const params = useParams<{ id_number: string }>();
  const router = useRouter();
  const subdomain = useTenantSubdomain();
  const employeeId = params.id_number;
  const { data: documents = [] } = useEmployeeDocuments({ employeeId });

  const stats = React.useMemo<StatsCardItem[]>(() => {
    const valid = documents.filter((item) => item.complianceStatus.toLowerCase() === "valid").length;
    const expiring = documents.filter((item) => item.complianceStatus.toLowerCase() === "expiring soon").length;
    const expired = documents.filter((item) => item.complianceStatus.toLowerCase() === "expired").length;

    return [
      { title: "Documents", value: String(documents.length), subtitle: "Total files on record", icon: FileText },
      { title: "Valid", value: String(valid), subtitle: "Currently compliant", icon: ShieldCheck },
      { title: "Expiring", value: String(expiring), subtitle: "Due for renewal soon", icon: CalendarClock },
      { title: "Expired", value: String(expired), subtitle: "Need immediate action", icon: AlertTriangle },
    ];
  }, [documents]);

  return (
    <EmployeeSubpageShell
      title="Documents"
      description="Track certificates, contracts, IDs, and compliance documents."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push(subdomain ? `/${subdomain}/employee-documents` : "/employee-documents")}
        >
          Open Document Registry
        </Button>
      }
    >
      {() => (
        <div className="space-y-6">
          <StatsCards items={stats} className="xl:grid-cols-4" />

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No document records exist for this employee yet.</p>
              ) : (
                documents.slice(0, 8).map((document) => (
                  <div key={document.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{document.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {document.documentType} • Expires {formatDate(document.expiryDate)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{document.complianceStatus}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </EmployeeSubpageShell>
  );
}
