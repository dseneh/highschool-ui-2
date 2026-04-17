"use client";

import type {
  EmployeeLeaveBalanceDto,
  EmployeeLeaveRequestDto,
} from "@/lib/api2/employee-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeLeaveTabProps {
  leaveBalances: EmployeeLeaveBalanceDto[] | null;
  leaveRequests: EmployeeLeaveRequestDto[] | null;
  onManageLeaves: () => void;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "approved") return <Badge>Approved</Badge>;
  if (normalized === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  if (normalized === "cancelled") return <Badge variant="outline">Cancelled</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

export function EmployeeLeaveTab({
  leaveBalances,
  leaveRequests,
  onManageLeaves,
}: EmployeeLeaveTabProps) {
  const balances = leaveBalances ?? [];
  const requests = leaveRequests ?? [];

  if (balances.length === 0 && requests.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          No leave history or balances are available for this employee yet.
        </p>
        <Button variant="outline" onClick={onManageLeaves}>
          Open Leave Management
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {balances.map((balance) => (
          <Card key={`${balance.leaveType}-${balance.leaveTypeCode || "none"}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{balance.leaveType}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {balance.accrualFrequency} accrual • {balance.year}
              </p>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Default</span>
                <span className="font-medium">{balance.defaultDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Carryover</span>
                <span className="font-medium">{balance.carriedOverDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Entitled</span>
                <span className="font-medium">{balance.entitledDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium">{balance.usedDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-semibold">{balance.remainingDays}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Leave History</h2>
          <Button variant="outline" size="sm" onClick={onManageLeaves}>
            Manage Leaves
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-medium text-muted-foreground">Type</TableHead>
                <TableHead className="font-medium text-muted-foreground">Dates</TableHead>
                <TableHead className="font-medium text-muted-foreground">Days</TableHead>
                <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="font-medium text-muted-foreground">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{request.leaveTypeName}</p>
                      {request.leaveTypeCode && (
                        <p className="text-xs text-muted-foreground">{request.leaveTypeCode}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(request.startDate)} to {formatDate(request.endDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{request.totalDays}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {request.reason || "--"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
