"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users, Receipt, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ConcessionStats {
  total_concessions: number;
  total_students: number;
  total_amount: number;
  average_amount: number;
  by_type?: Array<{ concession_type: string; count: number }>;
  by_target?: Array<{ target: string; count: number }>;
}

interface ConcessionStatsCardsProps {
  stats: ConcessionStats | null | undefined;
  isLoading?: boolean;
  currency?: string;
}

export function ConcessionStatsCards({
  stats,
  isLoading = false,
  currency = "$",
}: ConcessionStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      icon: Receipt,
      label: "Total Concessions",
      value: stats.total_concessions,
      color: "bg-blue-500",
      lightColor: "bg-blue-100 dark:bg-blue-900/30",
      darkColor: "dark:bg-blue-900/30",
    },
    {
      icon: Users,
      label: "Total Students",
      value: stats.total_students,
      color: "bg-purple-500",
      lightColor: "bg-purple-100 dark:bg-purple-900/30",
      darkColor: "dark:bg-purple-900/30",
    },
    {
      icon: DollarSign,
      label: "Total Amount",
      value: `${currency}${stats.total_amount.toLocaleString()}`,
      color: "bg-amber-500",
      lightColor: "bg-amber-100 dark:bg-amber-900/30",
      darkColor: "dark:bg-amber-900/30",
    },
    {
      icon: TrendingUp,
      label: "Avg Amount",
      value: `${currency}${stats.average_amount.toFixed(2)}`,
      color: "bg-cyan-500",
      lightColor: "bg-cyan-100 dark:bg-cyan-900/30",
      darkColor: "dark:bg-cyan-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div
                className={cn(
                  "p-3 rounded-lg",
                  stat.lightColor,
                  stat.darkColor
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    stat.color.replace("bg-", "text-")
                  )}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
