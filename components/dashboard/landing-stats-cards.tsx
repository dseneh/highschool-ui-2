"use client";

import { Users, CheckCircle, CreditCard, School, User } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import type { DashboardStats, PaymentSummary } from "@/lib/api2/dashboard";

interface LandingStatsCardsProps {
  summary?: DashboardStats;
  paymentSummary?: PaymentSummary;
}

function formatNumber(value: number | undefined) {
  return (value || 0).toLocaleString();
}

function formatPercent(value: number | undefined) {
  return `${Number(value || 0).toFixed(1)}%`;
}

export function LandingStatsCards({ summary, paymentSummary }: LandingStatsCardsProps) {
  const totalStudents = Number(summary?.total_students || 0);
  const totalEnrolled = Number(summary?.total_enrolled || 0);
  const enrolledPercent = totalStudents > 0 ? (totalEnrolled / totalStudents) * 100 : 0;
  const totalStaff = Number(summary?.total_staff || 0);
  const totalTeachers = Number(summary?.total_teachers || 0);

  const statsData = [
    {
      title: "Total Students",
      value: formatNumber(totalStudents),
      subtitle: `${formatNumber(totalEnrolled)} enrolled (${enrolledPercent.toFixed(1)}%)`,
      icon: Users,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
      gradientFrom: "from-blue-500/20",
      gradientTo: "to-purple-500/20",
    },
    {
      title: "Total Staff",
      value: formatNumber(totalStaff),
      subtitle: `${formatNumber(totalTeachers)} teachers out of ${formatNumber(totalStaff)}`,
      icon: User,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600",
      gradientFrom: "from-purple-500/20",
      gradientTo: "to-pink-500/20",
    },
    {
      title: "Attendance Rate",
      value: formatPercent(summary?.avg_attendance),
      subtitle: "From recorded attendance",
      icon: CheckCircle,
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      gradientFrom: "from-emerald-500/20",
      gradientTo: "to-cyan-500/20",
    },
    {
      title: "Payment Collection",
      value: formatPercent(paymentSummary?.collection_rate),
      subtitle: "Paid vs expected",
      icon: CreditCard,
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-600",
      gradientFrom: "from-amber-500/20",
      gradientTo: "to-orange-500/20",
    },
    {
      title: "Active Classes",
      value: formatNumber(summary?.active_sections),
      subtitle: `${formatNumber(summary?.total_courses)} courses`,
      icon: School,
      bgColor: "bg-cyan-500/10",
      iconColor: "text-cyan-600",
      gradientFrom: "from-cyan-500/20",
      gradientTo: "to-blue-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statsData.map((stat) => (
        <DashboardCard
          key={stat.title}
          gradientFrom={stat.gradientFrom}
          gradientTo={stat.gradientTo}
          className="p-4"
        >
          <div className="flex items-center justify-between">
            <div className={`size-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`size-5 ${stat.iconColor}`} />
            </div>
          </div>
          
          <div className="space-y-1 mt-3">
            <p className="text-2xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
            <p className="text-xs text-muted-foreground/70">{stat.subtitle}</p>
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
