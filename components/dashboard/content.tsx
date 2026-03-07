"use client";

import { StatsCards } from "./stats-cards";
import { FinancialOverview } from "./financial-overview";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { GradeLevelChart } from "./grade-level-chart";
import { PaymentStatusChart } from "./payment-status-chart";
import { AttendanceChart } from "./attendance-chart";
import { SectionChart } from "./section-chart";
import { PaymentSummaryChart } from "./payment-summary-chart";
import { DashboardSkeleton } from "./loading-skeleton";
import { PageContent } from "@/components/dashboard/page-content";
import type { DashboardData } from "@/lib/api2";
import { getIconByKey } from "@/lib/icon-map";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { useTenantStore } from "@/store/tenant-store";
import PageLayout from "./page-layout";

interface DashboardContentProps {
  data?: DashboardData;
  isLoading?: boolean;
  error?: unknown;
  onRefresh?: () => void;
}

export function DashboardContent({ data, isLoading, error, onRefresh }: DashboardContentProps) {
  const tenant = useTenantStore((state) => state.tenant);

  // if (isLoading) {
  //   return <DashboardSkeleton />;
  // }

  if (!data) {
    return (
        <PageLayout
          title="Dashboard"
          description={`Welcome back! Here's what's happening with ${tenant?.name || 'your school'} today.`}
          error={error}
          noData={true}
          refreshAction={onRefresh}
          loading={isLoading}
          skeleton={<DashboardSkeleton />}

        >
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertDescription>
              Unable to load dashboard data. Please try again later.
            </AlertDescription>
          </Alert>
        </PageLayout>
    );
  }

  const stats = data.stats.map((stat) => ({
    title: stat.title,
    value: stat.value,
    subtitle: stat.subtitle,
    icon: getIconByKey(stat.iconKey),
  }));

  const hasAlerts = data.alert && (data.alert.pendingLeaves > 0 || data.alert.overtimeApprovals > 0);

  return (
    <div className="flex flex-col h-full">
      {/* <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b px-3 py-1">
        <PageHeader 
          title="Dashboard" 
          description={`Welcome back! Here's what's happening with ${tenant?.name || 'your school'} today.`}
        />
      </div> */}
      
      <PageContent>
        <div className="space-y-6">
          {/* Alert Banner - Only show if there are pending actions */}
          {/* {hasAlerts && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 dark:text-amber-200">
                You have {data.alert.pendingLeaves > 0 && `${data.alert.pendingLeaves} pending leave requests`}
                {data.alert.pendingLeaves > 0 && data.alert.overtimeApprovals > 0 && ' and '}
                {data.alert.overtimeApprovals > 0 && `${data.alert.overtimeApprovals} overtime approvals`} requiring your attention.
              </AlertDescription>
            </Alert>
          )} */}

          {/* Stats Cards */}
          <StatsCards items={stats} />

          {/* Main Grid - Financial + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FinancialOverview data={data.chart} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Payment Summary - Collection Rate & Expected vs Paid */}
          {data.distributions?.paymentSummary && (
            <PaymentSummaryChart 
              data={data.distributions.paymentSummary}
              isLoading={isLoading}
            />
          )}

          {/* Distributions Row 1 */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Grade Level Distribution */}
            {data.distributions?.gradeLevel && (
              <div className="flex-1">
                <GradeLevelChart 
                  data={data.distributions.gradeLevel}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Payment Status Distribution */}
            {data.distributions?.paymentStatus && (
              <div className="flex-1">
                <PaymentStatusChart 
                  data={data.distributions.paymentStatus}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>

          {/* Distributions Row 2 */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Attendance Distribution */}
            {data.distributions?.attendance && (
              <div className="flex-1">
                <AttendanceChart 
                  data={data.distributions.attendance}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Section/Class Utilization */}
            {data.distributions?.sections && (
              <div className="flex-1">
                <SectionChart 
                  data={data.distributions.sections}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <RecentActivity employees={data.employees} />
        </div>
      </PageContent>
    </div>
  );
}
