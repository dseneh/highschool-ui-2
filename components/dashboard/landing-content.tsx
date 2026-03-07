"use client";

import { LandingWelcome } from "./landing-welcome";
import { LandingStatsCards } from "./landing-stats-cards";
import { EnrollmentChart } from "./enrollment-chart";
import { PaymentFlowChart } from "./payment-flow-chart";
import { PaymentDistribution } from "./payment-distribution";
import { TopStudents } from "./top-students";
import { RecentActivity } from "./recent-activity";
import type { DashboardStats, FinanceDataPoint, GradeLevelDistribution, PaymentSummary, PaymentStatusDistribution, TopStudent } from "@/lib/api2/dashboard";

interface LandingContentProps {
  summary?: DashboardStats;
  gradeLevelData?: GradeLevelDistribution[];
  financialData?: FinanceDataPoint[];
  paymentSummary?: PaymentSummary;
  paymentDistribution?: PaymentStatusDistribution[];
  topStudents?: TopStudent[];
  employees?: Array<{
    id: string;
    name: string;
    email: string;
    department: string;
    position: string;
    status: "active" | "on_leave" | "inactive";
    joinDate: string;
    avatar?: string;
  }>;
}

export function LandingContent({
  summary,
  gradeLevelData = [],
  financialData = [],
  paymentSummary,
  paymentDistribution = [],
  topStudents = [],
  employees = [],
}: LandingContentProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-6 sm:space-y-8">
          <LandingWelcome />

          <LandingStatsCards summary={summary} paymentSummary={paymentSummary} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <EnrollmentChart data={gradeLevelData} />

            <div className="space-y-6">
              <PaymentDistribution data={paymentDistribution} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PaymentFlowChart data={financialData} paymentSummary={paymentSummary} />
            </div>
            <TopStudents students={topStudents} />
          </div>

          {/* <RecentActivity employees={employees} /> */}
        </div>
      </div>
    </div>
  );
}
