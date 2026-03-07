"use client";

import { DialogBox2 as DialogBox } from "@/components/ui/dialog-box2";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { StudentConcessionDto } from "@/lib/api/billing-types";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Tag, Target, DollarSign, Info, CreditCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStudentsApi } from "@/lib/api2/student/api";
import AvatarImg from "../shared/avatar-img";

interface ViewConcessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concession: StudentConcessionDto | null;
  currencySymbol?: string;
}

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function InfoRow({ icon: Icon, label, value, valueClassName = "" }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2 hover:bg-muted rounded-lg px-2">
      <div className="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <div className={`text-sm font-medium ${valueClassName}`}>{value}</div>
      </div>
    </div>
  );
}

export function ViewConcessionDialog({
  open,
  onOpenChange,
  concession,
  currencySymbol = "$",
}: ViewConcessionDialogProps) {
  const studentsApi = useStudentsApi();

  // Fetch student billing summary using api2
  const { data: billsResponse, isLoading } = useQuery<any>({
    queryKey: ["student-bills", concession?.student?.id],
    queryFn: async () => {
      if (!concession?.student?.id) return null;
      const response = await studentsApi.getStudentBillsApi(concession.student.id);
      return response.data;
    },
    enabled: open && !!concession?.student?.id,
  });

  // Extract summary from bills response
  const billingSummary = billsResponse?.summary;

  if (!concession) return null;

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      title="Concession Details"
      description="View detailed information about this concession"
      size="sm"
      cancelLabel="Close"
    >
      <div className="space-y-4 p-2">
        {/* Student Information */}
        <Card className="p-4">
            <div className="flex items-center gap-2">
            <AvatarImg className="size-10" name={concession.student?.full_name} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{concession.student?.full_name}</span>
              <span className="text-sm font-medium">{concession.student?.id_number}</span>
            </div>
            </div>
        </Card>

        {/* Concession Details */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Concession Details</h3>
          </div>
          <div className="space-y-1">
            <InfoRow
              icon={Tag}
              label="Type"
              value={
                <Badge variant="outline" className="capitalize">
                  {concession.concession_type}
                </Badge>
              }
            />
            <Separator />
            <InfoRow
              icon={Target}
              label="Target"
              value={
                <span className="capitalize">
                  {concession.target.replace(/_/g, " ")}
                </span>
              }
            />
            <Separator />
            <InfoRow
              icon={DollarSign}
              label="Value"
              value={
                concession.concession_type === "percentage"
                  ? `${concession.value}%`
                  : `${currencySymbol}${Number(concession.value).toLocaleString()}`
              }
              valueClassName="text-blue-600 font-semibold"
            />
            <Separator />
            <InfoRow
              icon={DollarSign}
              label="Concession Amount"
              value={`${currencySymbol}${Number(concession.amount || 0).toLocaleString()}`}
              valueClassName="text-purple-600 font-semibold text-base"
            />
            <Separator />
            <InfoRow
              icon={Calendar}
              label="Status"
              value={
                <Badge variant={concession.active ? "default" : "secondary"}>
                  {concession.active ? "Active" : "Inactive"}
                </Badge>
              }
            />
            {concession.notes && (
              <>
                <Separator />
                <InfoRow
                  icon={Info}
                  label="Notes"
                  value={concession.notes}
                />
              </>
            )}
          </div>
        </Card>

        {/* Student Billing Summary */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Billing Information</h3>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : billingSummary ? (
            <div className="space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Total Bill:</span>
                <span className="text-sm font-medium">
                  {currencySymbol}{Number(billingSummary.total_bill || 0).toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Total Paid:</span>
                <span className="text-sm font-medium text-green-600">
                  {currencySymbol}{Number(billingSummary.paid || 0).toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between py-2">
                <span className="text-sm font-semibold">Balance:</span>
                <span className={`text-base font-bold ${
                  Number(billingSummary.balance || 0) > 0 
                    ? "text-red-600" 
                    : "text-green-600"
                }`}>
                  {currencySymbol}{Number(billingSummary.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No billing information available for this student.
            </p>
          )}
        </Card>
      </div>
    </DialogBox>
  );
}
